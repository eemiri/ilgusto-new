<?php
/**
 * Secure Contact Form Handler
 * Il Gusto Restaurant
 *
 * Security features:
 * - CSRF protection
 * - Rate limiting
 * - Email header injection prevention
 * - Input sanitization
 * - Honeypot spam protection
 */

require_once __DIR__ . '/config.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Check rate limiting
if (!checkRateLimit()) {
    http_response_code(429);
    logSecurityEvent('RATE_LIMIT_EXCEEDED', 'Too many requests');
    echo json_encode([
        'success' => false,
        'message' => 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.'
    ]);
    exit;
}

// Get POST data
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$message = $_POST['message'] ?? '';
$csrf_token = $_POST['csrf_token'] ?? '';
$honeypot = $_POST['website'] ?? ''; // Honeypot field

// Validate CSRF token
if (!validateCSRFToken($csrf_token)) {
    http_response_code(403);
    logSecurityEvent('CSRF_VALIDATION_FAILED', 'Invalid CSRF token');
    echo json_encode([
        'success' => false,
        'message' => 'Sicherheitsvalidierung fehlgeschlagen. Bitte laden Sie die Seite neu.'
    ]);
    exit;
}

// Check honeypot (should be empty)
if (!empty($honeypot)) {
    http_response_code(400);
    logSecurityEvent('HONEYPOT_TRIGGERED', 'Spam bot detected');
    // Return success to confuse bots
    echo json_encode([
        'success' => true,
        'message' => 'Nachricht wurde gesendet.'
    ]);
    exit;
}

// Validate required fields
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Bitte füllen Sie alle Pflichtfelder aus.'
    ]);
    exit;
}

// Validate email
if (!validateEmail($email)) {
    http_response_code(400);
    logSecurityEvent('INVALID_EMAIL', "Invalid email format: $email");
    echo json_encode([
        'success' => false,
        'message' => 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
    ]);
    exit;
}

// Sanitize all inputs
$name_clean = sanitizeInput($name);
$email_clean = filter_var($email, FILTER_SANITIZE_EMAIL);
$message_clean = sanitizeInput($message);

// Additional validation: check message length
if (strlen($message_clean) < 10) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Die Nachricht ist zu kurz. Bitte geben Sie mindestens 10 Zeichen ein.'
    ]);
    exit;
}

if (strlen($message_clean) > 5000) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Die Nachricht ist zu lang. Maximal 5000 Zeichen erlaubt.'
    ]);
    exit;
}

// Prepare email
$to = CONTACT_EMAIL;
$subject = SUBJECT_PREFIX . $name_clean;

// Create email body (plain text)
$email_body = "Sie haben eine neue Nachricht vom Kontaktformular der Website erhalten.\n\n";
$email_body .= "----------------------------------------\n";
$email_body .= "Name: $name_clean\n";
$email_body .= "E-Mail: $email_clean\n";
$email_body .= "Zeitstempel: " . date('d.m.Y H:i:s') . "\n";
$email_body .= "IP-Adresse: " . $_SERVER['REMOTE_ADDR'] . "\n";
$email_body .= "----------------------------------------\n\n";
$email_body .= "Nachricht:\n$message_clean\n\n";
$email_body .= "----------------------------------------\n";
$email_body .= "Diese E-Mail wurde automatisch generiert.\n";

// Prepare headers with proper security
$headers = [];
$headers[] = "From: " . FROM_EMAIL;
$headers[] = "Reply-To: $email_clean";
$headers[] = "X-Mailer: PHP/" . phpversion();
$headers[] = "X-Priority: 3";
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/plain; charset=UTF-8";
$headers[] = "Content-Transfer-Encoding: 8bit";

// Join headers
$headers_string = implode("\r\n", $headers);

// Send email
$mail_sent = @mail($to, $subject, $email_body, $headers_string);

if ($mail_sent) {
    // Log successful submission
    error_log("Contact form submitted successfully from: $email_clean");

    // Clear CSRF token to prevent reuse
    unset($_SESSION['csrf_token']);
    unset($_SESSION['csrf_token_time']);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet. Wir werden uns bald bei Ihnen melden.'
    ]);
} else {
    // Log error
    logSecurityEvent('EMAIL_SEND_FAILED', "Failed to send email from: $email_clean");

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Entschuldigung, es gab ein Problem beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch.'
    ]);
}
