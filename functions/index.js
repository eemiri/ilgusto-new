/**
 * Cloud Functions for Il Gusto Restaurant
 * Contact Form with Security Features
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

admin.initializeApp();

const app = express();

// Configure CORS
const corsOptions = {
  origin: [
    'https://il-gusto-3cb3c.web.app',
    'https://il-gusto-3cb3c.firebaseapp.com',
    'https://ilgusto-sb.de',
    'https://www.ilgusto-sb.de',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email configuration
const EMAIL_CONFIG = {
  contactEmail: 'mail@ilgusto-sb.de',
  fromEmail: 'noreply@ilgusto-sb.de',
  subjectPrefix: 'Webseite Kontaktformular: '
};

// Rate limiting using Firestore
const RATE_LIMIT = {
  requests: 3,
  window: 3600000 // 1 hour in milliseconds
};

/**
 * Generate CSRF token
 */
app.get('/api/get-csrf-token', async (req, res) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenId = crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + 3600000; // 1 hour

    // Store token in Firestore
    await admin.firestore().collection('csrf_tokens').doc(tokenId).set({
      token: token,
      expiresAt: expiresAt,
      createdAt: Date.now()
    });

    res.json({
      success: true,
      csrf_token: token,
      token_id: tokenId
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Generieren des Sicherheitstokens.'
    });
  }
});

/**
 * Validate CSRF token
 */
async function validateCSRFToken(token, tokenId) {
  if (!token || !tokenId) {
    return false;
  }

  try {
    const tokenDoc = await admin.firestore().collection('csrf_tokens').doc(tokenId).get();

    if (!tokenDoc.exists) {
      return false;
    }

    const data = tokenDoc.data();

    // Check if token is expired
    if (Date.now() > data.expiresAt) {
      // Delete expired token
      await tokenDoc.ref.delete();
      return false;
    }

    // Validate token
    const isValid = crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(data.token)
    );

    // Delete token after validation (one-time use)
    if (isValid) {
      await tokenDoc.ref.delete();
    }

    return isValid;
  } catch (error) {
    console.error('Error validating CSRF token:', error);
    return false;
  }
}

/**
 * Check rate limiting
 */
async function checkRateLimit(ip) {
  try {
    const rateLimitDoc = await admin.firestore().collection('rate_limits').doc(ip).get();

    if (!rateLimitDoc.exists) {
      // First request from this IP
      await admin.firestore().collection('rate_limits').doc(ip).set({
        count: 1,
        startTime: Date.now()
      });
      return true;
    }

    const data = rateLimitDoc.data();
    const elapsed = Date.now() - data.startTime;

    // Reset if window has passed
    if (elapsed > RATE_LIMIT.window) {
      await admin.firestore().collection('rate_limits').doc(ip).set({
        count: 1,
        startTime: Date.now()
      });
      return true;
    }

    // Check if limit exceeded
    if (data.count >= RATE_LIMIT.requests) {
      return false;
    }

    // Increment counter
    await admin.firestore().collection('rate_limits').doc(ip).update({
      count: admin.firestore.FieldValue.increment(1)
    });

    return true;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return true; // Allow on error
  }
}

/**
 * Sanitize input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove null bytes, carriage returns, and newlines
  let sanitized = input.replace(/[\0\r\n]/g, '');
  // Trim whitespace
  sanitized = sanitized.trim();
  return sanitized;
}

/**
 * Validate email
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  // Check for email header injection patterns
  const blacklist = ['content-type:', 'bcc:', 'cc:', 'to:', 'from:'];
  const emailLower = email.toLowerCase();

  for (const pattern of blacklist) {
    if (emailLower.includes(pattern)) {
      return false;
    }
  }

  return true;
}

/**
 * Create email transporter
 * Note: You'll need to configure this with your actual email service
 */
function createTransporter() {
  // Option 1: Using SMTP (you'll need to configure this)
  // Uncomment and configure with your SMTP settings
  /*
  return nodemailer.createTransport({
    host: 'smtp.your-provider.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@example.com',
      pass: 'your-password'
    }
  });
  */

  // Option 2: Using Gmail (requires App Password)
  // Uncomment and configure if using Gmail
  /*
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-gmail@gmail.com',
      pass: 'your-app-password'
    }
  });
  */

  // Placeholder - will need to be configured
  return null;
}

/**
 * Contact form submission
 */
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message, website, csrf_token, token_id } = req.body;
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;

    // Check rate limiting
    const rateLimitOk = await checkRateLimit(clientIp);
    if (!rateLimitOk) {
      console.warn('Rate limit exceeded for IP:', clientIp);
      return res.status(429).json({
        success: false,
        message: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.'
      });
    }

    // Validate CSRF token
    const csrfValid = await validateCSRFToken(csrf_token, token_id);
    if (!csrfValid) {
      console.warn('CSRF validation failed for IP:', clientIp);
      return res.status(403).json({
        success: false,
        message: 'Sicherheitsvalidierung fehlgeschlagen. Bitte laden Sie die Seite neu.'
      });
    }

    // Check honeypot
    if (website && website.trim() !== '') {
      console.warn('Honeypot triggered for IP:', clientIp);
      // Return success to confuse bots
      return res.json({
        success: true,
        message: 'Nachricht wurde gesendet.'
      });
    }

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Bitte füllen Sie alle Pflichtfelder aus.'
      });
    }

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
      });
    }

    // Sanitize inputs
    const nameClean = sanitizeInput(name);
    const emailClean = email.trim().toLowerCase();
    const messageClean = sanitizeInput(message);

    // Validate message length
    if (messageClean.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Die Nachricht ist zu kurz. Bitte geben Sie mindestens 10 Zeichen ein.'
      });
    }

    if (messageClean.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Die Nachricht ist zu lang. Maximal 5000 Zeichen erlaubt.'
      });
    }

    // Store submission in Firestore
    await admin.firestore().collection('contact_submissions').add({
      name: nameClean,
      email: emailClean,
      message: messageClean,
      ip: clientIp,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    });

    // Prepare email content
    const emailBody = `Sie haben eine neue Nachricht vom Kontaktformular der Website erhalten.

----------------------------------------
Name: ${nameClean}
E-Mail: ${emailClean}
Zeitstempel: ${new Date().toLocaleString('de-DE')}
IP-Adresse: ${clientIp}
----------------------------------------

Nachricht:
${messageClean}

----------------------------------------
Diese E-Mail wurde automatisch generiert.`;

    // Send email (if transporter is configured)
    const transporter = createTransporter();

    if (transporter) {
      try {
        await transporter.sendMail({
          from: EMAIL_CONFIG.fromEmail,
          to: EMAIL_CONFIG.contactEmail,
          replyTo: emailClean,
          subject: EMAIL_CONFIG.subjectPrefix + nameClean,
          text: emailBody
        });

        console.log('Contact form email sent successfully from:', emailClean);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Continue even if email fails - submission is stored in Firestore
      }
    } else {
      console.log('Email transporter not configured. Contact submission stored in Firestore.');
    }

    res.json({
      success: true,
      message: 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet. Wir werden uns bald bei Ihnen melden.'
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Entschuldigung, es gab ein Problem beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch.'
    });
  }
});

// Export the Express app as a Cloud Function
exports.app = functions.https.onRequest(app);

// Cleanup expired tokens (runs daily)
exports.cleanupExpiredTokens = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const now = Date.now();
  const expiredTokens = await admin.firestore()
    .collection('csrf_tokens')
    .where('expiresAt', '<', now)
    .get();

  const batch = admin.firestore().batch();
  expiredTokens.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Cleaned up ${expiredTokens.size} expired CSRF tokens`);
  return null;
});

// Cleanup old rate limits (runs daily)
exports.cleanupRateLimits = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const cutoff = Date.now() - (24 * 3600000); // 24 hours ago
  const oldRateLimits = await admin.firestore()
    .collection('rate_limits')
    .where('startTime', '<', cutoff)
    .get();

  const batch = admin.firestore().batch();
  oldRateLimits.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Cleaned up ${oldRateLimits.size} old rate limit entries`);
  return null;
});
