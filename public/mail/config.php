<?php
/**
 * Contact Form Configuration
 * Il Gusto Restaurant
 */

// Session configuration
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_secure', 1); // Only if using HTTPS
    ini_set('session.cookie_samesite', 'Strict');
    session_start();
}

// Email configuration
define('CONTACT_EMAIL', 'mail@ilgusto-sb.de');
define('FROM_EMAIL', 'noreply@ilgusto-sb.de');
define('SUBJECT_PREFIX', 'Webseite Kontaktformular: ');

// Rate limiting configuration (per IP)
define('RATE_LIMIT_REQUESTS', 3); // Max requests
define('RATE_LIMIT_WINDOW', 3600); // Time window in seconds (1 hour)

// Allowed origins for CORS
define('ALLOWED_ORIGIN', 'https://ilgusto-sb.de'); // Update with your actual domain

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Content-Type: application/json');

// CORS headers (adjust for your domain)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];
    if (strpos($origin, 'localhost') !== false || strpos($origin, 'ilgusto-sb.de') !== false) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: POST');
        header('Access-Control-Allow-Headers: Content-Type');
    }
}

/**
 * Generate CSRF token
 */
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['csrf_token_time'] = time();
    }
    return $_SESSION['csrf_token'];
}

/**
 * Validate CSRF token
 */
function validateCSRFToken($token) {
    if (!isset($_SESSION['csrf_token']) || !isset($_SESSION['csrf_token_time'])) {
        return false;
    }

    // Token expires after 1 hour
    if (time() - $_SESSION['csrf_token_time'] > 3600) {
        unset($_SESSION['csrf_token']);
        unset($_SESSION['csrf_token_time']);
        return false;
    }

    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Check rate limiting
 */
function checkRateLimit() {
    $ip = $_SERVER['REMOTE_ADDR'];
    $key = 'rate_limit_' . md5($ip);

    if (!isset($_SESSION[$key])) {
        $_SESSION[$key] = [
            'count' => 1,
            'start_time' => time()
        ];
        return true;
    }

    $data = $_SESSION[$key];
    $elapsed = time() - $data['start_time'];

    // Reset if window has passed
    if ($elapsed > RATE_LIMIT_WINDOW) {
        $_SESSION[$key] = [
            'count' => 1,
            'start_time' => time()
        ];
        return true;
    }

    // Check if limit exceeded
    if ($data['count'] >= RATE_LIMIT_REQUESTS) {
        return false;
    }

    // Increment counter
    $_SESSION[$key]['count']++;
    return true;
}

/**
 * Sanitize input to prevent header injection
 */
function sanitizeInput($input) {
    // Remove any null bytes
    $input = str_replace(["\0", "\r", "\n"], '', $input);
    // Trim whitespace
    $input = trim($input);
    // Convert special characters to HTML entities
    $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    return $input;
}

/**
 * Validate email address
 */
function validateEmail($email) {
    // Basic filter
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return false;
    }

    // Additional checks for common injection patterns
    $blacklist = ['content-type:', 'bcc:', 'cc:', 'to:', 'from:'];
    $email_lower = strtolower($email);

    foreach ($blacklist as $pattern) {
        if (strpos($email_lower, $pattern) !== false) {
            return false;
        }
    }

    return true;
}

/**
 * Log security events
 */
function logSecurityEvent($event, $details = '') {
    $log_file = __DIR__ . '/security.log';
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'];
    $message = "[$timestamp] IP: $ip - Event: $event - Details: $details\n";

    // Only log if file is writable or can be created
    @error_log($message, 3, $log_file);
}
