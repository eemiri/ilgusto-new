
function main() {

(function () {
   'use strict';
   
  	$('a.page-scroll').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
          var target = $(this.hash);
          target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
          if (target.length) {
            $('html,body').animate({
              scrollTop: target.offset().top - 40
            }, 900);
            return false;
          }
        }
      });

	
    // Show Menu on Book
    $(window).bind('scroll', function() {
        var navHeight = $(window).height() - 500;
        if ($(window).scrollTop() > navHeight) {
            $('.navbar-default').addClass('on');
        } else {
            $('.navbar-default').removeClass('on');
        }
    });

    $('body').scrollspy({ 
        target: '.navbar-default',
        offset: 80
    });

	// Hide nav on click
  $(".navbar-nav li a").click(function (event) {
    // check if window is small enough so dropdown is created
    var toggle = $(".navbar-toggle").is(":visible");
    if (toggle) {
      $(".navbar-collapse").collapse('hide');
    }
  });
	
  	// Portfolio isotope filter
    $(window).load(function() {
        var $container = $('.portfolio-items');
        $container.isotope({
            filter: '*',
            animationOptions: {
                duration: 750,
                easing: 'linear',
                queue: false
            }
        });
        $('.cat a').click(function() {
            $('.cat .active').removeClass('active');
            $(this).addClass('active');
            var selector = $(this).attr('data-filter');
            $container.isotope({
                filter: selector,
                animationOptions: {
                    duration: 750,
                    easing: 'linear',
                    queue: false
                }
            });
            return false;
        });

    });

    //Bounding box menu items
    function adjustMenuItemWidth() {
      $('.menu-item').each(function() {
          var $name = $(this).find('.menu-item-name');
          var $price = $(this).find('.menu-item-price');
  
          // Temporarily reset any previously set max-width to properly measure the available space
          $name.css('max-width', '');
  
          var nameRect = $name.get(0).getBoundingClientRect();
          var priceRect = $price.get(0).getBoundingClientRect();
  
          if (nameRect.right > priceRect.left) {
              // Calculate the available space for the name by subtracting the left position of the price
              // from the right position of the name's container.
              var availableSpace = priceRect.left - $name.offset().left;
              $name.css('max-width', availableSpace - 10); // 10px for some padding
          }
      });
  }
  
  $(document).ready(adjustMenuItemWidth);
  $(window).on('resize', adjustMenuItemWidth);
  
  
  


	
    // Nivo Lightbox 
    $('.portfolio-item a').nivoLightbox({
            effect: 'slideDown',  
            keyboardNav: true,                            
        });

}());


}
main();