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
    
        

    // - build content tables
    var $tables = $('.tabelle');
    $tables.each(function (idx, el) {
        var $el = $(el);

        var headerColumns = [];
        var $header = $el.find('thead > tr > th').each(function (idx, el) {
            headerColumns.push($(el).text().trim());
        });
		
		/*if (headerColumns.length<3) {
			$el.addClass('table-nonresponsive');
			return;
		}*/
		
        if ($el.hasClass('table-nonresponsive') || $el.hasClass('tabelleHistorieResponsive')) {
        	return;
        } else if (!$el.hasClass('table-responsive')) {
            $el.addClass('table-responsive table-responsive--tabled');
        } else {
        	return;
        }
        
        var isInlined = $el.hasClass('table-responsive--inlined');
        var isTabled = $el.hasClass('table-responsive--tabled');
        var isListed = $el.hasClass('table-responsive--listed');


        // - every first column header will be a header
        if (!$el.hasClass('table-nohead')) {        	
	        var $titles = $el.find('tr > td:first-child');
	        $titles.addClass('table-responsive__header');
        }

        // - add data attributes for all the td's
        var $rows = $el.find('tr');

        $rows.each(function (index, row) {
            var $row = $(row);
            $.each(headerColumns, function (idx, el) {
                var difference = 0;
                if ($row.children().length < headerColumns.length) {
                    // the f
                    difference = headerColumns.length - $row.children().length;
                }
                var $child = $row.find('> *').eq(difference + idx);

                if ($child.length && $child[0].nodeName.toLowerCase() == 'td') {
                    if (el && !$child[0].hasAttribute('data-title')) {
                        $child.attr('data-title', el);
                    }
                    
                    $contentEmpty = $child.html().trim() == '' || $child.html().trim() == '&nbsp;';
                    
                    if ($contentEmpty) {
                        $child.addClass('table-responsive__td-empty');
                    }
                    
                    if (isTabled && !$child.hasClass('table-responsive__header')) {
                        $child.wrapInner('<span class="table-responsive__inner"></span>');
                    }
                    $child.prepend('<span class="table-responsive__prefix"></span>');
                    $child.append('<span class="table-responsive__appendix"></span>');
                    var $prefix = $child.find('.table-responsive__prefix');
                    var $appendix = $child.find('.table-responsive__appendix');

                    // - if this is a header child, we dont do anything
                    if (isInlined && !$child.hasClass('table-responsive__header')) {

                        if (el && !$contentEmpty) {
                            $prefix.text(el + ': ');
                        }
                        // - only if there is some text
                        if (!$contentEmpty) {
                            $appendix.text(',');
                        }
                    }

                    if (isTabled && !$child.hasClass('table-responsive__header')) {
                        if (el && !$contentEmpty) {
                            $prefix.text(el);
                        }
                    }

                    if (isListed && !$child.hasClass('table-responsive__header')) {
                        if (el && !$contentEmpty) {
                            $prefix.text(el + ': ');
                        }

                    }

                }

            });

        });


    });

    // - create a-z filter as onChange triggered dropdown
    var $filters = $('.paginationLinks.paginationLinks-showMobile');


    $filters.each(function (idx, el) {
        var $origFilter = $(el);
        var $container = $origFilter.parent();

        var $links = $origFilter.find('a');

        // - append a filter container
        $container.prepend('<div class="table-filter visible-xs visible-sm"><select class="table-filter__select"></select></div>')
        var $newFilter = $container.find('.table-filter');
        var $newFilter_select = $container.find('.table-filter__select');

        $links.each(function (idx, link) {
            var $link = $(link);
            var $option = $('<option>', {value: idx, text: $link.text()});
            $option.data('link', $link.attr('href'));
            $newFilter_select.append($option);
        });

        $newFilter_select.on('change', function (e) {
            // - changed! 
            var link = $(this).find('option:selected').data('link');
            if (link) {
                window.location.href = link;
            }
        });

    });


    // - table-mobile arrow links
    $('#contentplusteaser').on('click', '.table-mobile__entry', function (e) {
        e.stopPropagation();
        if (e.target.nodeName.toLowerCase() != 'a') {
            var url = $(this).data('arrow-url');
            window.location.href = url;
        }
    });

    // - history table
    var restructure_history_table = function (table) {
        var $table = $(table);

        if (!$table.data('working')) {
            $table.data('working', true);
            if ($table.find('.historyHeader')[0]!=undefined && $table.find('.historyHeader')[0].childElementCount >= 2) {
               var mode = $table.data('mode');
               if ($(window).width() > 1024) {
                  // - we are on desktop put back the good stuff
                  if (mode == 'mobile' || !mode) {
                     // - the table is in mobile mode - restructure it
                     $table.find('.historyHeader td:nth-child(2)').attr('colspan', '').removeClass('table-responsive__header-history');
                     $table.find('thead > tr > th:nth-child(2)').attr('colspan', '').removeClass('table-responsive__header-tableheader');
                     $table.data('mode', 'desktop');
                  }
               } else {
                  // - we are on mobile, make it so
                  if (mode == 'desktop' || !mode) {
                     // - the table is in desktop mode - restructure it
                     $table.find('.historyHeader td:nth-child(2)').attr('colspan', 2).addClass('table-responsive__header-history');
                     $table.find('thead > tr > th:nth-child(2)').attr('colspan', '3').addClass('table-responsive__header-tableheader');
                     ;

                     $table.data('mode', 'mobile');
                  }
               }
               $table.data('working', false);
            }			
        }
    };

    var $historyTables = $('.tabelle.tabelleHistorieResponsive');
    $historyTables.each(function (id, el) {
        restructure_history_table(el);
    });

    $(window).on('debouncedwidth', function () {
        $historyTables.each(function (id, el) {
            restructure_history_table(el);
        });
    });
    


});


}
/*
     FILE ARCHIVED ON 21:06:48 Dec 08, 2022 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 19:36:27 Jan 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  exclusion.robots: 0.109
  exclusion.robots.policy: 0.097
  cdx.remote: 0.138
  esindex: 0.012
  LoadShardBlock: 260.427 (6)
  PetaboxLoader3.resolve: 212.297 (4)
  PetaboxLoader3.datanode: 174.304 (8)
  load_resource: 249.789 (2)
*/