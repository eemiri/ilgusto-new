/**
 * Secure Contact Form Handler
 * Il Gusto Restaurant
 */

$(function() {
    var csrfToken = null;
    var isSubmitting = false;

    // Fetch CSRF token on page load
    function fetchCSRFToken() {
        $.ajax({
            url: "./mail/get_csrf_token.php",
            type: "GET",
            dataType: "json",
            cache: false,
            success: function(response) {
                if (response.success && response.csrf_token) {
                    csrfToken = response.csrf_token;
                    $('#csrf_token').val(csrfToken);
                    console.log('CSRF token loaded');
                }
            },
            error: function(xhr, status, error) {
                console.error('Failed to load CSRF token:', error);
                showError('Sicherheitstoken konnte nicht geladen werden. Bitte laden Sie die Seite neu.');
            }
        });
    }

    // Initialize form
    function initForm() {
        fetchCSRFToken();

        // Add input event listeners for real-time validation
        $('#name').on('input', function() {
            validateName($(this));
        });

        $('#email').on('input', function() {
            validateEmail($(this));
        });

        $('#message').on('input', function() {
            validateMessage($(this));
        });
    }

    // Validation functions
    function validateName($input) {
        var name = $input.val().trim();
        var $helpBlock = $input.closest('.form-group').find('.help-block');

        if (name.length === 0) {
            $helpBlock.text('Bitte geben Sie Ihren Namen ein.');
            return false;
        } else if (name.length < 2) {
            $helpBlock.text('Der Name muss mindestens 2 Zeichen lang sein.');
            return false;
        } else if (name.length > 100) {
            $helpBlock.text('Der Name darf maximal 100 Zeichen lang sein.');
            return false;
        } else {
            $helpBlock.text('');
            return true;
        }
    }

    function validateEmail($input) {
        var email = $input.val().trim();
        var $helpBlock = $input.closest('.form-group').find('.help-block');
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email.length === 0) {
            $helpBlock.text('Bitte geben Sie Ihre E-Mail-Adresse ein.');
            return false;
        } else if (!emailRegex.test(email)) {
            $helpBlock.text('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
            return false;
        } else if (email.length > 254) {
            $helpBlock.text('Die E-Mail-Adresse ist zu lang.');
            return false;
        } else {
            $helpBlock.text('');
            return true;
        }
    }

    function validateMessage($textarea) {
        var message = $textarea.val().trim();
        var $helpBlock = $textarea.closest('.form-group').find('.help-block');

        if (message.length === 0) {
            $helpBlock.text('Bitte geben Sie eine Nachricht ein.');
            return false;
        } else if (message.length < 10) {
            $helpBlock.text('Die Nachricht muss mindestens 10 Zeichen lang sein.');
            return false;
        } else if (message.length > 5000) {
            $helpBlock.text('Die Nachricht darf maximal 5000 Zeichen lang sein.');
            return false;
        } else {
            $helpBlock.text('');
            return true;
        }
    }

    // Show success message
    function showSuccess(message) {
        $('#success').html(
            "<div class='alert alert-success alert-dismissible' role='alert'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-label='Schließen'>" +
            "<span aria-hidden='true'>&times;</span>" +
            "</button>" +
            "<strong><i class='fa fa-check'></i> Erfolg!</strong> " + message +
            "</div>"
        );

        // Scroll to success message
        $('html, body').animate({
            scrollTop: $('#success').offset().top - 100
        }, 500);
    }

    // Show error message
    function showError(message) {
        $('#success').html(
            "<div class='alert alert-danger alert-dismissible' role='alert'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-label='Schließen'>" +
            "<span aria-hidden='true'>&times;</span>" +
            "</button>" +
            "<strong><i class='fa fa-exclamation-triangle'></i> Fehler!</strong> " + message +
            "</div>"
        );

        // Scroll to error message
        $('html, body').animate({
            scrollTop: $('#success').offset().top - 100
        }, 500);
    }

    // Form submission
    $('#contactForm').on('submit', function(e) {
        e.preventDefault();

        // Prevent double submission
        if (isSubmitting) {
            return false;
        }

        // Clear previous messages
        $('#success').html('');
        $('.help-block').text('');

        // Validate all fields
        var nameValid = validateName($('#name'));
        var emailValid = validateEmail($('#email'));
        var messageValid = validateMessage($('#message'));

        if (!nameValid || !emailValid || !messageValid) {
            showError('Bitte korrigieren Sie die markierten Fehler.');
            return false;
        }

        // Check CSRF token
        if (!csrfToken) {
            showError('Sicherheitstoken fehlt. Bitte laden Sie die Seite neu.');
            return false;
        }

        // Get form values
        var name = $('#name').val().trim();
        var email = $('#email').val().trim();
        var message = $('#message').val().trim();
        var website = $('#website').val(); // Honeypot

        // Disable submit button
        var $submitBtn = $('#contactForm button[type="submit"]');
        var originalBtnText = $submitBtn.html();
        $submitBtn.prop('disabled', true).html(
            '<i class="fa fa-spinner fa-spin"></i> Wird gesendet...'
        );
        isSubmitting = true;

        // Send AJAX request
        $.ajax({
            url: "./mail/contact_me.php",
            type: "POST",
            data: {
                name: name,
                email: email,
                message: message,
                website: website,
                csrf_token: csrfToken
            },
            dataType: "json",
            cache: false,
            success: function(response) {
                if (response.success) {
                    showSuccess(response.message);
                    // Clear form
                    $('#contactForm')[0].reset();
                    // Fetch new CSRF token
                    fetchCSRFToken();
                } else {
                    showError(response.message || 'Ein Fehler ist aufgetreten.');
                }
            },
            error: function(xhr, status, error) {
                var errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';

                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.status === 429) {
                    errorMessage = 'Zu viele Anfragen. Bitte warten Sie eine Weile und versuchen Sie es erneut.';
                } else if (xhr.status === 403) {
                    errorMessage = 'Sicherheitsvalidierung fehlgeschlagen. Bitte laden Sie die Seite neu.';
                    // Fetch new CSRF token
                    fetchCSRFToken();
                } else if (xhr.status === 0) {
                    errorMessage = 'Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
                }

                showError(errorMessage);
                console.error('Form submission error:', status, error);
            },
            complete: function() {
                // Re-enable submit button
                $submitBtn.prop('disabled', false).html(originalBtnText);
                isSubmitting = false;
            }
        });

        return false;
    });

    // Clear success message when user starts typing
    $('#name, #email, #message').on('focus', function() {
        var $successDiv = $('#success');
        if ($successDiv.find('.alert-success').length > 0) {
            $successDiv.fadeOut(300, function() {
                $(this).html('').show();
            });
        }
    });

    // Initialize on document ready
    initForm();
});
