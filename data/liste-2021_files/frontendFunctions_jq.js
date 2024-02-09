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

/*
@DESC Zentrales JS File fuer Frontend functions
@AUTH Fonda, Ueberarbeitet u.a. von HP

*/

/*
var langEN = {
    showMoreMessages  : "Show more",
	showLessMessages : "Show less",
	showMoreSpeakers: "Weitere RednerInnen anzeigen",
	showLessSpeakers: "Weniger RednerInnen anzeigen",
	minifyHistoryTable 	 : "Alle zuklappen",
	maximizeHistoryTable : "Alle aufklappen",
	pleaseWait	: "Please wait...",
	pleaseWaitForm	: "Filter wird aktualisiert...",
	jumpTo		: "Zu",
	altNextImage: "Next Image",
	altHideElement: "Unterpunkte verstecken",
	altShowElement: "Unterpunkte anzeigen",
	titleHideElement: "Unterpunkte verstecken",
	titleShowElement: "Unterpunkte anzeigen",
	closeLightbox: "Close",
	moveContent: "Diesen Inhalt nach oben oder unten verschieben (per Drag and Drop)",
	removeContent: "Diesen Inhalt aus persönlichem Profil entfernen",
	moveBookmark: "Dieses Lesezeichen nach oben oder unten verschieben (per Drag and Drop)",
	removeBookmark: "Dieses Lesezeichen löschen",
	aufnahmeDatum: "Date",
	originalGroesse: "Download in full size"
};

var langDE = {
    showMoreMessages  : "Weitere Meldungen",
	showLessMessages : "Weniger Meldungen",
	showMoreSpeakers: "Weitere RednerInnen anzeigen",
	showLessSpeakers: "Weniger RednerInnen anzeigen",
	minifyHistoryTable 	 : "Alle zuklappen",
	maximizeHistoryTable : "Alle aufklappen",
	pleaseWait	: "Bitte warten...",
	pleaseWaitForm	: "Filter wird aktualisiert...",
	jumpTo		: "Zu",
	altNextImage: "Nächstes Bild anzeigen",
	altHideElement: "Unterpunkte verstecken",
	altShowElement: "Unterpunkte anzeigen",
	titleHideElement: "Unterpunkte verstecken",
	titleShowElement: "Unterpunkte anzeigen",
	closeLightbox: "Schließen",
	moveContent: "Diesen Inhalt nach oben oder unten verschieben (per Drag and Drop)",
	removeContent: "Diesen Inhalt aus persönlichem Profil entfernen",
	moveBookmark: "Dieses Lesezeichen nach oben oder unten verschieben (per Drag and Drop)",
	removeBookmark: "Dieses Lesezeichen löschen",
	aufnahmeDatum: "Aufnahmedatum",
	originalGroesse: "ORIGINALGRÖSSE herunterladen"
};
*/

$=jQuery;

init=false;
lazyloaded=false;

function disable(selector) {
    $(selector).attr('aria-busy',true);
    $(selector+' :input').prop('disabled',true);
    $(selector+' .filterFieldsOverlay').addClass('show');
}

function enable(selector) {
    $(selector+' :input').prop('disabled',false);
    $(selector+' .filterFieldsOverlay').removeClass('show');
    $(selector).attr('aria-busy',false);
}

function getDocumentUri() {
    var duri=location.pathname;
    if (duri.endsWith('/')) {
        duri+='index.shtml';
    }
    return duri;
}

if (!evalFilterFields) {
	function evalFilterFields(fbez) {
        $('#filterListe' + fbez).html('Bitte warten...');
        document.getElementById('filterForm' + fbez).jsMode.value = 'FIELDS';
        $('#filterFields' + fbez +' input[name=xdocumentUri]').val(getDocumentUri());
		/* 				document.getElementById('filterForm' + fbez).xdocumentUri.value = '/';
		 */
        var params = $('#filterForm' + fbez).serialize();
        if (params==="") return;
        disable('#filterFields' + fbez);
		var myurl = '/Filter/filter.psp?' + params;

		//history.pushState({}, null, '?' + params);

		$
				.ajax({
					url : myurl,
					success : function(text) {
						$('#filterFields' + fbez)
								.replaceWith(text);
						hideFilterButtonsOnLoad();
                        LoadEnhancements();
                        enable('#filterFields' + fbez);
                        $('#filterListe' + fbez).html('Bitte führen Sie die Abfrage durch.');
					},
					error : function(data) {
						alert('Fehler beim Durchführen der Abfrage. Bitte versuchen Sie es später erneut.');
					}
				});
	}

	function resetFilterFields(fbez) {
		$('#filterListe' + fbez).html('');
        $('#filterFields' + fbez +' input[name=jsMode]').val('FIELDS');
        $('#filterFields' + fbez +' input[name=xdocumentUri]').val(getDocumentUri());
		var params = $('#filterForm'+fbez).serialize();
        disable('#filterFields' + fbez);
		var myurl = '/filter.psp?jsMode=ZUR&' + params;
		
		$
				.ajax({
					url : myurl,
					success : function(text) {
						$('#filterFields' + fbez)
								.replaceWith(text);
						hideFilterButtonsOnLoad();
                        LoadEnhancements();
                        enable('#filterFields' + fbez);
					},
					error : function(data) {
						alert('Fehler beim Durchführen der Abfrage. Bitte versuchen Sie es später erneut.');
					}
				});
	}

	function rearrangeFilterListe(fbez, params) {
		$('#filterListe' + fbez).html('Bitte warten...');
		var myurl = '/Filter/filterRearrange.psp?' + params;
		$.ajax({
			url : myurl,
			success : function(text) {
				$('#filterListe' + fbez).html(text);
				hideFilterButtonsOnLoad();
				LoadEnhancements();
			},
			error : function(data) {
				alert('Fehler beim Durchführen der Abfrage. Bitte versuchen Sie es später erneut.');
			}
		});
	}

	function evalFilterListe(fbez) {
		$('#filterListe' + fbez).html('Bitte warten (Ergebnisse werden geladen) ...');
		/********** MSTEINDL TEST ONLY **************/
		//$('#filterListe' + fbez).scrollTo();
		/********** MSTEINDL TEST ONLY **************/
		
		var params = $('#filterForm' + fbez).serialize();
        disable('#filterFields' + fbez);
		
		var myurl = '/Filter/filter.psp?jsMode=EVAL&' + params;
		$.ajax({
			url : myurl,
			success : function(text) {
				$('#filterListe' + fbez).html(text);		
				/********** MSTEINDL TEST ONLY **************/
				//history.replaceState( {} , window.location.pathname, window.location.pathname+'?'+params.replace(/jsMode=.*?&/,"") );
				/********** MSTEINDL TEST ONLY **************/
				
				hideFilterButtonsOnLoad();
				LoadEnhancements();
                enable('#filterFields' + fbez);
			},
			error : function(data) {
				alert('Fehler beim Durchführen der Abfrage. Bitte versuchen Sie es später erneut.');
			}
		});
	}
		
	function evalRssListe(fbez) {
		var rssFormName='filterForm'+fbez;
		var errors = $('div.formularFehler');
		for (var i = 0; i < errors.length; i++) {
			errors[i].remove();
		}
		var params = $('#'+rssFormName).serialize();
		var url = 'filter.psp?view=RSS&' + params;
		window.open(url, '_self', false);
	}
}



if (!evalFilterFieldsNew) {
	function evalFilterFieldsNew(fbez) {
	    //TODO	    
	}

	function resetFilterFieldsNew(fbez) {
	    //TODO
	}	
	
	function evalForm(item) {
		container = $(item).up('.filterContainer');
		
		container.css('opacity',0.3);
		
		var params = $(item).up('form').serialize();
		var myurl = '/Filter/filter.jsf?' + params;	
				
		
		$.ajax({
			url : myurl,
			success : function(text) {
				container.hide();	
				container.css('opacity',1);
				container.html(text);
				hideFilterButtonsOnLoad();
				container.fadeIn(500);
				InitializePage();
			},
			error : function(data) {
				alert('Fehler beim Durchführen der Abfrage. Bitte versuchen Sie es später erneut.');
			}
		});
	}

	function evalListe(item, url,params) {		
		var myurl = '/Filter/'+url+'?' + params;		
		liste=$(item).up('.filterListe');		
		liste.css('opacity',0.3);
				
		$.ajax({
			url : myurl,
			success : function(text) {
				liste.hide();	
				liste.css('opacity',1);
				liste.html(text);
                hideFilterButtonsOnLoad();
				liste.fadeIn(500);
                $('html, body').animate({
                    //scrollTop : liste.offset().top-96
                    scrollTop : liste.offset().top- ( window.innerHeight / 2 )
                });
				InitializePage();
			},
			error : function(data) {
				alert('Fehler beim Durchführen der Abfrage. Bitte versuchen Sie es später erneut.');
			}
		});
	}

	function evalFilterListeNew(item) {
	    //TODO
	}
	
}











/*
@DESC Zentrales JS File fuer Frontend functions
@AUTH Fonda, Ueberarbeitet u.a. von HP

*/

/*
* Function: getOpenCloseState
* 
* This function reads the saved open/close state from the session storage object.
*  
* 
* Parameters:

none.

Required language strings:
	  
none.
   
Returns:

An object array of open/close states where the key is the id of the control and the value is 0 or 1 (0 means closed, 1 means open).
*/


getOpenCloseState = function () {
   if (window.sessionStorage != null) {
      var openCloseState = new Object();
      if (window.sessionStorage["OpenCloseState" + "-" + location.pathname] != null) {
         var splitStates = window.sessionStorage["OpenCloseState" + "-" + location.pathname].split(";");
         for (var i = 0 ; i < splitStates.length ; i++) {
            var splitState = splitStates[i].split(":");
            openCloseState[splitState[0]] = splitState[1];
         }
      }
      return openCloseState;
   }
}

 /*
 * Function: saveOpenCloseState
 * 
 * This function saves the current open/close state in the session storage object.
 *  
 * 
 * Parameters:
 
 openCloseState: An object array of open/close states where the key is the id of the control and the value is 0 or 1 (0 means closed, 1 means open).
 
 Required language strings:
       
 none.
    
 Returns:
 
 nothing.
 */
 saveOpenCloseState = function(openCloseState) {
    if (window.sessionStorage != null) {
       var result = ""
       for (var item in openCloseState) {
          if (item != null) {
             if (result.length > 0) {
                result += ";";
             }
             result += item + ":" + openCloseState[item];
          }
       }
       window.sessionStorage["OpenCloseState" + "-" + location.pathname] = result;
    }
 }
 
 /*
 * Function: restoreOpenCloseState
 * 
 * This function restores the saved open/close state.
 *  
 * 
 * Parameters:
 
 none.
 
 Required language strings:
       
 none.
    
 Returns:
 
 nothing.
 */
 restoreOpenCloseState = function() {
    if (window.sessionStorage != null) {
       var openCloseState = getOpenCloseState();
       for (var item in openCloseState) {
          if (item != null && $('#'+item.substring(1)).length != 0) {
             if (item.startsWith('C')) {
                // Don't toggle items with a forced display state
                if($(item.substring(1)).up().hasClass('forceOpenedContentBlock') || $('#'+item.substring(1)).up().hasClass('forceClosedContentBlock')) {
                    // don't restore
                }
                // content block
                else if ((openCloseState[item] == "0") != $('#'+item.substring(1)).up().hasClass('closedContent')) {
               		  if ($(item.substring(1)).href!=undefined) {
	                     	if (($(item.substring(1)).href).indexOf('javascript:') >= 0) {
	                      		 // execute javascript action (ie. list filter results)
	                       		eval($(item.substring(1)).href);
	                     	}
               		  }
                      toggleContentBlockById ($('#'+item.substring(1)).up(), "div");
                }
             }
             else if (item.startsWith('H')) {
                // history overview
                if ((openCloseState[item] == "1") != $('#'+item.substring(1)).up('tbody').hasClass('open')) {
                   toggleHistoryTableOverview($('#'+item.substring(1)), 'toggle');
                }
             }
          }
       }
    }
 }
 
 /*
 * Function: getOpenCloseState
 * 
 * This function returns the "Informationen einblenden" state in the session storage object.
 *  
 * 
 * Parameters:
 
 none
 
 Required language strings:
       
 none.
    
 Returns:
 
 true: show paragraf info, false: don´t show paragraf info
 */
 getShowParagrafState = function() {
    if (window.sessionStorage != null) {
       var state = window.sessionStorage["ShowParagrafState" + "-" + location.pathname];
       if (state != null) {
          if (state == "1") {
             return true;
          }
          return false;
       }
    }
    return true;
 }
 
 /*
 * Function: saveOpenCloseState
 * 
 * This function saves the "Informationen einblenden" state in the session storage object.
 *  
 * 
 * Parameters:
 
 showParagrafState: true: show paragraf info, false: don´t show paragraf info
 
 Required language strings:
       
 none.
    
 Returns:
 
 nothing.
 */
 saveShowParagrafState = function(showParagrafState) {
    if (window.sessionStorage != null) {
       if (showParagrafState) {
          window.sessionStorage["ShowParagrafState" + "-" + location.pathname] = "1";
       }
       else {
          window.sessionStorage["ShowParagrafState" + "-" + location.pathname] = "0";
       }
    }
 }
 
 /*
 * Function: printCalendarOnly
 * 
 * This function replaces the general print CSS (druck.css) with a special print CSS (druck-kalenderonly.css)
 *  
 * 
 * Parameters:
 
 calenderonly 
 true: css/druck-kalender2.css
 false: css/druck.css
 
 Required language strings:
       
 none.
    
 Returns:
 
 nothing.
 */
 printCalendarOnly = function (calenderonly) {
     if (calenderonly == true) {
         $('#druckcss').attr('href', '/css/druck-kalenderonly.css');
         $('#printpagelink').attr('onclick', 'printCalendarOnly(false);');
     }
     else {
         $('#druckcss').attr('href', '/css/druck.css');
     }
 }
 
 registerPrintpreviewOnLoad = function () {
     if ($('#printpreviewlink').length > 0) {
         if (jQuery.browser.msie) {
             $('#printpreviewlink').css('display', 'inline');
         }
     }
 }
 
 printpreview = function () {
     $('#druckcss').attr('href', '/css/druck-kalenderonly.css');
     $('#printpagelink').attr('onclick', 'printCalendarOnly(false);');
 
     if (jQuery.browser.msie) {
         var OLECMDID = 7;
         /* OLECMDID values:
         * 6 - print
         * 7 - print preview
         * 1 - open window
         * 4 - Save As
         */
         var PROMPT = 1; // 2 DONTPROMPTUSER
         var WebBrowser = '<OBJECT ID="WebBrowser1" WIDTH=0 HEIGHT=0 CLASSID="CLSID:8856F961-340A-11D0-A96B-00C04FD705A2"></OBJECT>';
         document.body.insertAdjacentHTML('beforeEnd', WebBrowser);
         WebBrowser1.ExecWB(OLECMDID, PROMPT);
         WebBrowser1.outerHTML = "";
     }
 }
 
 
 /*
 Function: registerBookmarksOnLoad
 
 This function hides the button "Anzeigen" from the bookmarks teaser box and replaces the 
 selection with a direct side call onclick 
 
 Parameters:
 
 none
 
 Required language strings:
       
 none
 
 Returns:
 
 nothing.
 */
 var lastlesezeichenvalue = 'all';
 registerBookmarksOnLoad = function () {
     if ($('.lesezeichenButton').length > 0) {
         $('.lesezeichenButton').hide(); 
         $('.lesezeichen select').bind('change', function (event) {
             var element = $(event.target);
             if (element.val() != $('#lesezeichen').children().first().val()) {
				 $(this).up('form').submit();
             }
             else {
                 lastlesezeichenvalue = element.val();
             }
 
         });
     }
 };
 
 
 /*
 Function: hideContentBlocksOnLoad
 
 This function hides all toggleable content blocks (div-elements after a headline with class '.toggleContentBlock')
 
 Parameters:
 
 none
 
 Required language strings:
 
 none.
 
 Returns:
 
 nothing.
 */
 hideContentBlocksOnLoad = function () {
     var arrContentBlockClass = new Array('.zeigeInsideContentBlock', '.zeigeContentBlock');
     jQuery.each(arrContentBlockClass, function (i, strClassName) {
         jQuery.each($(strClassName), function (i, elementId) {
                 hideOneContentBlock($(elementId));
                 if (location.hash != "" && $(elementId).prevAll('a').first().length != 0 && $(elementId).prevAll('a').first().attr("name") == location.hash.substring(1)) {
                     var nextElement = $(elementId).next();
                     if (nextElement.length == 0) return;
                     var nodeName = nextElement.prop("nodeName").toLowerCase();
                     toggleContentBlockById (elementId, nodeName);
				}
         });
     });
 };
 hideContentBlocksOnReload = function (contentBlockState, rootElement) {
     var arrContentBlockClass = new Array('.zeigeInsideContentBlock', '.zeigeContentBlock');
     var i = 1;
     
     if (rootElement == null) {
       rootElement = $('container');
     }
     
     jQuery.each(arrContentBlockClass, function (i, strClassName) {
         rootElement.find(strClassName).each(function (elementId) {
             var nextElement = $(elementId).next();
             if (contentBlockState.indexOf('|' + i + '|') != -1) {
                if (!nextElement.hasClass('showContentBlock'))  {
                   nextElement.addClass('showContentBlock');
                }
             }
             else {
                if (nextElement.hasClass('showContentBlock'))  {   
                   nextElement.removeClass('showContentBlock');
                }
             }
                hideOneContentBlock($(elementId));
             i++;
         });
     });
 };
 getContentBlocksState = function (rootElement) {
     var arrContentBlockClass = new Array('.zeigeInsideContentBlock', '.zeigeContentBlock');
     var i = 1;
     var state = '|';
     
     if (rootElement == null) {
       rootElement = $('container');
     }
        jQuery.each(arrContentBlockClass, function (i, strClassName) {
            rootElement.find(strClassName).each(function (elementId) {
                if (!elementId.hasClass('closedContent')) {
                   state = state + i + '|';
                }
                i++;
            });
        });
 
     return state;
 };
 hideSitemapBlocksOnLoad=function()
 {
      var arrContentBlockClass=new Array('.zeigeSitemapBlock');
      jQuery.each(arrContentBlockClass, function (i, strClassName) {
              jQuery.each($(strClassName), function(i, elementId){
                  hideOneSitemapBlock(elementId);
              });
      });
 };
 
 hideOneContentBlock = function (elementId) {
     var nextElement = elementId.next();
     if (nextElement == null) return;
     var nodeName = nextElement.prop("nodeName").toLowerCase();
     var toggleImage = elementId.down('img');
     if ((nextElement.prop("className") == null || nextElement.prop("className").indexOf('showContentBlock') < 0) && ($(elementId).prop("className").indexOf('forceOpenedContentBlock') == -1)) {
          nextElement.hide();
          toggleImage.attr("src", '/img/icons/small/Plus.gif');
          toggleImage.attr("alt", lang.altShowElement);
          toggleImage.attr("title", lang.titleShowElement);
 
          elementId.addClass('closedContent');
     }
     else {
          toggleImage.attr("src", '/img/icons/small/minus.gif');
          toggleImage.attr("alt", lang.altHideElement);
          toggleImage.attr("title", lang.titleHideElement);
     }
     if (nodeName == 'div') {
          elementId.down('a').unbind('click');
          elementId.down('a').bind('click', function (event) { toggleContentBlock(event, nodeName) });
          elementId.down('a').identify();
     }
     else {
          elementId.unbind('click');
          elementId.bind('click', function (event) { toggleContentBlock(event, nodeName) });
     }
 };
 hideOneSitemapBlock=function(elementId)
 {
     var nodeName = elementId.next().next().prop("nodeName").toLowerCase();
     if(elementId.nextAll(nodeName).first().prop("className") == null || elementId.next(nodeName).prop("className").indexOf('showContentBlock') < 0)
     {
        elementId.nextAll(nodeName).first().hide();
        elementId.down('img').attr("src", '/img/icons/small/Plus.gif');
        elementId.down('img').attr("alt", lang.altShowElement);
        elementId.down('img').attr("title", lang.titleShowElement);
        elementId.addClass('closedContent');
     }
     else
     {
        elementId.down('img').attr("src", '/img/icons/small/minus.gif');
        elementId.down('img').attr("alt", lang.altHideElement);
        elementId.down('img').attr("title", lang.titleHideElement);
     }
     elementId.bind('click', function(event){toggleContentBlock(event,nodeName)});
 };
 
 hideHiddenContentAndShowToggleTeaser=function()
 { 
    if (typeof(pageHasHiddenContent) != "undefined") {
       if(pageHasHiddenContent && ($('#paragraphTeaser').length > 0)) {
          $('#paragraphTeaser').show();
          $('.content__paragraph').show();
          showParagraf = getShowParagrafState();
          toggleParagrafStyle();
       }
    }
 }
 var showParagraf = true;
 toggleParagrafStyle=function () {
     saveShowParagrafState(showParagraf);
     if (showParagraf) {
         changecss('.paragraf','display','none');
         showParagraf = false;
         if ($('#toggleParagrafButton').length > 0) {
             $('#paragraphTeaser a').html('§ Informationen einblenden');
             $('.content__paragraph a').html('§ Informationen einblenden');			 
             $('[id^=toggleParagrafButton]').attr('title', 'Ausgeblendete Informationen einblenden');
         }
     } else {
     changecss('.paragraf','display','inline');
     showParagraf = true;
     if ($('#toggleParagrafButton').length > 0) {
             $('#paragraphTeaser a').html('§ Informationen ausblenden');
             $('.content__paragraph a').html('§ Informationen ausblenden');
             $('[id^=toggleParagrafButton]').attr('title', 'Zusätzliche Informationen ausblenden');
         }
     }
 }
 /*
 * Function: toggleContentBlock
 * 
 * This function toggles a content block followed by an link which triggers the
 * event. Possible block-types are 'div' or 'table'
 * 
 * Parameters:
 * 
 * event - the link which triggered the method strBlockType - string. either
 * 'div' or 'table'
 * 
 * Required language strings:
 * 
 * lang.showMoreMessages
 * 
 * Returns:
 * 
 * nothing.
 */
 
 toggleContentBlock = function (event, strBlockType) {
     var element = $(event.target);
 
     if (element.prop("nodeName").toLowerCase() == 'img') {
         element = element.up('a');
     }
 
     if (strBlockType == 'div' || strBlockType == 'table') {
         element = element.up();
     }
     
     toggleContentBlockById (element, strBlockType);
 }
 
 toggleContentBlockById = function (elementId, strBlockType) {
     var arrIconInsideContentBlock = new Array('/img/icons/small/minus.gif', '/img/icons/small/Plus.gif');
     var arrIconContentBlock = new Array('/img/icons/small/minus.gif', '/img/icons/small/Plus.gif');
 
     if ($(elementId).up().hasClass('zeigeInsideContentBlock')) {
         var strMinusIconPath = arrIconInsideContentBlock[0];
         var strPlusIconPath = arrIconInsideContentBlock[1];
     }
     else {
         var strMinusIconPath = arrIconContentBlock[0];
         var strPlusIconPath = arrIconContentBlock[1];
     }
 
     if ($(elementId).nextAll(strBlockType).length > 0) {
       $(elementId).nextAll(strBlockType).first().toggle();
       
        var openCloseState = getOpenCloseState();
        //if ($(elementId).nextAll(strBlockType).first().is(":visible")) {
        if ($(elementId).nextAll(strBlockType).first().css('display') != "none") {
            $(elementId).removeClass('closedContent');
            $(elementId).down('img')
                  .attr("src", strMinusIconPath)
               .attr("alt", lang.altHideElement)
               .attr("title", lang.titleHideElement);
            
            if (($(elementId).down('a').length != 0) && ($(elementId).down('a').attr("title") == 'Bereich aufklappen')) {
               $(elementId).down('a').attr("title", 'Bereich zuklappen');
            }
            if (openCloseState != null) {
               openCloseState['C' + $(elementId).down('a').attr("id")] = "1";
            }
        }
        else {
            $(elementId).addClass('closedContent');
            $(elementId).down('img')
                  .attr("src", strPlusIconPath)
               .attr("alt", lang.altShowElement)
               .attr("title", lang.titleShowElement);
            if (($(elementId).down('a').length != 0) && ($(elementId).down('a').attr("title") == 'Bereich zuklappen')) {
               $(elementId).down('a').attr("title", 'Bereich aufklappen');
            }
            if (openCloseState != null) {
               openCloseState['C' + $(elementId).down('a').attr("id")] = "0";
            }
        }
        saveOpenCloseState(openCloseState);
     }
 };
 /*
 Function: getShowMoreLinkCaption
 
 This is a helper function for: hideMoreMessagesOnLoad(), hideMoreMessages(), toggleMoreMessages()
    
 This function retrieves the caption for "show more ..." elements. 
    
 If it is used for: 
 - list elements: The function searches for the first occurence of 
 'p.mehrAnzeigenLinkMehrText' and 'p.mehrAnzeigenLinkWenigerText' within
 a the parent div.contentBlock Container. 
 - table elements: The function searches within the current div (pagination-div)
 for the mentioned classes.
    
 If no custom text was found it defaults to lang.showMore and lang.showLess
 
 Parameters:
 
 strContainerId - either the ul,ol or dl element of the list OR a div element which follows after a table
 strType - string. either 'list' or 'table'
 strAction - string. either 'more' or 'less'
 
 Required language strings:
       
 lang.showMore
 lang.showLess
    
 Returns:
 
 nothing.
 */
 getShowMoreLinkCaption = function (strContainerId, strType, strAction) {
     var strShowMoreText = lang.showMore;
     var strShowLessText = lang.showLess;
 
     if (strType == 'list') {
         if ($(strContainerId).up('div.contentBlock').down('p.mehrAnzeigenLinkMehrText')) {
             strShowMoreText = $(strContainerId).up('div.contentBlock').down('p.mehrAnzeigenLinkMehrText').html();
         }
 
         if ($(strContainerId).up('div.contentBlock').down('p.mehrAnzeigenLinkWenigerText')) {
             strShowLessText = $(strContainerId).up('div.contentBlock').down('p.mehrAnzeigenLinkWenigerText').html();
         }
     }
     else {
         // table		
         if ($(strContainerId).down('p.mehrAnzeigenLinkMehrText')) {
             strShowMoreText = $(strContainerId).down('p.mehrAnzeigenLinkMehrText').html();
         }
 
         if ($(strContainerId).down('p.mehrAnzeigenLinkWenigerText')) {
             strShowLessText = $(strContainerId).down('p.mehrAnzeigenLinkWenigerText').html();
         }
     }
     if (strAction == 'more') {
         return strShowMoreText;
     }
     else {
         return strShowLessText;
     }
 }
 /*
 Function: hideMoreMessagesOnLoad
 
 This function hides all messages with class 'more' within all divs in the dom with 
 class '.mehrAnzeigen' and adds a block "show more..." per div instead.
 
 Parameters:
 
 none
 
 Required language strings:
       
 lang.showMoreMessages
    
 Returns:
 
 nothing.
 */
 hideMoreMessagesOnLoad = function () {
     // travesere all divs to insert mehrAnzeigenLink-Section if needed
     jQuery.each($('.mehrAnzeigen'), function (i, listId) {
 
         // set default values if no p.mehrAnzeigenLinkMehrText is set		
         var strShowMoreText = getShowMoreLinkCaption(listId, 'list', 'more'); ;
 
         if ($(listId).up('div.contentBlock').length > 0) {
             var containerId = $(listId).up('div.contentBlock');
             $(containerId).append('<div class="mehrAnzeigenLink"><hr><p><a href="javascript:void(0);" onclick="toggleMoreMessages(this,' + "'div'" + '); return false;"><span>' + strShowMoreText + '</span> <img src="/img/icons/small/Weitere_anzeigen.gif" alt="" class="icon" /></a></p></div>', { position: 'bottom' });
         }
     });
     jQuery.each($('div.mehrAnzeigenTabelle'), function (i, containerId) {
         // set default values if no p.mehrAnzeigenLinkMehrText is set		
         var strShowMoreText = getShowMoreLinkCaption(containerId, 'table', 'more');
         $(containerId).prepend('<a href="javascript:void(0);" class="floatLeft" onclick="toggleMoreMessages(this,' + "'table'" + '); return false;"><span>' + strShowMoreText + '</span> <img alt="" class="icon" src="/img/icons/small/Weitere_anzeigen.gif"></a>');
     });
 
     // hide all hidden elements by default, if no javascript is supported those will show up
     jQuery.each($('.more'), function (i, id) {
         $(id).hide();
     });
	 
	 jQuery.each($('div.mehrAnzeigenDiv'), function (i, containerId) {
        // set default values if no p.mehrAnzeigenLinkMehrText is set		
        var strShowMoreText = "";
        $(containerId||' .more').after('<a href="javascript:void(0);" class="absoluteRight" onclick="toggleMoreMessages(this,' + "'div'" + '); return false;"><img alt="" class="icon" src="/img/icons/small/Weitere_anzeigen.gif"></a>');
    });	

 };
 
 
 /*
 Function: hideMoreMessages
 
 This function hides all messages with class 'more' within a div 'containerId'
 and adds a block "show more..." per div instead.
 
 Parameters:
 
 containerId - the target container element
 
 Required language strings:
       
 lang.showMoreMessages
    
 Returns:
 
 nothing.
 */
 hideMoreMessages = function (containerId) {
     if ($(containerId).down('li.more')) {
         var strShowMoreText = getShowMoreLinkCaption($(containerId).down('li.more'), 'list', 'more');
 
         $(containerId).append('<div class="mehrAnzeigenLink"><hr><p><a href="javascript:void(0);" onclick="toggleMoreMessages(this,' + "'div'" + '); return false;"><span>' + strShowMoreText + '</span> <img src="/img/icons/small/Weitere_anzeigen.gif" alt="" class="icon" /></a></p></div>', { position: 'bottom' });
         // hide all hidden elements by default, if no javascript is supported those will show up
         $(containerId).find('li.more').each(function (i, id) {
             $(id).hide();
         });
     }
 }
 
 function scrollToName(name) {

    if (S_GET('noscroll')!=undefined) {
        return;
    }
     name = name.replace(':', '\\:');
     name = name.replace('#', '');
     var e = $("[name='" + name + "']");
     var i = $("[id='" + name + "']");
     
     if(e.length == 0 && i.length > 0) {
    	 e = i;
     }
     
     if (e != null && e.length > 0) {
         //scroll to element in center of window
    	 
         if (e.offset()==null) {
             return;
         }
         
         //var scroll = e.offset().top - (window.innerHeight / 2);
         var scroll = e.offset().top;
         $('html, body').animate({
             scrollTop : scroll
         }, 1000);
         e.focus();
         e.select();
     }
 }
 
 function scrollToElement(elementID) {	
     elementID=elementID.replace(':','\\:');			
     var e = $("#" + elementID);
     if(e != null) {
         //scroll to element in center of window
         
         if (e.offset()==null) {
             return;
         }
         
         var scroll = e.offset().top - ( window.innerHeight / 2 );
         $('html, body').animate({
             scrollTop: scroll
         }, 1000);		
         e.focus();
         e.select();
     }
 }		
 
 /*
 Function: registerToolTipsOnLoad
 
 This function creates the required tooltips for each image with class ".zeigeTooltip"
 and binds them to the tooltip class.
 
 Parameters:
 
 none
    
 Returns:
 
 nothing.
 */
 registerToolTipsOnLoad = function (cssClassName) {
 
 //  Opentip.styles.pdtooltip = {
 //    showOn: 'mouseover',
 //    tipJoint: 'middle left',
 //    Shadow: 'false',
 //    borderWidth: '1',
 //    borderRadius: '0',
 //    background: '#F8F8F8',
 //    borderColor: '#868686'
 //  };
 
 //  if(cssClassName == null) {
 //    cssClassName = 'zeigeTooltip';
 //  };
 //  $('.'+cssClassName).each(function(i,elementId) {
 //    if (!$(elementId).attr('title')){ 
 //      var content1 = $(elementId).attr('alt');
 //    } else {
 //      var content1 = $(elementId).attr('title');
 //      $(elementId).attr('title', '');
 //      $(elementId).attr('alt', content);
 //    }
 //    new Opentip($(elementId), content1, {style: 'pdtooltip'});
 //  });
 
   var options = {
       position: {my: 'left+15',at: 'right+15', collision:'flipfit' },
       track: true,
       show: true,
	   trigger : 'hover'
     };
   var isResponsive = $('body').hasClass('is-responsive'); 

		$('.zeigeTooltip').filter(function (idx,el) {
            $el = $(el)
   
            // - Fonda, Ulrich: Here we decide if we want the tooltip on mobile            
            if (isResponsive) {
                if ($el.attr('id') == 'vorleseSpeakerImage') {
                    return false;
                }
                if ($el.parent().hasClass('addBookmark') || $el.hasClass('tooltip-lightbox')) {
                    return false;
                }				
            }
            return true;
        }).tooltip(options);
   
   
        //iOS Double Tap Fix?
        $('.zeigeTooltip').on('touchstart mouseenter focus', function(e) {
            if(e.type == 'touchstart') {
                $(this).click();
            }
            // Show the submenu here
        }); 
 
 };
 /*
 Function: toggleMoreMessages
    
 This function toggles all messages with class 'more' within a div  
 '.mehrNachrichten' and toggles a block "show more... / show less...".
 
 Parameters:
 
 id - The id of the functions trigger element (a link)
 strContainerType - container type either table or div
 
 Required language strings:
       
 lang.showMore - fallback
 lang.showLess - fallback
    
 Returns:
 
 nothing.
 */
 
 toggleMoreMessages = function (id, strContainerType) {
     // traverse up two steps in dom and toggle all 'more' elements beyond
     var lastToggledMessageId;
 
     if (strContainerType == 'table') {
         // set default values if no p.mehrAnzeigenLinkWenigerText is set		
         var strShowMoreText = getShowMoreLinkCaption($(id).up('div.mehrAnzeigenTabelle'), 'table', 'more'); ;
         var strShowLessText = getShowMoreLinkCaption($(id).up('div.mehrAnzeigenTabelle'), 'table', 'less'); ;
 
         $(id).up('div').prevAll('table').first().find('tr.more').each(function (i, messageId) {
             $(messageId).toggle();
             lastToggledMessageElement = messageId;
         });
 
         if ($(lastToggledMessageElement).is(":visible")) {
             $(id).down('span').html(strShowLessText);
 
             setExpandOrCollapseIcon($(id).down('img'), false);
         }
         else {
 
             $(id).down('span').html(strShowMoreText);
 
             setExpandOrCollapseIcon($(id).down('img'), true);
         }
     }
     else {
         // set default values if no p.mehrAnzeigenLinkWenigerText is set		
         var strShowMoreText = getShowMoreLinkCaption(id, 'list', 'more'); ;
         var strShowLessText = getShowMoreLinkCaption(id, 'list', 'less'); ;
 
         $(id).up('div.contentBlock').find('.more').each(function (i, messageId) {
             $(messageId).toggle();
             lastToggledMessageElement = messageId;
         });
 
         if ($(lastToggledMessageElement).is(":visible")) {
 
             $(id).down('span').html(strShowLessText);
 
             setExpandOrCollapseIcon($(id).down('img'), false);
         }
         else {
 
             $(id).down('span').html(strShowMoreText);
 
             setExpandOrCollapseIcon($(id).down('img'), true);
         }
     }
 };
 
 /* TAB MENUS */
 
 /*
 Function: hideTabMenuTabsOnLoad
 
 Searches the dom for classes 'reiterBlock' and hides them except the first one.
 Additionally all 'reiterHeadline' Headlines are hidden.
 
 Parameters:
 
 none.
       
 Returns:
 
 nothing.
 */
 
 hideTabMenuTabsOnLoad = function () {
     firstTabShown = false
     tabLinkFound = false;
     firstTabLinkFound = false;
     anchorElement = null;
     
     hash = location.hash;
     
     if (location.hash !== "") {
         anchorElement = $(hash);
    }
 
     // hide the content of the not displayed tabs
     jQuery.each($('.reiterBlock'), function (i, blockId) {
         if (hash != "" && hash.substring(0, 4) == '#tab') {
             // the id of the header is the same as the hash (without the '#')
             if ($(blockId).down('h2').attr("id") != hash.substring(1)) {
                 $(blockId).hide();
             }
         }
         else if (location.hash != "") {
             // search for the anchor in this tab
             if ($(blockId).find('a[name=' + hash.substring(1) + ']').length > 0)   {
                 // found the anchor, set the hash value to the tab hash
                 hash = '#' + $(blockId).down('h2').attr("id");
             }
             else {
                 $(blockId).hide();
             }
         }
         else if (firstTabShown) {
             $(blockId).hide();
         }
         firstTabShown = true;
     });
 
     //?
     $('.reiterHeadline').addClass('hidden');
 
     // save the navigation items in tabMenuContent and tabMenuTitle and get the tab to display
     jQuery.each($('.reiterNavigation'), function (i, blockId) {
         $(blockId).find('li').each(function (i, menuElement) {

             if ($(menuElement).down('a').length != 0) {
                 tabMenuContent.push($(menuElement).html());
                 tabMenuTitle.push($(menuElement).down('a').html());
 
                 if (!firstTabLinkFound) {
                     firstTabLink = $(menuElement).down('a');
                     firstTabLinkFound = true;
                 }
 
                 if (!tabLinkFound) {
                     if (hash != "" && hash.substring(0, 4) == '#tab') {
                         // search for a tab with the given hash
                         if ($(menuElement).down('a').prop("hash") == hash) {
                             tabLinkFound = true;
                             tabLink = $(menuElement).down('a');
                         }
                     }
                     else {
                         // take the first tab
                         tabLinkFound = true;
                         tabLink = firstTabLink;
                     }
                 }
             }
         });
     });
     
     // Set menu item as active item
     try {
	     if (tabLinkFound) {
	         toggleTabMenu(tabLink, (hash == location.hash) && (!firstTabLinkFound || (tabLink != firstTabLink)));
	     }
	     else if (firstTabLinkFound && hash != "" && hash.substring(0, 4) == '#tab') {
	         // given tab was not found --> show the first one
	         toggleTabMenu(firstTabLink, false);
	     }
	     
	     if ((anchorElement != null) && $(anchorElement).hasClass('historieOverviewToggle')) {
	         // show the details of the group
	         toggleHistoryTableOverview(anchorElement, 'show');
	     }
     } catch (e) {
     	console.log ('Tabs not initialized.')
     }
 }
 
 /*
 Function: toggleTabMenuByHash
 
 This function changes the active tab of the current menu and shows the associated content.
 
 Parameters:
 
 hash - the hash of the tab to activate (ie '#tab-Uebersicht').
           
 Returns:
 
 true:   found tab with the hash value
 false:  hash value not found.
 */
 
 function toggleTabMenuByHash(hash) {
     jQuery.each($('.reiterNavigation'), function (i, blockId) {
         $(blockId).find('li').each(function (i, menuElement) {
             if (($(menuElement).down('a').length != 0) && ($(menuElement).down('a').prop("hash") == hash)) {
                 toggleTabMenu($(menuElement).down('a'));
                 return true;
             }
         });
     });
     return false;
 }
 
 /*
 Function: toggleTabMenu
 
 This function changes the active tab of the current menu and shows the associated content.
 
 Parameters:
 
 trigger - the tab to activate.
 setHash - if true, sets the current hash value to the hash value of the trigger (true is default)
       
 Returns:
 
 nothing.
 */

 /*
 Function: toggleTabMenu
 
 This function changes the active tab of the current menu and shows the associated content.
 
 Parameters:
 
 trigger - the tab to activate.
 setHash - if true, sets the current hash value to the hash value of the trigger (true is default)
       
 Returns:
 
 nothing.
 */

 
 
 
 toggleTabMenu = function (trigger, setHash) {
	     if (typeof setHash == "undefined" || setHash && (location.hash != trigger.hash)) {
	         // - Fonda, Ulrich: Push History.js state            
			 // msteindl: DOES NOT WORK WITH DOTS, see https://github.com/browserstate/history.js/issues/477			
			// msteindl: jQuery history destroys url if trigger contains '.'	
			 /*
			 if (trigger.hash!=undefined && trigger.hash.indexOf('.')<1) {			
				History.pushState(null, null,trigger.hash);
			 }
			 */
			 
			 if (trigger.hash!=undefined) {
				location.replace (location.protocol + "//" + location.host + location.pathname + location.search + trigger.hash);
			 }
	      }
	  
	     // - Fonda, Ulrich: Added a plain Switch here, wont mess with detail logic            
	     // - is responsive tab            
	     var triggerHref = $(trigger).attr('href').replace('.','\\.');
	  
	     $('.reiterBlock').hide();
	     $(triggerHref).parent().show();
	  
	     if ($(trigger).parents('.tabs-responsive').length) {
	         var $container = $(trigger).parents('.tabs-responsive');
	         $container.find('li').removeClass('active');
	         $(trigger).parent().addClass('active');
	         var $moreTab = $container.find('.tabs-responsive__tab--more');
	         if ($moreTab.find('.active').length) {
	             $moreTab.addClass('has-active-child');
	 
	          } else {
	              $moreTab.removeClass('has-active-child');
	          }
	          $legacyTrigger = $('.reiterNavigation a[href="' + $(trigger).attr('href') + '"]');
	      } else {
	          $legacyTrigger = $(trigger);
	      }
	  
	      // mark the current tab active, all others are set to inactive            
	      $legacyTrigger.parents('.reiterNavigation').find('.reiterAktiv').removeClass('reiterAktiv');
	      $legacyTrigger.parent().addClass('reiterAktiv');
	 
	     
	  };
	  
	  // - Fonda, Ulrich: Switching responsive tabs on anchorchange
	  // msteindl: NOT WORKING
	  
	  /*
	  History.Adapter.bind(window, 'anchorchange', function () {
	      var $ = jQuery;
	      var currentHash = '#' + History.getHash();
	      // - find tab with this            
	     // - find a tab with such a hash and restore contents            
	      var $tabWithHash = $('.tabs-responsive a[href="' + currentHash + '"]');
	      toggleTabMenu($tabWithHash, false);
	  });
	  */
	  
 /* TABLE HISTORY */
 
 /*
 Function: initHistoryTableOnLoad
 
 Collapses all Detail and Overview fields of all found tables on load.
 
 Parameters:
 
 none
   
 Returns:
 
 nothing.
 */
	  
	  initHistoryTableOnLoad = function () {
		     var first = true;
		     var header = false;
		     jQuery.each($('.tabelleHistorie'), function (i, elementId) {
		         //toggleHistoryTable (elementId, 'hide');
		         
		         // collapse / open the content
		         //$(elementId).find('.historieDetail').each(function (i, detailId) {
		         $(elementId).find('.historieDetail').each(function (i, detailId) {
		             toggleHistoryTableDetail(detailId, 'hide');
		         });
		         
		         //$(elementId).find('tbody').each(function (i, tbodyId) {
		         $(elementId).find('tbody').each(function (i, tbodyId) {
		             var firstRow = $(tbodyId).down('tr.historyHeader');
		             if (firstRow.length != 0) {
		                 setExpandOrCollapseIcon($(firstRow).down('img'), true);
		                 $(firstRow).nextAll().each(function (i, rowId) {
		
		                     if (!$(rowId).hasClass('historyShowAlways') && !$(rowId).hasClass('table-history-mobile')) {
		                         $(rowId).toggle();
		                     }
		                 });
		             }
		          });
		 
		         $(elementId).find('.historieDetailToggle').each(function (i, overviewId) {
		             toggleHistoryTableDetail(overviewId, 'hide');
		         });
		     });
		 } 
 
 /*
 Function: toggleHistoryTable
 
 This function opens or closes the complete history table (overview and detail elements).
 
 Parameters:
 
 elementId - either the table's id or a hyperlink within the table (e.g. collapse all / show all).
 strAction - either 'show', 'hide', 'toggle'
 
 Required language strings:
       
 lang.maximizeHistoryTable - caption string for link in case a link called this function
 lang.minifyHistoryTable - caption string for link in case a link called this function	
    
 Returns:
 
 nothing.
 */
 
 toggleHistoryTable = function (elementId, strAction) {
     // is the given elementId a table or only a link
     // in case it is a link toggle the links caption to minify or maximize table
     // and change "elementId" to the actual id of the table	
     if ($(elementId).prop("nodeName").toLowerCase() != 'table') {
         if ($(elementId).down('span').html() == lang.minifyHistoryTable) {
             $(elementId).down('span').html(lang.maximizeHistoryTable);
             setExpandOrCollapseIcon($(elementId).down('img'), true);
             strAction = 'hide';
         }
         else {
             $(elementId).down('span').html(lang.minifyHistoryTable);
             setExpandOrCollapseIcon($(elementId).down('img'), false);
             strAction = 'show';
         }
         elementId = $(elementId).up('table');
     }
     
     // collapse / open the content
     if (strAction == 'hide' || strAction == 'show') {
         $(elementId).find('.historieDetail').each(function (i, detailId) {
             toggleHistoryTableDetail(detailId, strAction);
         });
         $(elementId).find('.historieOverviewToggle').each(function (i, overviewId) {
             toggleHistoryTableOverview(overviewId, strAction, 0);
         });
 
         $(elementId).find('.historieDetailToggle').each(function (i, overviewId) {
             toggleHistoryTableDetail(overviewId, strAction);
         });
     }
 }
 
 /*
 Function: toggleHistoryTableOverview
 
 toggles an overview block
 
 Parameters:
 
 elementId - the link which triggers the toggling.
 strAction - either 'show', 'hide' or 'toggle'
   
 Returns:
 
 nothing.
 */
 
 toggleHistoryTableOverviewByHash = function (hash, strAction) {
     jQuery.each($('.reiterBlock'), function (i, blockId) {
         $(blockId).find('a.historieOverviewToggle').each(function (i, menuElement) {
             if ($(menuElement).attr("name") == hash.substring(1)) {
                 toggleHistoryTableOverview($(menuElement), strAction);
                 return true;
             }
         });
     });
     return false;
 }

 toggleHistoryTableOverview = function (elementId, strAction) {    
    toggleHistoryTableOverview (elementId, strAction,1);
 }
 
 toggleHistoryTableOverview = function (elementId, strAction, enableScrolling) {
     if (!strAction || (strAction != 'toggle' && strAction != 'show' && strAction != 'hide') || strAction == 'toggle') {
         strAction = 'toggle';
     }
 
     // schließen link
     if ($(elementId).up('tr').hasClass('close')) {
         elementId = $(elementId).up('tbody').down('.historieOverviewToggle');
     }
 
     // showInOverview berücksichtigen
     $(elementId).up('tr').nextAll().each(function (i, n) {
         if (strAction == 'hide') {
             if ($(n).is(":visible") && $(n).hasClass('historyShowAlways')) {
                 $(n).toggleClass('noBorder');
             }
             else {
                 $(n).hide();
             }
         }
 
         if (strAction == 'show') {
             $(n).show();
         }
 
         if (strAction == 'toggle') {
             if ($(n).is(":visible") && $(n).hasClass('historyShowAlways')) {
                 $(n).toggleClass('noBorder');
             } else if (!$(n).hasClass('table-history-mobile')) {
	             $(n).toggle();
	         } 
         }
     });
     
     if (strAction == 'toggle') {
         $(elementId).up('tbody').toggleClass('open');
         if ($(elementId).up('tbody').prevAll('tbody').length > 0) {
             $(elementId).up('tbody').prevAll('tbody').first().down('tr').toggleClass('noBorder');
         }
         toggleExpandOrCollapseIcon($(elementId).down('img'));
     }
 
     if (strAction == 'show') {
         $(elementId).up('tbody').addClass('open');
         if ($(elementId).up('tbody').prevAll('tbody').length > 0) {
            $(elementId).up('tbody').prevAll('tbody').first().down('tr').addClass('noBorder');
         }
         setExpandOrCollapseIcon($(elementId).down('img'), false);
         
         if (enableScrolling==1) {
            // scroll to the anchor
            $(elementId).scrollTo();
         }
     }
 
     if (strAction == 'hide') {
         $(elementId).up('tbody').removeClass('open');
         if ($(elementId).up('tbody').prevAll('tbody').length > 0) {
             $(elementId).up('tbody').prevAll('tbody').first().down('tr').removeClass('noBorder');
         }
         setExpandOrCollapseIcon($(elementId).down('img'), true);
     }
     
     // save open/close state
     var openCloseState = getOpenCloseState();
     if (openCloseState != null) {
         openCloseState['H' + $(elementId).attr("id")] = $(elementId).up('tbody').hasClass('open') ? "1" : "0";
         saveOpenCloseState(openCloseState);
      }
 
     if (($(elementId).up('tbody').nextAll('tbody').length > 0) && $(elementId).up('tbody').nextAll('tbody').first().hasClass('open')) {
         // if the following content block is opened no border is shown for this one
         $(elementId).up('tbody').down('tr').toggleClass('noBorder');
     }
     else {
         // the following content block is closed, so show the border for this one
         $(elementId).up('tbody').down('tr').removeClass('noBorder');
     }
 
     if (($(elementId).up('tbody').prevAll('tbody').length > 0) && (!$(elementId).up('tbody').prevAll('tbody').first().hasClass('open')) && (!$(elementId).up('tbody').hasClass('open'))) {
         // this element got closed and that above was closed in prior - so remove the above's border
         $(elementId).up('tbody').prevAll('tbody').first().down('tr').removeClass('noBorder');
     }
 }
 
 /*
 Function: toggleHistoryTableDetail
 
 toggles a detail block
 
 Parameters:
 
 elementId - the link which triggers the toggling.
 strAction - either 'show', 'hide' or 'toggle'
   
 Returns:
 
 nothing.
 */
 
 toggleHistoryTableDetail = function (elementId, strAction) {
     if ($(elementId).nextAll('table.historieDetail').length > 0) {
           if (strAction == "hide") {
            $(elementId).nextAll('table.historieDetail').first().find('tr').hide();
         }
         if (strAction == "show") {
            $(elementId).nextAll('table.historieDetail').first().find('tr').show();
         }
         if (strAction == "toggle") {
            $(elementId).nextAll('table.historieDetail').first().find('tr').toggle();
         }
     }
     else {
         // Wordmeldungen-Tabelle berücksichtigenf
    	 var nextSiblings = $(elementId).nextAll('.historieDetail');
         if (nextSiblings.length > 0) {
             nextSiblings.invoke(strAction);

             // - Fonda, Ulrich:             
             // We need a workaround here, because a toggle on mobile would resolve into nothing,             
             // if the element is already hidden via hidden-xs or hidden-sm            
             // so we're setting a class, and mirror it down to the toggleable element            
             // maybe in the future the whole accordion logic should be redone. with plain one-on-one toggle logic            

             if (strAction == 'hide') {
                 $(nextSiblings).addClass('is-closed');
             } else if ($(nextSiblings).hasClass('is-closed')) {
                 $(nextSiblings).removeClass('is-closed');
             } else {
                 $(nextSiblings).addClass('is-closed');
             }

             if ($(elementId).data('toggle')) {
                 if ($(nextSiblings).hasClass('is-closed')) {
                     $($(elementId).data('toggle')).hide();
                 } else {
                     $($(elementId).data('toggle')).show();
                 }
             }
         } 
     }
 
     if (strAction == 'toggle') {
         toggleExpandOrCollapseIcon($(elementId).down('img'));
     }
 
     if (strAction == 'show') {
         setExpandOrCollapseIcon($(elementId).down('img'), false);
     }
 
     if (strAction == 'hide') {
         setExpandOrCollapseIcon($(elementId).down('img'), true);
     }
 }
 
 toggleExpandOrCollapseIcon = function (image) {
     if (image != null && image.length > 0) {
         var arrIconFileName = image.attr("src").split('/');
         var strIconFileName = arrIconFileName[arrIconFileName.length - 1];
         if (strIconFileName == 'Weitere_anzeigen_rot.gif') {
             image.attr("src", '/img/icons/small/Weniger_anzeigen_rot.gif');
         }
         else if (strIconFileName == 'Weitere_anzeigen.gif') {
             image.attr("src", '/img/icons/small/Weniger_anzeigen.gif');
         }
         else if (strIconFileName == 'Weniger_anzeigen_rot.gif') {
             image.attr("src", '/img/icons/small/Weitere_anzeigen_rot.gif');
         }
         else if (strIconFileName == 'Weniger_anzeigen.gif') {
             image.attr("src", '/img/icons/small/Weitere_anzeigen.gif');
         }
     }
 }
 
 setExpandOrCollapseIcon = function (image, showExpandIcon) {
     if (image != null && image.length > 0) {
         var arrIconFileName = image.attr("src").split('/');
         var strIconFileName = arrIconFileName[arrIconFileName.length - 1];
         if (showExpandIcon && strIconFileName == 'Weniger_anzeigen_rot.gif') {
             image.attr("src", '/img/icons/small/Weitere_anzeigen_rot.gif');
         }
         else if (showExpandIcon && strIconFileName == 'Weniger_anzeigen.gif') {
             image.attr("src", '/img/icons/small/Weitere_anzeigen.gif');
         }
         else if (!showExpandIcon && strIconFileName == 'Weitere_anzeigen_rot.gif') {
             image.attr("src", '/img/icons/small/Weniger_anzeigen_rot.gif');
         }
         else if (!showExpandIcon && strIconFileName == 'Weitere_anzeigen.gif') {
             image.attr("src", '/img/icons/small/Weniger_anzeigen.gif');
         }
     }
 }
 
 /*
 Function: showPersonalContent
 
 loads content via ajax to a div with class name '.personalisierung'.
 
 Parameters:
 
 targetId - id of the target html element, or . 
 url - html content for the target element.
   
 Returns:
 
 nothing.
 */
 showPersonalContent = function (targetId, url) {
 
     if ($$(targetId).prop("nodeName").toLowerCase() != 'div') {
         targetId = $$(targetId).up('.personalisierung');
     }
     else {
       targetId = $$(targetId);
     }
 
     $(targetId).html(lang.pleaseWait);
 
     $.get(url,
            function(response) {
              $(targetId).html(response);
           makeSortable();
           hideMoreMessages(targetId);
         }
    );
 }
 
 /*
 Function: makeSortable
 
 Makes the content of a div with id 'sortable' sortable. 
 
 Parameters:
 
 none.
 
 Required language strings:
       
 lang.moveContent
 lang.removeContent
       
 Returns:
 
 nothing.
 */
 
 makeSortable = function () {
     if ($('#sortable').length > 0) {
         if ($('#sortable').prop("nodeName").toLowerCase() == 'div') {
             // Prepare "personalisierung"
             if ($('#sortable').down('.personalisierung')) {
                 $('#sortable').find('.personalisierung').each(function (i, container) {
                     if ($(container).down('a.handle').length == 0) {
                         strJsLinks = '<a href="javascript:void(0);" class="edit javascriptLink" onclick="closePersonalContent(this); return false;"><img alt="' + lang.removeContent + '" title="' + lang.removeContent + '" src="/img/icons/small/Personalisierung_loeschen.gif"></a> <span class="hidden">.</span>';
                         strJsLinks += '<a href="javascript:void(0);" class="edit handle javascriptLink"><img alt="' + lang.moveContent + '" title="' + lang.moveContent + '" src="/img/icons/small/Personalisierung_verschieben.gif"></a> <span class="hidden">.</span>';
                         $(container).prepend(strJsLinks);
                     }
                 });
                 registerToolTipsOnLoad();
             }
         }
         else {
             // Prepare "Lesezeichen bearbeiten"
 
             // Ajax for delete
             $('#sortable').find('.zeigeDelete').each(function (i, element) {
                 $(element).html('<a href="#" class="javascriptLink"><img alt="' + lang.removeBookmark + '" title="' + lang.removeBookmark + '" src="/img/icons/small/Personalisierung_loeschen_schwarz.gif" class="icon loeschen"></a>')
             });
             $('#sortable').find('.zeigeHandle').each(function (i, element) {
                 $(element).html('<a href="#" class="javascriptLink"><img alt="' + lang.moveBookmark + '" title="' + lang.moveBookmark + '" src="/img/icons/small/Personalisierung_verschieben_schwarz.gif" class="icon handle"></a>')
             });
         }
 
         $('#sortable').sortable();
         // to fix bad opera behaviour use: $(this).up('div').setStyle({'left':'0','top':'0'}); with onchange callback
 
         $('#sortable').find('.loeschen').each(function (i, element) {
             $(element).bind('click', function (event) {
                 $(event.target).up('.personalisierung').remove();
             });
         });
     }
 
     jQuery.each($('.javascriptLink'), function (i, element) {
         $(element).attr('href', 'javascript:void(0);');
     });
 }
 
 /*
 Function: toggleBox
 
 Displays or hides a box of the 'personalisierung'-Page. Performs an Ajax Request to receive the updated Element.
 Change the target link here.
 
 Parameters:
 
 [boxCode] - string. If this parameter is valid, the stated container will be removed. optional. 
 
 Required language strings:
       
 none.
       
 Returns:
 
 nothing.
 */
 
 toggleBox = function (boxCode) {
     var targetId = 'pers_' + boxCode;
     if ($('#'+targetId).length > 0) {
         closePersonalContent(targetId);
     }
     else {
         var contentDiv = '<div class="contentBlock headLink mehrNachrichten personalisierung" id="' + targetId + '"></div>';
         $('#sortable').prepend(contentDiv);
 
         if ($('#cb_' + targetId).nextAll('a').length == 0) {
             var contentLink = '<a href="#' + targetId + '" class="hidden">' + lang.jumpTo + ' ' + $('#cb_' + targetId).nextAll('label').first().html() + '</a>';
             $('#cb_' + targetId).nextAll('label').first().after(contentLink);
         }
         showPersonalContent(targetId, '/pakt.psp?portlet=pakt&editOne=on&boxCode=' + boxCode);
     }
 }
 
 /*
 Function: closePersonalContent
 
 Removes an element from the "personaliserung"-Page. Unchecks the related checkbox.
 
 Parameters:
 
 [targetId] - string. If this parameter is valid, the stated container will be removed. optional. 
 
 Required language strings:
       
 none.
       
 Returns:
 
 nothing.
 */
 
 closePersonalContent = function (targetId) {
     if ($$(targetId).hasClass('personalisierung')) {
         targetId = $$(targetId).attr("id");
     }
     else {
         targetId = $$(targetId).up('.personalisierung').attr("id");
     }
     $('#'+targetId).fadeOut();
 
     setTimeout("$('#" + targetId + "').remove();", 1000);
     $('#cb_' + targetId).prop('checked', false);
     if ($('#cb_' + targetId).nextAll('a').length > 0) {
         $('#cb_' + targetId).nextAll('a').first().remove();
     }
 }
 
 /*
 Function: registerDatePicker
 
 Registers the datepickers for input-elements which have the class name '.waehleDatum'.
 
 Parameters:
 
 none.
 
 Required language strings:
       
 none.
       
 Returns:
 
 nothing.
 */
 registerDatePicker = function () {
 
     var optionsDmwk = {      
       showOn: "button",
       firstDay: 1,
       yearRange: '-120:+0',
       dateFormat: 'dd.mm.yy',
       prevText: 'Früher',
       nextText: 'Später',
       changeYear: true,
       monthNamesShort: [ 'Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez' ],
       changeMonth: true,
       dayNamesMin: [ 'So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa' ],
       buttonImageOnly: true,
       buttonImage: '/img/icons/small/Terminkalender.gif',
       buttonText: 'Kalender öffnen'
     };
     
     var options = {
       showOn: 'both',
       firstDay: 1,
       dateFormat: 'ddmmyy',
       prevText: 'Früher',
       nextText: 'Später',
       changeYear: true,
       monthNamesShort: [ 'Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez' ],
       changeMonth: true,
       dayNamesMin: [ 'So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa' ],
       buttonImageOnly: true,
       buttonImage: '/img/icons/small/Terminkalender.gif',
       buttonText: 'Kalender öffnen'
     };
     
     var optionsShowOnButton = {
       showOn: 'button',
       firstDay: 1,
       dateFormat: 'ddmmyy',
       prevText: 'Früher',
       nextText: 'Später',
       changeYear: true,
       monthNamesShort: [ 'Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez' ],
       changeMonth: true,
       dayNamesMin: [ 'So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa' ],
       buttonImageOnly: true,
       buttonImage: '/img/icons/small/Terminkalender.gif',
       buttonText: 'Kalender öffnen'
     };
     
     var optionsDateTimepicker = {
         autoClose: true,
         timeText: 'Uhrzeit',
         firstDay: 1,
         numberOfMonths: 2,
         minDate: 0,
         dateFormat: 'dd.mm.yy',
         timeFormat: 'HH:MI',
         changeMonth: true,
         changeYear: true,
         timeInput: true,
         controlType: 'select',
         hourText: 'Stunde',
         minuteText: 'Minute',
         secondText: 'Sekunde',
         currentText: 'Jetzt',
         closeText: 'Übernehmen',
         timeFormat: 'HH:mm',
         monthNamesShort: [ 'Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez' ],
         dayNamesMin: ['So','Mo','Di','Mi','Do','Fr','Sa'],
         dayNames: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
         buttonImageOnly: true,
         buttonImage: '/img/icons/small/Terminkalender.gif',
         buttonText: 'Kalender öffnen',
         showOn: 'both'
     };
	 
	 var optionsDateTimepickerTour = {
		autoClose: true,
		timeText: 'Uhrzeit',
		firstDay: 1,
		numberOfMonths: 1,
		hourMin: 8,
		hourMax: 17,
		minDate: 1,
		stepMinute: 15,
		dateFormat: 'dd.mm.yy',
		timeFormat: 'HH:MI',
        changeMonth: true,
        changeYear: true,
		timeInput: true,
		controlType: 'select',
		hourText: 'Stunde',
		minuteText: 'Minute',
		secondText: 'Sekunde',
		currentText: 'Jetzt',
		closeText: 'Übernehmen',
		timeFormat: 'HH:mm',
		monthNamesShort: [ 'Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez' ],
		monthNames: [ 'Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember' ],
		dayNamesMin: ['So','Mo','Di','Mi','Do','Fr','Sa'],
		buttonImageOnly: true,
		buttonImage: '/img/icons/small/Terminkalender.gif',
		buttonText: 'Kalender öffnen',
		showOn: 'both'
    };
 
     $('input.waehleDatumDmwk').datepicker( optionsDmwk );
     $('input.waehleDatum').datepicker( options );
     $('input.waehleDatumShowOnButton').datepicker( optionsShowOnButton );
 
     try {
         /**
         * Auto-Close
         */
         $.datepicker._gotoToday = function(id) {
             // invoke selectDate to select the current date and close datepicker.
             $.datepicker._selectDate.apply(this, [id]);
             $('.ui-datepicker').hide();
         };
         
         $('input.datetimepicker').datetimepicker(optionsDateTimepicker);    
         $('input.datetimepickertour').datetimepicker(optionsDateTimepickerTour);    
     }
     catch(err) {
         // Handle error(s) here
         $('input.datetimepicker').datepicker(optionsDmwk);    
         $('input.datetimepickertour').datepicker(optionsDmwk);    
     }	
     
     // TODO:ps für sfe
     //'input.waehleDatumSfe'
 }
 
 /*
 Function: hideFilterButtonsOnLoad
 
 Hides Submit buttons with class name '.hideButton'
 
 Parameters:
 
 none.
 
 Required language strings:
       
 none.
       
 Returns:
 
 nothing.
 */
 hideFilterButtonsOnLoad = function () {
     //? $$('.hideButton').invoke('hide');
     $('.hideButton').hide();
 }
 
 /*
 Function: registerDiaShowOnLoad
 
 Registers the mini-slideshow in div elements with class name '.slideShowContainer' on each load.
 See start_internet.html for the required html-parameters.
     
 Parameters:
 
 none.
 
 Required language strings:
       
 lang.altNextImage
       
 Returns:
 
 nothing.
 */
 registerDiaShowOnLoad = function () {
     var strButtonDiv = '<div class="playButton"><a href="javascript:void(0);" onclick="nextSlide(this); return false;"><img src="/img/design/play.gif" alt="' + lang.altNextImage + '"></a></div>';
     jQuery.each($('div.slideShowContainer'), function (i, element) {
         $(element).append(strButtonDiv);
     });
 }
 
 /*
 Function: nextSlide
 
 Is a part of registerDiaShowOnLoad. Switches to the next image of the slideshow.
     
 Parameters:
 
 buttonId. The play-button-element.
 
 Required language strings:
       
 none.
       
 Returns:
 
 nothing.
 */
 nextSlide = function (buttonId) {
     var targetId = $(buttonId).up('div.slideShowContainer');
 
     var bolShowCurrentSlide = false;
 
     $(targetId).find('span.slide').each(function (i, imageId) {
         if (!$(imageId).hasClass('hidden')) {
             $(imageId).addClass('hidden');
             if ($(imageId).next().hasClass('slideCopyright')) {
                 $(imageId).nextAll('.slideCopyright').first().addClass('hidden');
             }
             bolShowCurrentSlide = true;
         }
         else {
             if (bolShowCurrentSlide) {
                 $(imageId).removeClass('hidden');
                 bolShowCurrentSlide = false;
                 if ($(imageId).next().hasClass('slideCopyright')) {
                     $(imageId).nextAll('.slideCopyright').first().removeClass('hidden');
                 }
             }
         }
     });
     if (bolShowCurrentSlide) {
         $(targetId).down('span.slide').removeClass('hidden');
         if ($(targetId).down('span.slide').next().hasClass('slideCopyright')) {
             $(targetId).down('span.slide').next().removeClass('hidden');
         }
     }
 }
 
 /*
 Function: registerAutoCompleteOnLoad
 
 Registers the auto-complete for search and filter
 
 Parameters:
 
 none.
 
 Required language strings:
 
 none.
 
 Returns:
 
 nothing.
 */
 registerAutoCompleteOnLoad = function () {
 
   var options = {
     source: function( request, response ) {
       query = request.term.replace(/%/g,"%25");
       $.get("/SUCH/autocomplete.shtml?q="+query,
         function (data) {
           var resp = data.replace(/,"",/g,",").replace(/,""/g,"");
           resp = resp.replace(/,"\/",/g,",").replace(/,"\/"/g,"");
           resp = resp.replace(/,"\/\/",/g,",").replace(/,"\/\/"/g,"")
           resp = resp.replace(/\n/g,"");
           resp = resp.replace(/\"]/g,"").replace(/\["/g,"");
           resp = resp.replace(/([^"]*)","/,"");
           var arr = resp.split('\",\"');
           response( arr );
           return;
         }
       );
     }
   };
 
   $( "input.autocomplete" ).autocomplete( options );
   
   var filterOptions = {
     source: function( request, response ) {
       var typId = $("#"+this.element.prop("id")+"_TYP_ID").val();
           var userInput = request.term;
           if(userInput.length == 0)
               return;
               
       $.ajax('/filterAutocomplete.psp', { data: { typId: typId, userInput: userInput, mode: 'json' } } ).then(
         function success (data) {
           response( data.data );
           return;
         }
       );
     }
   };
     
   jQuery.each($('.autoCompleteTextFeld'), function(i, element) {
     $(element).autocomplete(filterOptions);
   });
   
   $("input.autoCompleteTag").autocomplete({
         source: function (request, response) {
             $values=$("#"+this.element.prop("id")+"_suggestions");
             response($values.html().split(','));
         }
     }); 
   
 }
 
 /*
 Function: registerSlideShowOnLoad
 
 Registers the Slideshow in the lightbox on load or after an Ajaxrequest.	
     
 Parameters:
 
 none.
 
 Required language strings:
       
 none.
       
 Returns:
 
 nothing.
 */
 registerSlideShowOnLoad = function () {
     jQuery.each($('a.lbOn'), function (i, link) {
         if (link.href.indexOf("?") >= 0) {
             link.attr('href', link.href + '&lightbox=true');
         }
         else {
             link.attr('href', link.href + '?lightbox=true');
         }
     });
     jQuery.each($('.galerieContainer'), function (i, gallery) {
         registerSlideShow(gallery, false);
     });
 
 }
 
 /*
 Function: registerSlideShow
 
 Adds the event listeners for the slideshow links. And Starts the slideshow on click of the link.
     
 Parameters:
 
 gallery. the container element of the slideshow.
 
 Required language strings:
       
 none.
       
 Returns:
 
 nothing.
 */
 registerSlideShow = function (gallery, isLightbox) {
     // check if a gallery is present in lightbox
	 
	 /*
     if (isLightbox) {
         if (!$('lbContent').down('.galerieContainer')) {
             return false;
         }
         else {
             gallery = $(gallery).down('.galerieContainer');
         }
     }
	 */
 
     /*
     
     $(gallery).down('div.slideshowBildBeschreibung').hide();
 
     var slideshowBildContainer = $(gallery).down('div.slideshowBildContainer');
     slideshowBildContainer.bind('mouseover', function () {
 
         $(slideshowBildContainer).down('div.slideshowBildBeschreibung').show();
     });
     slideshowBildContainer.bind('mouseout', function () {
         $(slideshowBildContainer).down('div.slideshowBildBeschreibung').hide();
     });
 	 
 	 */
     
	 /*
     var objThumbnailSlide = new thumbnailSlide($(gallery).down('.slideshowThumbnailTopContainerFallBack'));
     objThumbnailSlide.create();
     var objSlideShow = new slideshow(gallery, objThumbnailSlide);
	*/
 }
 
 /*
 Function: registerHistoryLinksOnLoad
 
 Registers the deeplink functions in a gallery. Excepts a link to an anchor as link.
     
 Parameters:
 
 none.
 
 Required language strings:
       
 none.
       
 Returns:
 
 nothing.
 */
 
 registerHistoryLinksOnLoad = function () {
     jQuery.each($('.historyLink'), function (i, link) {
         link.bind('click', function () {
             var intContentBlockNumber = 0;
             var strTarget = $(link).href.substr($(link).href.indexOf('#') + 1);
 
             if ($(strTarget) != null) {
                 toggleHistoryTable($(strTarget).up('table.tabelleHistorie'), 'hide')
 
                 $(strTarget).up('div.reiterBlock').prevAll().each(function (i, element) {
                     if ($(element).hasClass('reiterBlock')) {
                         intContentBlockNumber++;
                     }
                 });
 
                 //Show the right tab + switch tab menu			
                 toggleTabMenu($(strTarget).up('div.reiterBlock').prevAll('.reiterNavigationContainer').first().down('li', intContentBlockNumber).down('a'));
 
                 toggleHistoryTableOverview(strTarget, 'show');
             }
         });
     });
 }
 
 /*
Function: registerSchlagwortButtonsOnLoad

Hides Eurovoc-div onload, hides/shows divs schlagwortBoxintern/eurovocBox based on radio button selection
	
Parameters:

none.

Required language strings:
	  
none.
	  
Returns:

nothing.
*/

registerSchlagwortButtonsOnLoad = function () {
    jQuery.each($('.schlagwortButton'), function (i, button) {
        var bswButton, bevButton;
        if (button.id.startsWith('bsw')) {
           bswButton = button;
           bevButton = $(button).nextAll('input').first();
        } else {
           bswButton = $(button).prevAll('input').first();
           bevButton = button;
        }
        var schlagwortBoxintern = $(button).nextAll('div#schlagwortBoxintern').first();
        var eurovocBox = $(button).nextAll('div#eurovocBox').first();
        
        if (bswButton.checked) {
					schlagwortBoxintern.show();
					eurovocBox.hide();
					}
		$(button).click(function () {
            if (button.id.startsWith('bsw')) {
              bswButton = button;
              bevButton = $(button).nextAll('input').first();
            } else {
              bswButton = $(button).prevAll('input').first();
              bevButton = button;
            }
            var schlagwortBoxintern = $(button).nextAll('div#schlagwortBoxintern').first();
            var eurovocBox = $(button).nextAll('div#eurovocBox').first();
    			if (bswButton.checked) {
					schlagwortBoxintern.show();
					eurovocBox.hide();
					}
			    if (bevButton.checked){
					eurovocBox.show();
					schlagwortBoxintern.hide();
					}
        });
        if (button.nextSibling != null)
        {
         $(button.nextSibling).bind('click', function (event) {
            if (event.target.previousSibling != null) {
               event.target.previousSibling.click();
            }
         });
      }
    });
}

 
 
 /*
 Function: openPopUp
 
 Opens a popup with a given url.
     
 Parameters:
 
 none.
 
 Required language strings:
       
 none.
       
 Returns:
 
 nothing.
 */
 openPopUp = function (url) {
     newWindow = window.open(url, 'Parlament', 'width=400,height=300,resizable=yes');
 }
 
 /*
 Function: updateFilter
 
 Updates a filter element in the descending div.formularZeile with an Ajax Request to a form generation script. 
     
 Parameters:
 
 none.
 
 Required language strings:
       
 none.
       
 Returns:
 
 nothing.
 */
 updateFilter = function (event) {
     var element = $(event.target);
     $(element).up('div.formularZeile').nextAll('div.formularZeile').first().html(lang.pleaseWaitForm);
     $.post('ajaxForm.php', $(element).serialize(), function (data) {
       $(element).up('div.formularZeile').nextAll('div.formularZeile').first().html(data)
     });
 }
 
 /*
 Function: registerFilterUpdates
 
 Registers the Event Listeners which trigger the updateFilter function.
     
 Parameters:
 
 formId. form container which holds the filter radio buttons.
 
 Required language strings:
       
 none.
       
 Returns:
 
 nothing.
 */
 registerFilterUpdates = function (formId) {
     if (formId) {
         $(formId).find('.aktualisiereFilter').each(function (i, element) {
             $(element).bind('click', function (event) { updateFilter(event) });
         });
 
     }
     else {
         jQuery.each($('.aktualisiereFilter'), function (i, element) {
             $(element).bind('click', function (event) { updateFilter(event) });
         });
     }
 }
 
 /*
 Function: registerAdvancedSearchOnLoad
 
 Registers the event listeners for "Erweiterte Suche". Handles automatic checkbox 
 selection / deselection if two filters are logical counterparts. e.g. show all / show only x
 The "show all" checkbox needs to have a descending fieldset with checkboxes. If one of those 
 checkboxes is selected show all is de-selected. Otherwise if show all is selected, the checkboxes 
 in the following fieldset are de-selected.	
     
 Parameters:
 
 none.
 
 Required language strings:
       
 none.
       
 Returns:
 
 nothing.
 */
 registerAdvancedSearchOnLoad = function () {
	 jQuery.each($('.zeigeAlles'), function (i, element) {
			$(element).unbind('click');
		         $(element).bind('click', function (event) {
		             var element = $(event.target);
		 
		             $(element).nextAll('fieldset').first().find('input').each(function (i, input) {
		                 if ($(input).attr('type').toLowerCase() == 'checkbox') {
		                     if ($(element).prop( "checked")) {
		                         $(input).prop( "checked", false );
		                         toggleAdvancedSearchSubSelect(input, false);
		                     }
		                 }
		             });
		         });
		         $(element).nextAll('fieldset').first().find('input').each(function (i, input) {
		             if ($(input).attr('type').toLowerCase() == 'checkbox') {
		                 $(input).bind('click', function (event) {
		                     if ($(input).prop( "checked")) {
					 $(element).prop( "checked",false)
		                         toggleAdvancedSearchSubSelect(input, true);
		                     }
		                     else {
		                         toggleAdvancedSearchSubSelect(input, false);
		                     }
		                 });
		             }
		         });
		         $(element).nextAll('fieldset').first().find('fieldset.subSelect').each(function (i, group) {
		             $(group).hide();
		         });
		     });
     }
 /*
 Function: toggleAdvancedSearchSubSelect
 
 Helper function for registerAdvancedSearchOnLoad. Toggles select fields with classname '.subSelect'
     
 Parameters:
 
 checkbox. the clicked checkbox
 bolEnabled. boolen. if true the subSelect is shown else hidden.
 
 Required language strings:
       
 none.
       
 Returns:
 
 nothing.
 */
 toggleAdvancedSearchSubSelect = function (checkbox, bolEnabled) {
     if ($(checkbox).up('div').next().length > 0) {
         if ($(checkbox).up('div').next().hasClass('subSelect')) {
             if (bolEnabled) {
                 $(checkbox).up('div').next().show();
             }
             else {
                 $(checkbox).up('div').next().hide();
             }
 
         }
     }
 }
 
 /*
 Function: registerScrollTeaserResizeOnLoad
 
 Registers the window.onchange event listener for scrollTeaserResize,
 when a div with id 'scrollteaser' has been found.
     
 Parameters:
 
 checkbox. the clicked checkbox
 bolEnabled. boolen. if true the subSelect is shown else hidden.
 
 Required language strings:
       
 none.
       
 Returns:
 
 nothing.
 */
 registerScrollTeaserResizeOnLoad = function () {
     if ($('scrollTeaser').length > 0) {
         scrollTeaserResize();
         window.onresize = scrollTeaserResize;
     }
 }
 
 /*
 Function: scrollTeaserResize
 
 Vertically scales a list to fit in the users viewport. If the viewport is too small a min and max-height is defined.
     
 Parameters:
 
 none.
 
 Required language strings:
       
 none.
       
 Returns:
 
 nothing.
 */
 
 scrollTeaserResize = function () {
     var element = 'scrollTeaser';
 
     var intMinLineCount = 7;
     var intMaxLineCount = 14;
     var intSetHeight = 0;
 
     var intUseAbleHeight = $(document).height() - $(element).offset().top;
     var intHeaderHeight = $(element).down('h3').height();// + $(element).down('form').down('div').getHeight();
     if ( $(element).down('form').length != 0) {
       intHeaderHeight += $(element).down('form').down('div').height();
     }
     var intUseAbleListHeight = intUseAbleHeight - intHeaderHeight;
 
     // Insert to dummy entries in the list to calculate the margin of each list item (because ie's getStyle('margin-top')
     // does deliver the stylesheets em-values instead of computed px-values
 
     $(element).down('ul').append('<li id="calcMargin" style="visibility:hidden">.</li><li id="calcHeight" style="visibility:hidden">.</li>');
     var intLiHeight = $('calcHeight').offset().top - $('calcMargin').offset().top;
 
     // delete the dummyentries 
 
     $('calcMargin').remove();
     $('calcHeight').remove();
 
     // Calculate new size of the list
 
     if ((intLiHeight * intMinLineCount) > intUseAbleListHeight) {
         // Mininum Size is 7 lines
         intSetHeight = intLiHeight * intMinLineCount;
     }
     else if ((intLiHeight * intMaxLineCount) < intUseAbleListHeight) {
         // Maximum Height is 14 lines
         intSetHeight = intLiHeight * intMaxLineCount;
     }
     else {
         // Use maxmimum useable space
         intSetHeight = intUseAbleListHeight;
     }
 
     // the 28px are margins which could not be computed
     $(element).down('ul').css('max-height', (intSetHeight - 28) + 'px');
 
     // Special IE6 treatment (which does not know maxHeight)
     if (typeof document.body.style.maxHeight == "undefined") {
         $(element).down('ul').css('height', (intSetHeight - 28) + 'px');
     }
 }
 
 hildeSelectListOnLoad = function () {
     jQuery("select.hildeSelectList").each(function (i, id) {
         $(id).hide();
     });
 
 };
 
 //--------------------------------------------------------------------------
 // Beginn Live Refresh Functions
 
 function setRefreshOff()    {
     vRefresh = "OFF";
 }
 
 function setRefreshOn()    {
     vRefresh = "ON";
    
 }
 
 function doubleDigit(n)
       {
 
          return (n < 10) ? '0' + String(n) : String(n);
 
       }
 
 function liveRefresh ()   {
     var myAnchor;
     var myDate = new Date;
     var localTime;
     var localHours = doubleDigit(myDate.getHours());
     var localMinutes = doubleDigit(myDate.getMinutes());
     var localSeconds = doubleDigit(myDate.getSeconds());
     var trace;
     
     localTime = localHours + localMinutes + localSeconds;
     
     if ( vRefresh == "ON" ) {
       
         switch(self.location.hash) {
      case "#tab-RednerinnenundRedner":
                 myAnchor = "#lfd_R";
                 break;
         case "#tab-AlleRednerInnen":
             myAnchor = "#alfd_R";
             break;
         case "#lfd_R":
         case "#alfd_R":
         case "#tab-AktuellerSitzungsstand":
         case "#tab-Übersichtlaufendeu.offeneDebatten":
         case "#tab-VorläufigesSten.Protokoll":
         case "#tab-AnträgeVerlangen":
             myAnchor = self.location.hash;
             break;
         default:myAnchor = '';
             break;
 
         }
      
          
      trace = getParameter("tr");
 
      if ( trace == "ON" ) {
          self.location.replace('?r=1&t=' + localTime +  '&tr=ON' + myAnchor);   
     }
      else	{
          self.location.replace(self.location.protocol + '//' + self.location.host + self.location.pathname + '?r=1&t=' + localTime +  myAnchor);   
     }
         
     }
 }
 
 function toggleRefresh()    {
     var myAnchor;
     if (vRefresh == "ON" )    {
         setRefreshOff();
 
         switch(self.location.hash) {
         case "#tab-RednerinnenundRedner":
         myAnchor = "#lfd_R";
                 break;
         case "#tab-AlleRednerInnen": 
             myAnchor = "#alfd_R";
             break;  
         case "#lfd_R":
         case "#alfd_R": 
         case "#tab-AktuellerSitzungsstand": 
         case "#tab-Übersichtlaufendeu.offeneDebatten": 
         case "#tab-VorläufigesSten.Protokoll": 
         case "#tab-AnträgeVerlangen": 
             myAnchor = self.location.hash;
             break;
         default:myAnchor = '';
             break;
         }
         
         self.location.replace(self.location.protocol + '//' + self.location.host + self.location.pathname + '?r=0'  + myAnchor); 
     }else    {
         setRefreshOn();
         liveRefresh ();
     }
 }
 
 
 function getParameter(p) {
 
     var re = new RegExp('&'+p+'=([^&]*)','i');
  
  var c = self.location.search; 
  return (c=c.replace(/^\?/,'&').match(re)) ?c=c[1] :c='NULL';
 };
 
 function setLiveRefreshTimeout()	{
 
 var r;
 var t;
 var refreshElement;
 var myDate = new Date;
 
 r = getParameter("r");
 t = getParameter("t");
 
 if ( r == '1' && t != 'NULL' ) {
         setRefreshOn();
     refreshElement = document.getElementById("refresh");
 
     if ( refreshElement != null)	{
             refreshElement.value="Aktualisierung ausschalten";
     }
         
         timeoutID = window.setTimeout(liveRefresh,60000); 
     timeTimeoutSet = myDate.getTime();
 }else    {
           setRefreshOff();
     refreshElement = document.getElementById("refresh");
 
     if ( refreshElement != null)	{
         refreshElement.value="Aktualisierung einschalten";
     }
 }
 }
 
 function xLog()	{
 }
 
 function checkTimeout()	{
 var myDate = new Date();
 var time = myDate.getTime();
 var timeDiff;
 var trace;
 
 
 if ( timeTimeoutSet != null ) {
     timeDiff = (time-timeTimeoutSet)/1000;
 
         trace = getParameter("tr");
 
 /*
         if ( trace == "ON" ) {
         xLog(timeDiff);
         }
 */
         
     if ( timeDiff > 60 ) {
         if ( timeoutID != null ) {
             clearTimeout(timeoutID);
         }
         timeTimeoutSet = null;
         timeoutID = null;
 
 /*
         if ( trace == "ON" ) {
         xLog("checkTimeout calls setLiveRefreshTimeout");
         }
 */
         
         setLiveRefreshTimeout();
     }
 }
 }
 
 function updateResTooltip(toolTipId) {
    $.get(window.location.protocol + "//" + window.location.host + '/pls/pdmeu/restreint.info',
            function(response) {
           $('#' + toolTipId).html('<div><div><img src="/img/design/tooltipEck.gif" width="5" height="5" alt="">' + response + '</div></div>');
         }
    );
 }

String.prototype.includes = function (str) {
  var returnValue = false;

  if (this.indexOf(str) !== -1) {
    returnValue = true;
  }

  return returnValue;
} 
 
 // Ende Live Refresh Functions
 //--------------------------------------------------------------------------
 
 // Tooltip index is used to generate unique tooltip ids
 var intToolTipIndex = 0;
 
 // Live Refresh Variablen Beginn
 var vRefresh = "OFF";
 var timeoutID = null;
 var timeTimeoutSet = null;
 var tabUpdater = null;
 var stateContentBlocks = '';
 // Live Refresh Variablen Ende
 
 var tabMenuContent = Array();
 var tabMenuTitle = Array();
 

function LoadEnhancements() {    
    registerBookmarksOnLoad();
    hideHiddenContentAndShowToggleTeaser();
    registerDatePicker();
    registerAutoCompleteOnLoad();
    registerDiaShowOnLoad();
    registerSlideShowOnLoad();
    registerHistoryLinksOnLoad();
    registerSchlagwortButtonsOnLoad();
    registerFilterUpdates();
    registerAdvancedSearchOnLoad();
    registerScrollTeaserResizeOnLoad();
    registerPrintpreviewOnLoad();
    registerToolTipsOnLoad();

}

 hideFilterButtonsOnLoad();
 function InitializePage () {
    // add mobile stylesheet
    if (!location.href.includes("/MEDIA/") && navigator.userAgent == 'MobileApp') {
       addStylesheet('/css/mobile_app.css');
       addStylesheet('/css/responsive_compatibility.css');
       removeStylesheet('/css/responsive.css');
    }
 
    ts_screen = getParameter("ts_screen");
    if (ts_screen!=undefined) {
        origTime=new Date(ts_screen*1);
        $( ".so_datumzeit" ).each(function( index ) {
            eingDatum=Date.parse($(this).attr('value'));
            if (origTime<eingDatum) {
                $(this).up('tr').attr('class','newAviso');
                $(this).up('.contentBlockContent').prev('h3').attr('style','font-weight:bold;');
            }
        });
    }

 /* Ajax Refresh, wenn dieser aktiviert wird, bitte setLiveRefreshTimeout(); ausdokumentieren
     checkLiveRefresh();
 */
 
 // timeout Refresh - Beginn
     setLiveRefreshTimeout();
 // timeout Refresh - Ende
	
	// TODO: SHOULD NOT BE NECESSARY after r_html creates new Links correctly
	 //registerLinkFix();	 
	// END TODO
    
    hildeSelectListOnLoad();
    hideMoreMessagesOnLoad();
    hideContentBlocksOnLoad();
    hideSitemapBlocksOnLoad();
    initHistoryTableOnLoad();
    hideTabMenuTabsOnLoad();

    // TODO: nur temporär!
    vodTabTasks();
    
    makeSortable();

    LoadEnhancements();

    restoreOpenCloseState();
 
     if (typeof(lightbox) != "undefined") {
         // Initialize Lightbox
         //initialize();
         //getBrowserInfo();
			 			
		bildNr=0;
		$('.javascriptLink').each(function () {			
			$(this).attr('href','#');
			$(this).attr('onclick','changeBild('+bildNr+')');
			bildNr++;
		});
	
		//first img default active
		$( ".slideshowThumbnailTopContainerFallBack").find('img').eq(0).addClass('aktuellesBild');
		
		var backurl=S_GET('backurl');
		
		  if (backurl && !backurl.startsWith('//') && !backurl.includes('javascript')){
			  if (backurl.startsWith('https://web.archive.org/web/20221208210645/https://iwww.parlament.gv.at')||
			  backurl.startsWith('https://web.archive.org/web/20221208210645/https://www.parlament.gv.at')||
                          backurl.startsWith('https://web.archive.org/web/20221208210645/http://iwww.parlament.gv.at')||
                          backurl.startsWith('https://web.archive.org/web/20221208210645/http://www.parlament.gv.at')||
			  backurl.startsWith('https://web.archive.org/web/20221208210645/https://iwww.entw.parlament.gv.at')||
			  backurl.startsWith('https://web.archive.org/web/20221208210645/https://www.entw.parlament.gv.at') ||
			  backurl.startsWith('/') ) {
				if ($('.galerieContainer').length>0) {
                    $('.galerieContainer').prepend('<div class="clearFix" />');
					$('.galerieContainer').prepend('<div class="floatRight"><a href='+backurl+'  id="closeLightbox" class="lbAction" rel="deactivate">'+lang.closeLightbox+'</a></div>');
					$('.galerieContainer').children(':first').hide();
					$('.galerieContainer').children(':first').fadeIn(200);
				} else {
                    $('#lbContent').prepend('<div class="clearFix" />');
					$('#lbContent').prepend('<div class="floatRight" style="padding-bottom:1em;"><a href='+backurl+'  id="closeLightbox" class="lbAction" rel="deactivate">'+lang.closeLightbox+'</a></div>');
					$('#lbContent').children(':first').hide();
					$('#lbContent').children(':first').fadeIn(200);
				}
			  }
			}	
			setBildNavigationLinks();
       }

	
        if (typeof addButtonFunctions === "function") {
                addButtonFunctions();
        }
            
     // sicherstellen, dass der angegebenen hash sichtbar ist 
     if (location.hash != "" && location.hash.startsWith('#')) {
        //$(location.hash).scrollTo();
        scrollToName(location.hash);
     }
	 
	var viewport = getCookie('viewport');
	if (viewport != null && viewport=="desktop") {
		$('.mobileLink').toggle();
	}
	
	var isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);
	if (!isMobile) {
		$('.desktopLink').hide();
	}
    checkTimeout();
 }
 
 function lazyLoad() {
  	$.each($(".lazyload"), function() {
      console.log('trying to load again???');
      if (!lazyloaded) {
  		  $(this).load($(this).attr("url"));
      }
  	});
    lazyloaded=true;
 }
 
 function registerLinkFix() {
	 $('td a img.icon[src="/img/icons/small/Link.gif"]').hide();
	 $('td a:has(img.icon[src="/img/icons/small/Link.gif"])').addClass('link-indicator');
 }
 
 function setBildNavigationLinks()  {
 	currentBildNr=parseInt($('.bildNummer').text());
 	bilderCount=parseInt($('.slideshowThumbnailTopContainerFallBack img').length);

	$('.bildWeiter').attr('href','#');
	$('.bildWeiter').up('.submitButton').attr('onclick','changeBild('+(currentBildNr)%bilderCount+')');
	$('.bildZurueck').attr('href','#');
	$('.bildZurueck').up('.submitButton').attr('onclick','changeBild('+(currentBildNr-2+bilderCount)%bilderCount+')');

}
 
 function changeBild(id) {
	bildContainer=$('.slideshowBildContainer');	 	
	fallbackContainer=$( ".slideshowThumbnailTopContainerFallBack");
	slideThumb=$(fallbackContainer).find(".vorschauLink:eq("+id+")");
    slideContainer=$(fallbackContainer).find(".slideshowBeschreibung:eq("+id+")");
    bildTitel=$(fallbackContainer).find(".slideshowBildTitel:eq("+id+")").html();

	bildContainer.find('img').attr('src',slideContainer.find('.slideshowBild').attr('href'));	
	bildContainer.find('img').attr('alt',slideThumb.find('img').attr('alt'));	
	bildContainer.find('.slideshowBildBeschreibungText').html(slideContainer.find('.slideshowBeschreibungLang').html());
    bildContainer.find('.slideshowBildID_text').html(slideContainer.find('.slideshowBildID_text').html());
	bildContainer.find('.slideshowBildAufnahmedatum').html(slideContainer.find('.slideshowBildAufnahmedatum').html());
	bildContainer.find('.slideshowBildBeschreibungCopyright').html(slideContainer.find('.slideshowCopyright').html());
	bildContainer.find('.lightboxPANORAMACopyright').attr('title',slideContainer.find('.slideshowCopyright').html());
	bildContainer.find('.lightboxCopyright').attr('title',slideContainer.find('.slideshowCopyright').html());
    
    // Only if Personen-Lightbox
    if (bildTitel!=undefined) {
        bildContainer.find('h3').html(bildTitel);
    } else {
        //alte Variante
        bildContainer.find('h3').html(slideThumb.find('img').attr('alt'));
    }
    
    newHref=slideContainer.find('.slideshowDownloadLink').attr('href');
    $('.slideshowCurrentDownloadLink').html(slideContainer.find('.slideshowDownloadLink').html());
    $('.slideshowCurrentDownloadLink').attr('href',newHref);

	fallbackContainer.find('img').removeClass('aktuellesBild');
	fallbackContainer.find('img').eq(id).addClass('aktuellesBild');	
	$('.bildNummer').text(id+1);	
	setBildNavigationLinks();	  
}


function vodTabTasks(){
  if (!init) {


    if (window.location.pathname.indexOf('/POD/')<0&&window.location.pathname.indexOf('/SONST/')<0&&window.location.pathname.indexOf('/INTERN/')<0) {
      return;
    }
    init=true;
    $('.contentBlock.h_1').prepend('<div class="vod-back-link contentBlock"><a href="/MEDIA/">zurück zur Mediathek</a></div>')
    bloecke=$('#vod .contentBlock');
    videoTab=$('.videoContainer').parent();
    //ALLE außer der erste (=Player), der Überschrift bzw. des Backlinks sind AUTOMATISCH Tabs
    tabs=$('#vod .contentBlock').not('.h_1').not('.vod-back-link').not(videoTab);
    tabs.wrapAll('<div class="info-tabs contentBlock tabs-responsive__contentBlock"></div>');
    tabs=$('.info-tabs .contentBlock');

    instr='<div class="reiterNavigationContainer"><ul class="tabs-responsive__menu reiterNavigation">';
    tabs.each(function( index ) {
      tabId='tab-'+index;

      h2=$(this).find('h2');
      h2.addClass('reiterHeadline');
      h2.attr('id',tabId);

      instr+='<li><a href="#'+tabId+'" onclick="toggleTabMenu(this); return false;">'+h2.text()+'</a></li>';
      tabs.addClass('reiterBlock');
      tabs.removeClass('contentBlock');
    });  
    instr+='</ul></div>';

    //$('.videoContainer').parent().wrapAll('<div class="player-container"></div>');

    downloadLink=$('.videoContainer a').attr('href');
    $('.videoContainer p').hide();
    $('.videoContainer').append('<div class="video-controls"><a class="btn-secondary btn-share" onclick="sharePd();">Teilen</a><a class="btn-secondary btn-download" download href="'+downloadLink+'">Download</a></div>');

    $('.info-tabs').prepend(instr);

    //tabs.wrap('<div class="tab"></div>');


    //$('.reiterNavigationContainer').tabs();

  }

}

function hideAllModal() {
    $('.popupOverlay').hide();
    $('.videoShareContent').hide();
    $('.downloadContent').hide();
    $('.cookieContent').hide();
}

 function sharePd() {
  $('#shareUrl').val(location.href.replace('iwww.','www.').replace('entw.',''));$('.popupOverlay').show();$('.videoShareContent').show();
 }

 function S_GET(id){
    var a = new RegExp(id+"=([^&#=]*)");
	if (a.exec(window.location.search) && a.exec(window.location.search).length>0) {
		return decodeURIComponent(a.exec(window.location.search)[1]);
    }
	return undefined;	
}
 
 function scrollto(element){
   $('html, body').animate({ scrollTop: ($(element).offset().top)}, 'slow');
 };
 
 function FocusTableElement() {
     $('div.ui-datatable-tablewrapper input').first().focus();
     $('div.ui-datatable-tablewrapper input').first().addClass('TEST');
 }
 
 function addStylesheet(cssFile) {
    $('head').append('<link rel="stylesheet" type="text/css" href="'+cssFile+'">');
 }
 
 function removeStylesheet(cssFile) {
	 $('link[rel=stylesheet][href*="'+cssFile+'"]').remove();	 
 }
 
 function SortableIdsAsList() {
     //lz[]=12323&lz[]=23424234
     var result = '';
     var ids = $('#sortable').sortable('serialize').split('&');
     for (var i = 0 ; i < ids.length ; i++) {
         var id = ids[i].split("=");
         if (id[1] != undefined) {
             if (result != '') {
                   result += ',';
             }
             result = result + id[1];
              }
      }
     return result;
 }
 
 function LzRearrange() {
     $('#js').val('on');
     $('#sequence').val (SortableIdsAsList());
 }
 
 function WzRearrange() {
     location.href = '/wz.psp?portlet=wz&saveRearrange=on&' + $('#sortable').sortable('serialize').replace(/werkzeug/g, 'sortable');
 }
 
 function addBookmark() {
	 location.href = '/addBookmark.psp?xdocumentUri=' + encodeURIComponent(location.pathname + location.search) + '&hash=' + location.hash.substring(1);
 }

 function addFilterlink() {
    var pageTitle=$('title').text();
    var fields=$('.filterFields');
    if (fields.length>0) {
        var form = fields.children('form')[1];
        var params = $(form).serialize();        
	    var url = encodeURIComponent(location.pathname + '?' + params);
    } else {
	    var url = encodeURIComponent(location.pathname + location.search + location.hash);
    }
    
	window.open('/FAPI/EDIT/index.shtml?configId=361&ID=0&BESCHR='+pageTitle+'&KBEZ='+pageTitle+'&PFAD=' + url,'_blank');
 }
 
 // Load default functions on ready
 $( document ).ready(function() {
  // Only execute lazy loading once! - InitializePage can be called multiple times
//   lang = langDE;
  lazyLoad();
  $(InitializePage);
 });

  function resizeIframe(obj) {
    resizeIframe2(obj,"html");
  }

  function resizeIframe2(obj,bodyClass) {
  	//TODO: javaScript
	setTimeout(function(){
	    $(obj).animate({height:$(obj).contents().find(bodyClass).height()},100);
	}, 2000);
  }


}
/*
     FILE ARCHIVED ON 21:06:45 Dec 08, 2022 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 19:36:26 Jan 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  exclusion.robots: 0.12
  exclusion.robots.policy: 0.106
  cdx.remote: 0.144
  esindex: 0.013
  LoadShardBlock: 209.812 (6)
  PetaboxLoader3.datanode: 211.261 (7)
  load_resource: 169.126
  PetaboxLoader3.resolve: 51.16
*/