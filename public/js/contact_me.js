/**
 * Simple Contact Form Handler
 * Il Gusto Restaurant
 */

$(function() {
    var isSubmitting = false;

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

        // Get form values
        var name = $('#name').val().trim();
        var email = $('#email').val().trim();
        var message = $('#message').val().trim();

        // Create mailto link
        var subject = encodeURIComponent('Kontaktanfrage von ' + name);
        var body = encodeURIComponent(
            'Name: ' + name + '\n' +
            'E-Mail: ' + email + '\n\n' +
            'Nachricht:\n' + message
        );

        var mailtoLink = 'mailto:mail@ilgusto-sb.de?subject=' + subject + '&body=' + body;

        // Open email client
        window.location.href = mailtoLink;

        // Show success message
        showSuccess('Ihr E-Mail-Programm wird geöffnet. Bitte senden Sie die E-Mail von dort aus.');

        // Clear form after a short delay
        setTimeout(function() {
            $('#contactForm')[0].reset();
        }, 1000);

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
});
