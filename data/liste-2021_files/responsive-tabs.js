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


    // - tab toggler
    var $tabsResponsive = $('.tabs-responsive');


    var calculate_tab_fit = function ($menu) {

        // - decide how many tabs will fit in the available space
        var tabs = $menu.find('ul.tabs-responsive__menu > .tabs-responsive__tab:not(.tabs-responsive__tab--more)');

        var $moreTab = $menu.find('.tabs-responsive__tab--more');
        $moreTab.hide();

        var $moreTabMenu = $menu.find('.tabs-responsive__menu-more');
        var availableWidth = $menu.innerWidth() - $moreTab.outerWidth() - 5;

        var tabsWhoFit = [];
        var currentTabLength = 0;
        var tabsWhoDontFit = [];

        i = 1;
        var fit = true;
        tabs.each(function (idx, tab) {
            var $tab = $(tab);

            var tabWidth = $tab.outerWidth() + 10;
            if (i > 1) {

                if ((tabWidth + currentTabLength) > availableWidth || fit == false) {
                    // cancel
                    fit = false;
                    tabsWhoDontFit.push($tab);
                    return;
                }

            }
            currentTabLength += tabWidth;
            tabsWhoFit.push($tab);

            i++;
        });

        $.each(tabsWhoFit, function (idx, el) {
            el.show();
        });

        $menu.find('.tabs-responsive__menu-more .tabs-responsive__tab').remove();
        $.each(tabsWhoDontFit, function (idx, el) {
            el.clone().appendTo($moreTabMenu);
            el.hide();
        });
        if ($moreTabMenu.children().length) {
            $moreTab.show();
        }
        
        //todo (ms)
        //$menu.css('margin-top',($menu.find('.tabs-responsive__menu').height() * -1 - 13));
        //$menu.parent('.tabs-responsive__contentBlock').css('margin-top',($menu.find('.tabs-responsive__menu').height()  + 13));

    };

    $tabsResponsive.each(function (idx, menu) {
        var $menu = $(menu);

        // - hook in listeners
        var tabs = $menu.find('.tabs-responsive__tab:not(.tabs-responsive__tab--more)');
        var $moreTab = $menu.find('.tabs-responsive__tab--more');
        var $moreTabMenu = $menu.find('.tabs-responsive__menu-more');


        // - setup dropdown toggle
        $moreTab.find('>a').on('click', function () {
            var $parent = $(this).parent();
            if ($parent.hasClass('active')) {
                $parent.removeClass('active');
            } else {
                $parent.addClass('active');
                $moreTabMenu.css('left','' )
                $moreTabMenu.css('right','' )

                // - do we have to align right?
                if ($moreTabMenu.outerWidth() > $menu.parent().innerWidth() - $moreTab.offset().left) {
                    $moreTabMenu.addClass('is-right');

                    var offset = $moreTab.position().left;
                    if(offset < $moreTabMenu.outerWidth() ){
                        $moreTabMenu.css('left',$moreTab.position().left *-1 )
                        $moreTabMenu.css('right','auto' )
                    }
                  
                } else {
                    $moreTabMenu.addClass('is-left');
                }
            }

            return false;
        });

        setTimeout(function () {
            // - decide how many tabs will fit in the available space
            calculate_tab_fit($menu);

            // - event on width change
            $(window).on('debouncedwidth', function () {
                setTimeout(function(){

                    $tabsResponsive.each(function (idx, menu) {
                        var $menu = $(menu);

                        calculate_tab_fit($menu);
                    });
                },250)
            });
        },300)

    });

});


}
/*
     FILE ARCHIVED ON 21:06:48 Dec 08, 2022 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 19:36:30 Jan 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  exclusion.robots: 0.057
  exclusion.robots.policy: 0.049
  cdx.remote: 0.083
  esindex: 0.008
  LoadShardBlock: 108.466 (6)
  PetaboxLoader3.datanode: 144.738 (8)
  load_resource: 4659.225 (2)
  PetaboxLoader3.resolve: 4394.731 (2)
*/