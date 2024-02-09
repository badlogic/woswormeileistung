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


function updateDisabledStatuses(multiObject) {
    var selects = new Array();
    var i, j;
    for (i = 0; i <= multiObject.extraFields; ++i) {
        selects[i] = byId(multiObject.multiFields[0].prefix + i);
        for (j = 0; j < selects[i].options.length; ++j) {
            selects[i].options[j].disabled = false;
        }
    }
    for (i = 0; i < selects.length; ++i) {
        disableOptions(selects, i);
    }
}

function changeView(anchor, popupId, url) {
    var changeViewPane = byId(popupId);
    if (anchor && changeViewPane && toggleViewList(anchor, changeViewPane)) {
        if (!changeViewPane.loader) {
            changeViewPane.loader = new BackgroundLoader();
            changeViewPane.loader.setLoadedCallback(function(content) {viewsLoaded(changeViewPane, content);});
            changeViewPane.loader.setErrorCallback(function(error) {alert(error);});
            changeViewPane.loader.loadUrl(url);
        }
    }
}

function toggleViewList(anchor, changeViewPane) {
    if (changeViewPane.style.visibility == "visible") {
        changeViewPane.style.visibility = "hidden";
        return false;
    } else {
        var anchorX = findPosX(anchor);
        var anchorY = findPosY(anchor);
        var anchorHeight = anchor.offsetHeight;
        var anchorWidth = anchor.offsetWidth;
        var paneWidth = changeViewPane.offsetWidth;
//        changeViewPane.style.right = "10px";
        changeViewPane.style.right = "140px";
//        changeViewPane.style.top = (anchorY + anchorHeight + 5) + "px";
        changeViewPane.style.top = (anchorHeight + 20) + "px";
//        alert(changeViewPane.style.top + " | " + anchorY + " | " + anchorHeight);
        changeViewPane.style.visibility = "visible";
        return true;
    }
}

function viewsLoaded(changeViewPane, content) {
    changeViewPane.innerHTML = content;
}

function switchToView(view) {
    var viewElement = byId("search_form_view");
    if (typeof submitSearch == "function" && viewElement) {
        var hitsPerPage = byId("hitsPerPage");
        if (hitsPerPage) {
            hitsPerPage.disabled = true;
        }
        viewElement.value = view;
        submitSearch();
    }
}

function findPosX(obj) {
    var curleft = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent) {
            curleft += obj.offsetLeft;
            obj = obj.offsetParent;
        }
    } else if (obj.x)
        curleft += obj.x;
    return curleft;
};

function findPosY(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent) {
            curtop += obj.offsetTop
            obj = obj.offsetParent;
        }
    } else if (obj.y) {
        curtop += obj.y;
    }
    return curtop;
};

function disableOptions(selects, fromIndex) {
    assureLegalValue(selects[fromIndex]);
    var blockValue = selects[fromIndex].options[selects[fromIndex].selectedIndex].innerHTML;
    var option, optionValue;
    var i, j;
    for (i = 0; i < selects.length; ++i) {
        if (i != fromIndex) {
            for (j = 0; j < selects[i].options.length; ++j) {
                option = selects[i].options[j];
                optionValue = option.innerHTML;
                if (blockValue.indexOf("rank profile") >= 0 &&
                    optionValue.indexOf("rank profile") >= 0 ||
                    optionValue == blockValue) {
                    option.disabled = true;
                }
            }
        }
    }
}

function assureLegalValue(select) {
    if (select.options[select.selectedIndex].disabled) {
        for (var i = 0; i < select.options.length; ++i) {
            if (!select.options[i].disabled) {
                select.selectedIndex = i;
                return;
            }
        }
    }
}

function doOnEnter(event, action) {
    if (event && event.keyCode && event.keyCode == 13 && typeof action == "function") {
        action();
    }
}

function submitSearch() {
    var searchForm = byId("search_form");

    // ticket 17295
    var breadCrumbs = byId('search_form_breadcrumbs');
    var docVector = byId('search_form_similar_to');
    var breadCrumbsString = "";
    if (breadCrumbs) breadCrumbsString = String(breadCrumbs.value);
    var docVectorString = "";
    if (docVector) docVectorString = String(docVector.value);
    var sum = breadCrumbsString.length + docVectorString.length;

    // revert to post if breadcrumbs and docvector grows to large (prevent path url to get over IE max limit on approx 2380)

    var browser=navigator.appName;
    browserString = String(browser);
    
    // revert only for IE
    //if(sum > 1700 && browserString=="Microsoft Internet Explorer") searchForm.method='post';
    if(sum > 1700)// && browserString=="Microsoft Internet Explorer")
    {
    	var bug_error = byId('bug_error');
    	if (bug_error) bug_error.remove();
    	$('pagination_top').insert('<div id="bug_error" class="messages"><div><img width="13" height="13" border="0" class="message" alt="" src="/img/sfe/icn_alert.gif"/> Es wurden zu viele Navigatoren ausgewählt. </div></div>');
    	return false;
    }
    
    // remove the empty fields, used for javascript
    var search_form_old_similar_to = byId("search_form_old_similar_to");
    if (search_form_old_similar_to) search_form_old_similar_to.parentNode.removeChild(search_form_old_similar_to);
    var search_form_old_breadcrumbs = byId("search_form_old_breadcrumbs");
    if (search_form_old_breadcrumbs) search_form_old_breadcrumbs.parentNode.removeChild(search_form_old_breadcrumbs);
    var search_form_old_similar_type = byId("search_form_old_similar_type");
    if (search_form_old_similar_type) search_form_old_similar_type.parentNode.removeChild(search_form_old_similar_type);
    var previous_sort_by = byId("previous_sort_by");
    if (previous_sort_by) previous_sort_by.parentNode.removeChild(previous_sort_by);
    var previous_sort_order = byId("previous_sort_order");
    if (previous_sort_order) previous_sort_order.parentNode.removeChild(previous_sort_order);

    if (searchForm) {
        searchForm.submit();
    }
}

function submitSearchAdvanced() {
    var searchForm = byId("search_form_advanced_1");

    // ticket 17295
    var breadCrumbs = byId('search_form_breadcrumbs');
    var docVector = byId('search_form_similar_to');
    var breadCrumbsString = "";
    if (breadCrumbs) breadCrumbsString = String(breadCrumbs.value);
    var docVectorString = "";
    if (docVector) docVectorString = String(docVector.value);
    var sum = breadCrumbsString.length + docVectorString.length;

    // revert to post if breadcrumbs and docvector grows to large (prevent path url to get over IE max limit on approx 2380)

    var browser=navigator.appName;
    browserString = String(browser);

    // revert only for IE
    if(sum > 1700 && browserString=="Microsoft Internet Explorer") searchForm.method='post';

    // remove the empty fields, used for javascript
    var search_form_old_similar_to = byId("search_form_old_similar_to");
    if (search_form_old_similar_to) search_form_old_similar_to.parentNode.removeChild(search_form_old_similar_to);
    var search_form_old_breadcrumbs = byId("search_form_old_breadcrumbs");
    if (search_form_old_breadcrumbs) search_form_old_breadcrumbs.parentNode.removeChild(search_form_old_breadcrumbs);
    var search_form_old_similar_type = byId("search_form_old_similar_type");
    if (search_form_old_similar_type) search_form_old_similar_type.parentNode.removeChild(search_form_old_similar_type);
    var previous_sort_by = byId("previous_sort_by");
    if (previous_sort_by) previous_sort_by.parentNode.removeChild(previous_sort_by);
    var previous_sort_order = byId("previous_sort_order");
    if (previous_sort_order) previous_sort_order.parentNode.removeChild(previous_sort_order);

    if (searchForm) {
        searchForm.submit();
    }
}

function submitSearchExpert() {
    var searchForm = byId("search_expert_form");

    // ticket 17295
    var breadCrumbs = byId('search_form_breadcrumbs');
    var docVector = byId('search_form_similar_to');
    var breadCrumbsString = "";
    if (breadCrumbs) breadCrumbsString = String(breadCrumbs.value);
    var docVectorString = "";
    if (docVector) docVectorString = String(docVector.value);
    var sum = breadCrumbsString.length + docVectorString.length;

    // revert to post if breadcrumbs and docvector grows to large (prevent path url to get over IE max limit on approx 2380)

    var browser=navigator.appName;
    browserString = String(browser);
    
    // revert only for IE
    //if(sum > 1700 && browserString=="Microsoft Internet Explorer") searchForm.method='post';
    if(sum > 1700)// && browserString=="Microsoft Internet Explorer")
    {
    	var bug_error = byId('bug_error');
    	if (bug_error) bug_error.remove();
    	$('pagination_top').insert('<div id="bug_error" class="messages"><div><img width="13" height="13" border="0" class="message" alt="" src="/img/sfe/icn_alert.gif"/> Es wurden zu viele Navigatoren ausgewählt. </div></div>');
    	return false;
    }
    
    // remove the empty fields, used for javascript
    var search_form_old_similar_to = byId("search_form_old_similar_to");
    if (search_form_old_similar_to) search_form_old_similar_to.parentNode.removeChild(search_form_old_similar_to);
    var search_form_old_breadcrumbs = byId("search_form_old_breadcrumbs");
    if (search_form_old_breadcrumbs) search_form_old_breadcrumbs.parentNode.removeChild(search_form_old_breadcrumbs);
    var search_form_old_similar_type = byId("search_form_old_similar_type");
    if (search_form_old_similar_type) search_form_old_similar_type.parentNode.removeChild(search_form_old_similar_type);
    var previous_sort_by = byId("previous_sort_by");
    if (previous_sort_by) previous_sort_by.parentNode.removeChild(previous_sort_by);
    var previous_sort_order = byId("previous_sort_order");
    if (previous_sort_order) previous_sort_order.parentNode.removeChild(previous_sort_order);

    if (searchForm) {
        searchForm.submit();
    }
}

/*
function byId(id) {
    return $(id);
}
*/

function submitSearchSmall() {
    var searchForm = byId("search_form_small");

    // ticket 17295
    var breadCrumbs = byId('search_form_breadcrumbs');
    var docVector = byId('search_form_similar_to');
    var breadCrumbsString = "";
    if (breadCrumbs) breadCrumbsString = String(breadCrumbs.value);
    var docVectorString = "";
    if (docVector) docVectorString = String(docVector.value);
    var sum = breadCrumbsString.length + docVectorString.length;

    // revert to post if breadcrumbs and docvector grows to large (prevent path url to get over IE max limit on approx 2380)

    var browser=navigator.appName;
    browserString = String(browser);

    // revert only for IE
    if(sum > 1700 && browserString=="Microsoft Internet Explorer") searchForm.method='post';

    // remove the empty fields, used for javascript
    var search_form_old_similar_to = byId("search_form_old_similar_to");
    if (search_form_old_similar_to) search_form_old_similar_to.parentNode.removeChild(search_form_old_similar_to);
    var search_form_old_breadcrumbs = byId("search_form_old_breadcrumbs");
    if (search_form_old_breadcrumbs) search_form_old_breadcrumbs.parentNode.removeChild(search_form_old_breadcrumbs);
    var search_form_old_similar_type = byId("search_form_old_similar_type");
    if (search_form_old_similar_type) search_form_old_similar_type.parentNode.removeChild(search_form_old_similar_type);
    var previous_sort_by = byId("previous_sort_by");
    if (previous_sort_by) previous_sort_by.parentNode.removeChild(previous_sort_by);
    var previous_sort_order = byId("previous_sort_order");
    if (previous_sort_order) previous_sort_order.parentNode.removeChild(previous_sort_order);

    if (searchForm) {
        searchForm.submit();
    }
}

function doNewSearch(query) {
    var queryElement = byId("search_form_query");
    if (typeof submitSearch == "function" && queryElement) {
        queryElement.value = query;
        submitSearch();
    }
}

function spellCorrection(original, corrected) {
    if (typeof submitSearch == "function") {
        var modeItem = byId("search_form_mode");
        if (modeItem && modeItem.value == "scoped") {
            scopedSpellCorrection(original, corrected);
        } else if (modeItem && modeItem.value == "multiField") {
            multiFieldSpellCorrection(original, corrected);
        } else {
            var queryElement = byId("search_form_query");
            if (queryElement) {
                queryElement.value = corrected;
                submitSearch();
            }
        }
    }
}

function multiFieldSpellCorrection(original, corrected) {
    if (typeof submitSearch == "function") {
        var changed = false;
        for (var i = 0; i <= multiSearch.extraFields; ++i) {
            var element = byId("additional_multi_search_value_" + i);
            if (element.value == original) {
                element.value = corrected;
                changed = true;
            }
        }
        if (changed) {
            submitSearch();
        }
    }
}

function setFocus() {
    var searchBox = byId("search_form_query");
    if (searchBox && !searchBox.disabled) {
        searchBox.focus();
    }
}

function doSortBy(field) {
    var sortByElement = byId("sort_by");
    var sortOrderElement = byId("sort_order");
    var oldSortByElement = byId("previous_sort_by");
    var oldSortOrderElement = byId("previous_sort_order");
    var simpleSortByElement = byId("sort_by_simple");
    var simpleSortOrderElement = byId("sort_order_simple");
    if (sortByElement && sortOrderElement && oldSortByElement && oldSortOrderElement) {
        for (var i = 0; i < sortByElement.length; ++i) {
            if (sortByElement.options[i].value == field) {
                sortByElement.selectedIndex = i;
            }
        }
        if (oldSortByElement.value == field) {
            sortOrderElement.selectedIndex = (oldSortOrderElement.value == "ascending") ? 1 : 0;
        }
        submitSearch();
    } else if (simpleSortByElement && simpleSortOrderElement && oldSortByElement && oldSortOrderElement) {
        simpleSortByElement.value = field;
        if (oldSortByElement.value == field) {
            simpleSortOrderElement.value = (oldSortOrderElement.value == "ascending") ? "descending" : "ascending";
        }
        submitSearch();
    }
}

/* edit by ps */
function toggleSearchSettingsSimple()
{
    var elements = allById(new Array("search_settings_simple"));
    if (elements)
    {
        var selected = elements[0].style.display == "none";
        elements[0].style.display = selected ? "" : "none";
    }
}

/* add by ps */
function toggleSearchSettingsAdvanced()
{
    var elements = allById(new Array("search_settings_advanced"));
    if (elements)
    {
        var selected = elements[0].style.display == "none";
        elements[0].style.display = selected ? "" : "none";
    }
}

/* add by ps */
function toggleSearch()
{
    var elements = allById(new Array("expert_search","simple_search"));
    if (elements)
    {
        var selected = elements[0].style.display == "none";
        elements[0].style.display = selected ? "" : "none";
        elements[1].style.display = selected ? "none" : "";
    }
}

/* add by ps */
function toggleAdvancedSearch()
{
    var elements = allById(new Array("simple_search","advanced_search"));
    if (elements)
    {
        var selected = elements[0].style.display == "none";
        elements[0].style.display = selected ? "" : "none";
        elements[1].style.display = selected ? "none" : "";
    }
}

/* add by ps */
function toggleExpertSearch()
{
    var elements = allById(new Array("expert_search","advanced_search"));
    if (elements)
    {
        var selected = elements[0].style.display == "none";
        elements[0].style.display = selected ? "" : "none";
        elements[1].style.display = selected ? "none" : "";
    }
}


function toggleFql() {
    var elements = allById(new Array("scope_search_fql_mode",
                                     "scope_search_wizard",
                                     "scope_search_fql",
                                     "scope_search_toggle_fql_label",
                                     "scope_search_toggle_wiz_label",
                                     "scope_search_find_within"));
    if (elements) {
        elements[0].value = elements[0].value == "true" ? "false" : "true";
        elements[1].style.display = elements[0].value == "true" ? "none" : "block";
        elements[2].style.display = elements[0].value == "true" ? "block" : "none";
        elements[3].style.display = elements[0].value == "true" ? "none" : "inline";
        elements[4].style.display = elements[0].value == "true" ? "inline" : "none";
        elements[5].style.display = elements[0].value == "true" ? "none" : "";
    }
}


function setSort(fieldToOrder, sortOrder) {
	var currentSortFields = byId("multi_sort_fields");
	var currentAdditionalSortFields = byId("additional_multi_sort_fields");
	
	var fieldFound = false;
	if (currentSortFields != undefined) {
		var fields = currentSortFields.children;
		if(fields[0].type == "select-one" && fields[0].value == fieldToOrder) {
			if (sortOrder != "") {
				fields[1].value = sortOrder;
			} else if (fieldToOrder != "default"){
				fields[0].value = "default";
			}				
			fieldFound = true;
		} else {
			if (currentAdditionalSortFields != undefined && currentAdditionalSortFields.children.length == 0) {
				if (fields[0].value == "default") {
					addNewSort("default", fields[1].value);
					
					fields[0].value = fieldToOrder;
					fields[1].value = sortOrder;
					updateDisabledStatuses(multiSort);
					fieldFound = true;
				}
			}
		}
	}
	if (currentAdditionalSortFields != undefined && !fieldFound) {
		var fields = currentAdditionalSortFields.children;
		for (var i=0;i<fields.length;i++) {
			var field = fields[i];
			if(field.type == "select-one" && field.value == fieldToOrder) {
				if (sortOrder != "") {
					fields[i+1].value = sortOrder;
				} else {
					removeSortRow(parseInt(i/4)+1);
				}
				fieldFound = true;
				break;
			}
		}
	}
	if (!fieldFound && sortOrder!="") {
		addNewSort(fieldToOrder, sortOrder);
	}
	submitSearch();
}
function addNewSort(fieldToOrder, sortOrder) {
	addSortRow();
	// change last additional sortrow to the current field
	var currentAdditionalSortFields = byId("additional_multi_sort_fields");
	if (currentAdditionalSortFields != undefined) {
		var fields = currentAdditionalSortFields.children;
		var field = fields[fields.length-3];
		var fieldSortOrder = fields[fields.length-2];
		if(field.type == "select-one") {
			field.value = fieldToOrder;
		}
		if(fieldSortOrder.type == "select-one") {
			fieldSortOrder.value = sortOrder;
		}			
	}
}

function getAllDocs(form, id) {

    var params = $('#'+form).serialize();
    /*var params = $(form).serialize();*/
    var url = "getCollapsedDocs.shtml?" + params + "&s.sm.pfadcollapse=" + id;
/*      new Ajax.Request(url, {
            method: 'get',
             onSuccess: function(transport) {
                    updateResultDocs(id, transport);
             }
     });
*/
    $.ajax({
            url: url,
            method: 'GET',
            success: function(data) {
                    updateResultDocs(id,data);
            }
    });
}

function updateResultDocs(id, result) {

    $('#docs' + id).html(result);
    /*$('docs' + id).update(result.responseText);*/
    /*$('docs' + id).show();*/

    $('#docs' + id).children('div').eq(1).hide();
    /*$('docs' + id).down().next().hide();*/
/*
    var rank_results = $('docs' + id).getElementsByClassName("rank");
    for (i=0;i<rank_results.length;i++)
    {
            rank_results[i].hide();
    }
*/
    $('#docs' + id).slideDown(200);
    /*Effect.SlideDown('docs' + id, { duration: 1.0 });*/

    $('#header' + id+ 'Closed').hide();
    /*$('header' + id+ 'Closed').hide();*/
    $('#header' + id+ 'Open').show();
    /*$('header' + id+ 'Open').show();*/
}

function hideDocs(id) {
    /*$('docs' + id).hide();*/
    /*Effect.SlideUp('docs' + id, { duration: 1.0 });*/
    $('#docs' + id).slideUp(200);

    $('#header' + id+ 'Open').hide();
    /*$('header' + id+ 'Open').hide();*/
    $('#header' + id+ 'Closed').show();
    /*$('header' + id+ 'Closed').show();*/
}


}
/*
     FILE ARCHIVED ON 19:30:45 Jul 22, 2021 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 19:30:52 Jan 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  exclusion.robots: 0.067
  exclusion.robots.policy: 0.057
  cdx.remote: 0.133
  esindex: 0.01
  LoadShardBlock: 137.042 (6)
  PetaboxLoader3.datanode: 168.853 (8)
  load_resource: 237.436 (2)
  PetaboxLoader3.resolve: 116.361 (2)
*/