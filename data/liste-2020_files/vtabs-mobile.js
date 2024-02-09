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

    $tabcontrol = $('.vtabs-panels-inner');
    $tabcontrol_menu = $('.vtabs-tabs');
    var indexPosition;
	
    //Panel-Elemente durchnummerieren -> Notwendig für ARIA Verknüpfungen
    
    $tabcontrol_menu.find('ul')
      .attr('role', 'tablist');

    indexPosition = 0;
    $tabcontrol_menu.find('li').each(function( ) {
    	
	  $( this )
	  	.attr("id", "tab" + indexPosition)
	  	.attr("role", "tab")
	  	.attr("aria-controls", "panel" + indexPosition)
	  	.attr("aria-selected", "false")
	    .attr("tabindex", "0")
	  ;
	  
	  indexPosition = indexPosition + 1;

	});
    
    indexPosition = 0;
    $tabcontrol.find('.panel').each(function( ) {
    	
  	  $( this )
  	  	.attr("id", "panel" + indexPosition)
  	  	.attr("role", "tabpanel")
  	  	.attr("aria-labelledby", "tab" + indexPosition)
  	  ;
  	  
  	  $( this ).find('.panel-heading')
	  	.attr("id", "panelheading" + indexPosition)
	  ;
  	  
  	  indexPosition = indexPosition + 1;

  	});
    
    //initial selection

	    // check if element with id "startInternetLive" has class "live"
	    if ($('#startInternetLive.live').length) {
	    	indexPosition = $('#startInternetLive').closest('.panel').index();
			$tabcontrol.children().removeClass('selected');
	    	$tabcontrol.children().eq( indexPosition ).addClass('selected');
	    	$tabcontrol_menu.find('li').removeClass('selected');
	    	$tabcontrol_menu.children().first().children().eq( indexPosition ).addClass('selected');
	    }
		
	    //check if element with id "startEnqKLive" has class "live"
	    else if ($('#startEnqKLive.live').length) {
	    	indexPosition = $('#startEnqKLive').closest('.panel').index();
			$tabcontrol.children().removeClass('selected');
	    	$tabcontrol.children().eq( indexPosition ).addClass('selected');
	    	$tabcontrol_menu.find('li').removeClass('selected');
	    	$tabcontrol_menu.children().first().children().eq( indexPosition ).addClass('selected');
	    }
	    		
		//check if element with id "startVeranstLive" has class "live"
		else if ($('#startVeranstLive.live').length) {
	    	indexPosition = $('#startVeranstLive').closest('.panel').index();
			$tabcontrol.children().removeClass('selected');
	    	$tabcontrol.children().eq( indexPosition ).addClass('selected');
	    	$tabcontrol_menu.find('li').removeClass('selected');
	    	$tabcontrol_menu.children().first().children().eq( indexPosition ).addClass('selected');
	    }
	    
	    else {
		    indexPosition = $tabcontrol_menu.find('li.selected').index();
		    $tabcontrol.children().eq( indexPosition ).addClass('selected');
	    }
	    $('#tab' + indexPosition).attr("aria-selected", "true");
    
    windowsizeAdaption();
	
	jQuery(window).on('debouncedwidth', function () {
          windowsizeAdaption();
      });
	
	//mobile controls
	
    $tabcontrol.find('.panel .panel-heading').on('click', function (e) {
    	if ($(window).width() < 768){
	    	e.preventDefault();
	        e.stopPropagation();
	        var $el = $(this);
	        var $tab = $el.parent();
	        var $body = $el.parent().find('.panel-content');

	        if ($tab.hasClass('selected')) {
	            $tabcontrol.find('.panel:visible .panel-content').slideUp();
	            $tabcontrol.find('.panel').removeClass('selected');
	
	            $body.slideUp();
	            $tab.removeClass('selected');
	        } else {
	            $tabcontrol.find('.panel').removeClass('selected');
	            $tabcontrol.find('.panel:visible .panel-content').slideUp();
	
	            $body.slideDown(function () {
	                // - scroll to element after slidedown finished
	                // - some offset if the mobile header is shown
	            	
	                var offset = 0;
	                if ($('#header-mobile').hasClass('header-mobile--pinned')) {
	                    offset = -72;
	                }
	                $('html, body').animate({
	                    scrollTop: (offset + $el.offset().top)
	                }, 200);
	
	            });
	            $tab.addClass('selected');
	
	        }
	        
	        //select tab in left-side Menu
	        $tabcontrol_menu.find('li').removeClass('selected');
	        if ($('.panel.selected').length) {
		        indexPosition = $('.panel.selected').index();
		        $tabcontrol_menu.find('li').eq( indexPosition ).addClass('selected');
	        }
	        
    	}
    	else {
    		//do nothing in Desktop Size
    	}

    });
    
   
    //Desktop controls
    
    $tabcontrol_menu.find('li').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $el = $(this);
        var indexPosition;
        
        //select tab in left-side Menu
        $tabcontrol_menu.find('li')
        	.removeClass('selected')
        	.attr("aria-selected", "false");
        $el
        	.addClass('selected')
        	.attr("aria-selected", "true");
        
        //select the corresponding content
        $tabcontrol.children().removeClass('selected');
        indexPosition = $el.index();
        $tabcontrol.children().eq( indexPosition ).addClass('selected');

    });
    
    //Key-up Key-down in Buehne
    
    $( "#vtabs-front" ).attr('tabindex','0')
    
    $( "#vtabs-front" ).keydown(function( event ) {
    	
    	//not in mobile Version
    	if ($(window).width() > 768){
    		
    	  switch(event.keyCode) {
	          case 37: // left
	          case 38: // up
	        	indexPosition = $tabcontrol_menu.find('li.selected').index();
	            if(indexPosition > 0) {
	            	$tabcontrol.find('.panel').removeClass('selected');
	            	$tabcontrol.children().eq( indexPosition-1 ).addClass('selected');
	    	    	$tabcontrol_menu.find('li').removeClass('selected');
	    	    	$tabcontrol_menu.children().first().children().eq( indexPosition-1 ).addClass('selected');
	                event.stopPropagation();
	                event.preventDefault();
	              }
	            break;
	          case 39: // right
	          case 40 : // down
	        	indexPosition = $tabcontrol_menu.find('li.selected').index();
		        if($tabcontrol.children().eq( indexPosition+1 ).length) {
		            	$tabcontrol.find('.panel').removeClass('selected');
		            	$tabcontrol.children().eq( indexPosition+1 ).addClass('selected');
		    	    	$tabcontrol_menu.find('li').removeClass('selected');
		    	    	$tabcontrol_menu.children().first().children().eq( indexPosition+1 ).addClass('selected');
		                event.stopPropagation();
		                event.preventDefault();
		              }
	            break;
	        }
    	  
    	}

    	});
    
});

function windowsizeAdaption () {
	if ($(window).width() < 768){
		$('.panel').not('.selected').find('.panel-content').css('display', 'none');
		$('.panel.selected').find('.panel-content').css('display', 'block');

		indexPosition = 0;
	    $tabcontrol.find('.panel').each(function( ) {
	  	  $( this ).attr("aria-labelledby", "panelheading" + indexPosition);
	  	  $( this ).find('.panel-heading')
		  	.attr("role", "tab")
		  	.attr("aria-controls", "panel" + indexPosition)
		  	.attr("aria-selected", "false")
		    .attr("tabindex", "0")
		  ;
	  	  indexPosition = indexPosition + 1;
	  	});
	    
	    indexPosition = 0;
	    $tabcontrol_menu.find('li').each(function( ) {
		  $( this )
		  	.attr("role", "")
		  	.attr("aria-controls", "")
		  	.attr("aria-selected", "")
		  ;
		  indexPosition = indexPosition + 1;
		});
		
		/* msteindl: welche ist die richtige Variante?
		indexPosition = 0;
	    $tabcontrol.find('.panel').each(function( ) {
	  	  $( this ).attr("aria-labelledby", "panelheading" + indexPosition);
	  	  $( this ).find('.panel-heading')
		  	.attr("role", "tab")
		  	.attr("aria-controls", "panel" + indexPosition)
		  	.attr("aria-selected", "false")
		    .attr("tabindex", "0")
		  ;
	  	  indexPosition = indexPosition + 1;
	  	});
	    $('.panel.selected').find('.panel-heading').attr("aria-selected", "true");
	    
	    indexPosition = 0;
	    $tabcontrol_menu.find('li').each(function( ) {
		  $( this )
		  	.attr("role", "")
		  	.attr("aria-controls", "")
		  	.attr("aria-selected", "")
		  ;
		  indexPosition = indexPosition + 1;
		});
		*/
	}
	else {
		$('.panel').find('.panel-content').css('display', 'block');
		//if each tab closed in mobile version: select first element when changing to desktop version
		if ($('.panel.selected').length == 0) {
			$tabcontrol.children().eq( 0 ).addClass('selected');
			$tabcontrol_menu.children().first().children().eq( 0 ).addClass('selected');
		}
		
		indexPosition = 0;
	    $tabcontrol.find('.panel').each(function( ) {
	  	  $( this ).attr("aria-labelledby", "tab" + indexPosition);
		  $( this ).find('.panel-heading')
		  	.attr("role", "")
		  	.attr("aria-controls", "")
		  	.attr("aria-selected", "")
		  ;
	  	  indexPosition = indexPosition + 1;
	  	});
	    
	    indexPosition = 0;
	    $tabcontrol_menu.find('li').each(function( ) {
		  $( this )
		  	.attr("role", "tab")
		  	.attr("aria-controls", "panel" + indexPosition)
		  	.attr("aria-selected", "false")
		    .attr("tabindex", "0")
		  ;
		  indexPosition = indexPosition + 1;

		});
	}
}



}
/*
     FILE ARCHIVED ON 19:30:48 Jul 22, 2021 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 19:31:07 Jan 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  exclusion.robots: 0.068
  exclusion.robots.policy: 0.058
  cdx.remote: 1.423
  esindex: 0.01
  LoadShardBlock: 250.072 (6)
  PetaboxLoader3.datanode: 239.354 (8)
  load_resource: 117.631 (2)
  PetaboxLoader3.resolve: 86.586 (2)
*/