var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

jQuery(function () {

    var $ = jQuery;
    var $btn__search = $('#js-btn__search');
    var $btn__menu = $('#js-btn__menu');
    var $wrap__menu = $('#js-wrap__menu');
    var $header_mobile = $('#header-mobile');
    var $header_mobile__wrap = $('#header-mobile .header-mobile__wrap');
    var $header_mobile__top = $('.header-mobile__top');
    var $body = $('body');

    // - do we have a open menu?
    var menu_is_open = function () {
        return ($('body').hasClass('body--mobile-search--active') || $('body').hasClass('body--mobile-menu--active'));
    }

    // - create the menu backdrop here
    var $container = $('#container');
    $container.append('<div class="header-mobile__backdrop" id="js-header-mobile__backdrop"></div>');

    var $backdrop = $('#js-header-mobile__backdrop');

    // - lock menu headers
    var lock_page = function () {
        $header_mobile__wrap.css('position', 'fixed');
        $header_mobile__wrap.css('top', '0');
        $header_mobile__wrap.css('width', $('html').outerWidth());

        headroom.destroy();
    };

    // - unlock menu headers
    var unlock_page = function () {

        if ($(window).scrollTop() <= 130) {
            $header_mobile__wrap.css('position', '');
            $header_mobile__wrap.css('top', '');
        }
        $header_mobile__wrap.css('width', '');
        $header_mobile__wrap.css('left', '');

        $header_mobile.removeClass('headroom');

        headroom.init();
    };

    // - listen on a backdrop click
    $backdrop.on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        unlock_page();

        $body.removeClass('body--mobile-menu--active body--mobile-search--active');
    });


    $btn__search.on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if ($body.hasClass('body--mobile-search--active')) {
            unlock_page();
        } else {
            lock_page();
        }


        $body.toggleClass('body--mobile-search--active');
        $body.removeClass('body--mobile-menu--active');
    });


    $btn__menu.on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if ($body.hasClass('body--mobile-menu--active')) {
            unlock_page();
        } else {
            lock_page();
        }

        $body.toggleClass('body--mobile-menu--active');
        $body.removeClass('body--mobile-search--active');
    });

    // - fix header height
    $header_mobile.height($header_mobile.height());

    // - initialise headroom
    var headroom = new Headroom(document.getElementById("header-mobile"), {
        offset: 130,
        tolerance: 5,
        onPin: function () {
            $header_mobile.addClass('header-mobile--pinned');
            $header_mobile.removeClass('header-mobile--unpinned');
        },
        onUnpin: function () {
            $header_mobile.addClass('header-mobile--unpinned');
            $header_mobile.removeClass('header-mobile--pinned');
        }
    });
	

    // initialise
	try{
		headroom.init();
	}catch(e){
		//No headroom
		console.log('No headroom (missing .inc)');
	}

    $(window).on('scroll', function () {
        $header_mobile__top.css('width', $('html').outerWidth());

        if ($(window).scrollTop() <= 130) {
            $header_mobile.removeClass('header-mobile--unpinned header-mobile--pinned');
            if (!menu_is_open()) {
                $header_mobile__wrap.css('position', '');
                $header_mobile__wrap.css('top', '');
            }

        }
    });

    // - event on width change
    $(window).on('debouncedwidth', function () {
        unlock_page();
        $body.removeClass('body--mobile-menu--active body--mobile-search--active');
        $header_mobile__top.css('width', $('html').outerWidth());
    });


    // - nav-mobile navigation accordions
    var $nav_mobile__navigation = $('#js-nav-mobile-navigation');
	
	
	if (window.location.pathname.indexOf('/LESP')>=0) {
		$nav_mobile__navigation.find('>ul>li').addClass('open');
	} else {
		$nav_mobile__navigation.find('>ul>li>ul').hide();
	}
	
	$nav_mobile__navigation.find('>ul>li').on('click', function (e) {
		e.preventDefault();
		e.stopPropagation();

		var $el = $(this);
		if ($el.hasClass('open')) {
			$el.removeClass('open');
			$el.find('>ul').slideUp();
		} else {
			$el.addClass('open');
			$el.find('>ul').slideDown();

			$el.addClass('un-hover');
		}

		$el.trigger('blur');
		$el.find('a').trigger('blur');

		$(this).siblings().find('>ul').slideUp('open');
		$(this).siblings().removeClass('open');
	});
    
    // msteindl Menü Hotfix /Unterebene
    $('#js-nav-mobile-navigation').find('>ul>li>ul>li').click(function(e) {
	   //do something
	   e.stopPropagation();
	})

    /**
     *
     * Creating Mobile / Desktop switch events here, just listen on $(window)
     *
     */


    var window_trow_resize_events = function () {
        var $window = $(window);


        if (!$window.data('working')) {
            $window.data('working', true);
            var mode = $window.data('mode');
            if ($(window).width() > 1024) {
                // - we are on desktop put back the good stuff
                if (mode == 'mobile' || !mode) {

                    $window.trigger('window.size.desktop');

                    $window.data('mode', 'desktop');
                    console.log('Desktop Size');
                    // -. we finished the conversion
                }
            } else {
                // - we are on mobile, make it so
                if (mode == 'desktop' || !mode) {
                    // - the table is in desktop mode - restructure it

                    $window.trigger('window.size.mobile');
                    $window.data('mode', 'mobile');
                    console.log('Mobile Size');
                    // -. we finished the conversion
                }
            }
            $window.data('working', false);
        }
    };

    $(window).on('debouncedwidth', function () {
        window_trow_resize_events();
    });


    // - switch to mobile datepicker
    $(window).on('window.size.desktop', function () {
        $('.js-datepicker').attr('type', 'text');

        $('.js-matchheight-mobile-row').matchHeight({
            byRow: true,
            remove: true
        });
        $('body,html').addClass('is-desktop').removeClass('is-responsive');
    });

    $(window).on('window.size.mobile', function () {
        $('.js-datepicker').attr('type', 'date');

        $('.js-matchheight-mobile-row').matchHeight({
            byRow: true,
            remove: false
        });
        $('body,html').addClass('is-responsive').removeClass('is-desktop');

    });

    window_trow_resize_events();


    // - Create js-matchheight-mobile-row Class
    $('.js-matchheight-mobile-row').matchHeight({
        byRow: true,
        remove: false
    });

    
});


}
/*
     FILE ARCHIVED ON 21:06:44 Dec 08, 2022 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 19:36:25 Jan 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  exclusion.robots: 0.106
  exclusion.robots.policy: 0.09
  cdx.remote: 0.18
  esindex: 0.014
  LoadShardBlock: 359.555 (6)
  PetaboxLoader3.datanode: 256.749 (8)
  load_resource: 215.614 (2)
  PetaboxLoader3.resolve: 118.856 (2)
*/