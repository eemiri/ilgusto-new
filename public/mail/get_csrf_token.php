<?php
/**
 * CSRF Token Generator Endpoint
 * Returns a CSRF token for the contact form
 */

require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

$token = generateCSRFToken();

echo json_encode([
    'success' => true,
    'csrf_token' => $token
]);
