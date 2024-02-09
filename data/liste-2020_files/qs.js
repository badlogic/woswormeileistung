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


/**
 * Constructor for QuerySuggester.
 */
function QuerySuggester() {
    this.id = querySuggesters.length;
    querySuggesters[this.id] = this;
}

QuerySuggester.prototype.useInlineSuggestion = true;                // Whether or not to display the first suggestion as marked text within the search-box
QuerySuggester.prototype.clearInlineSuggestionBeforeSubmit = false; // Whether or not to remove inline suggestions before submitting

// Public functions

/**
 * Initialize the query-suggester.
 *
 * @param suggestionUrl the url to fetch suggestions from, will append the query string to it
 * @param formId        the id of the form that should be submitted if the user clicks a suggestion
 * @param tooltipId     the id of the div used to display the suggestsions
 */
QuerySuggester.prototype.initialize = function(suggestionUrl, formId, tooltipId, queryId) {
    this.__enabled = new BackgroundLoader().isEnabled();
    if (this.__enabled) {
        this.__suggestionUrl = suggestionUrl;
        this.__form = this.byId(formId);
        if (!this.__form) {
            this.__enabled = false;
            this.debug("Couldn't find the form, disabling.");
        } else {
            this.__tooltip = this.byId(tooltipId);
            this.__queryId = queryId;
            this.__query = this.byId(queryId);
            if (this.__query) {
                var oldKeyUp = this.getFunctionBody(this.__query.onkeyup);
                var oldKeyDown = this.getFunctionBody(this.__query.onkeydown);
                var suggester = this;
                this.__query.onkeyup = function(e) { if (typeof e != "undefined") event = e; eval(oldKeyUp); suggester.keyUp(event, queryId); };
                this.__query.onkeydown = function(e) { if (typeof e != "undefined") event = e; eval(oldKeyDown); suggester.keyDown(event, queryId); };
            }
        }
    } else {
        this.debug("Unable to instantiate XMLHttpRequest, disabling.");
    }
};

/**
 * Set the id of the textarea where debug-output is written. Initially, there is no such
 * textarea assigned to the suggester.
 *
 * @param debugAreaID the id of the textarea to print debug messages to, or boolean false
                      to disable debugging
 */
QuerySuggester.prototype.setDebugAreaId = function(debugAreaId) {
    this.__debugAreaId = debugAreaId;
};

/**
 * Set the id of the input-field to do completion for. Not really neccessary to call, as
 * the id is sent to the key handling methods.
 *
 * @param queryId the id of the search box
 */
QuerySuggester.prototype.setQueryId = function(queryId) {
    this.__queryId = queryId;
    this.__query = this.byId(queryId);
};

// Overridable functions

/**
 * Returns the url to visit to obtain suggestions for a query. By default appends the
 * query to the suggestionUrl member. Override for different behavior.
 *
 * @param quer the query for which to fetch suggestions
 * @return the url that will return the suggestions
 */
QuerySuggester.prototype.getSuggestionUrl = function(query) {
    return this.__suggestionUrl + query;
};

/**
 * Called when the search form should be submitted (usually because of mouse clik on one
 * of the suggestions in the list). By default submits the form specified by the formId
 * parameter of the initialize() function. Override for different behavior.
 */
QuerySuggester.prototype.submitForm = function() {
    this.__form.submit();
};

// Input event handlers

/**
 * Event handler for key up events.
 */
QuerySuggester.prototype.keyUp = function(event, field) {
    if (!this.__enabled) return;
    else if (field != this.__queryId) this.setQueryId(field);
    if (event) {
        if (this.__timeout) {
            clearTimeout(this.__timeout);
            this.__timeout = false;
        }
        if (event.ctrlKey || event.altKey) {
            return;
        }
        var timeout = 100;
        this.__deletePressed = false;
        switch (event.keyCode) {
            case 9 : // Tab
            case 27 : // Escape
                this.hide();
                return;
            case 8 : // Backspace
            case 46 : // Delete
                this.__deletePressed = true;
                timeout = 200;
                break;
            case 13 : // Enter
            case 16 : // Shift
            case 17 : // Ctrl
            case 18 : // Alt
            case 20 : // Caps Lock
            case 33 : // Page up
            case 34 : // Page down
            case 35 : // End
            case 36 : // Home
            case 37 : // Arrow left
            case 38 : // Arrow up
            case 39 : // Arrow right
            case 40 : // Arrow down
            case 45 : // Insert
                return;
            default :
                timeout = 100;
                break;
        }
        this.__index = -1;
        var qc = this;
        this.__timeout = setTimeout(function() {qc.fetchAndDisplaySuggestions();}, timeout);
    }
};

/**
 * Some keys also require keyDown handlers, because they never give a key up event. For
 * instance, pressing the 'tab' key will typically cause focus to leave the search input
 * box, causing the key up event to be sent to another component.
 */
QuerySuggester.prototype.keyDown = function(event, field) {
    if (!this.__enabled) return;
    else if (field != this.__queryId) this.setQueryId(field);
    if (event && event.keyCode) {
        switch (event.keyCode) {
            case 9 : // Tab
                this.hide();
                break;
            case 13 : // Enter
                if (this.__index == -1) this.clearInlineSuggestion();
                break;
            case 38 : // Up-arrow
                if (this.__index >= 0) this.updateSuggestions(this.__index--, -2);
                break;
            case 40 : // Down-arrow
                if (this.__index < this.__terms.length - 1) this.updateSuggestions(this.__index++, -2);
                break;
        }
    }
};

QuerySuggester.prototype.mouseOver = function(index) {
    if (!this.__enabled) return;
    var previous = this.__mouseIndex >= 0 ? this.__mouseIndex : this.__index;
    this.__mouseIndex = index;
    this.updateSuggestions(-2, previous);
};

QuerySuggester.prototype.mouseOut = function(index) {
    if (!this.__enabled) return;
    var previous = this.__mouseIndex;
    this.__mouseIndex = -1;
    this.updateSuggestions(-2, previous);
};

QuerySuggester.prototype.mouseClick = function(index) {
    if (!this.__enabled) return;
    if (index >= 0)
    {
        this.__query.value = this.__terms[index];
        
        
        if (this.__form.id == "search_form_advanced_1")
        {
        	this.hide();
        }
        else
        {
            this.submitForm();
        }
    }
    else
    {
        this.hide();
    }
};

// Functions for retrieving suggestions

QuerySuggester.prototype.fetchAndDisplaySuggestions = function() {
    var val = this.__query.value;
    if (this.canHandleRanges()) {
        val = val.substring(0, this.getCaretPosition());
    }
    if (val.length == 0) {
        this.hide();
        this.__prev = val;
        return;
    } else {
        val = val.replace(new RegExp("\\\\", "g"), "\\\\");
    }
    this.__prev = val;
    if (this.__cache[val]) {
        this.debug("cache: " + val);
        this.displaySuggestions(this.__cache[val], this.__prev);
    } else {
        this.debug("query: '" + val + "'");
        this.fetchSuggestion(val);
    }
};

QuerySuggester.prototype.fetchSuggestion = function(query) {
    var qc = this;
    var bl = new BackgroundLoader();
    bl.setLoadedCallback(function(content){qc.parseSuggestions(content);});
    bl.setErrorCallback(function(error){qc.debug("Couldn't get suggestions:\n" + error);});
    bl.loadUrl(this.getSuggestionUrl(query));
};

// Functions for displaying suggestions

QuerySuggester.prototype.parseSuggestions = function(matches) {
    if (matches == "") return;
    var params = eval(matches);
    if (params.length > 2) {
        this.__cache[params[0]] = params;
    }
    this.displaySuggestions(params, params.length > 2 ? params[0] : "");
};

QuerySuggester.prototype.displaySuggestions = function(matches, query) {
    if (matches.length <= 2) {
        this.noSuggestions();
        return;
    }
    if (this.__tooltip && this.__query) {
        this.buildSuggestionsHtml(matches);
        this.show();
        this.showInlineSuggestions(query);
    }
};

QuerySuggester.prototype.buildSuggestionsHtml = function(matches) {
    var text = "";
    var length = matches.length / 2 - 1;
    this.__terms = new Array(length);
    for (var i = 0; i < length; ++i) {
        text += "<div class=\"suggestionEntry\" id=\"tooltip_" + i + "\" onmouseover=\"mouseOver(" + this.id + "," + i + ")\" onmouseout=\"mouseOut(" + this.id + "," + i + ")\" onclick=\"mouseClick(" + this.id + "," + i + ")\" style=\"cursor: pointer\">" +
                matches[i * 2 + 2] +
                "</div>\n";
        this.__terms[i] = matches[i * 2 + 2];
    }
    this.__tooltip.innerHTML = text;
};

QuerySuggester.prototype.showInlineSuggestions = function(query) {
    if (this.__terms.length > 0 && this.__query.value == query && !this.__deletePressed && this.useInlineSuggestion) {
        this.__original = this.__query.value;
        if (this.canHandleRanges()) {
            this.__query.value = this.__terms[0];
            this.selectRange(this.__original.length, this.__query.value.length);
        }
    }
};

QuerySuggester.prototype.updateSuggestions = function(previousIndex, previousMouseIndex) {
    var previous = this.byId("tooltip_" + previousIndex);
    var previousMouse = this.byId("tooltip_" + previousMouseIndex);
    var current = this.byId("tooltip_" + this.__index);
    var currentMouse = this.byId("tooltip_" + this.__mouseIndex);
    if (previous) {
        if (previousIndex != this.__mouseIndex) {
            previous.className = "suggestionEntry";
        }
    }
    if (current) {
        current.className = "suggestionEntryHover";
        if (this.canHandleRanges()) {
            this.__query.value = this.__terms[this.__index];
            this.selectRange(this.__original.length, this.__query.value.length);
        }
    }
    if (previousMouse && previousMouseIndex != this.__index) {
        previousMouse.className = "suggestionEntry";
    }
    if (currentMouse) {
        previousMouse.className = "suggestionEntryHover";
    }
};

/**
 * Called when the list of matches returned is empty. Default implementation will simply
 * hide the list of suggestions. Override for custom behavior.
 */
QuerySuggester.prototype.noSuggestions = function() {
    this.hide();
};

QuerySuggester.prototype.show = function()
{
    if (this.__tooltip && this.__query)
    {
        this.__tooltip.style.left = this.findPosX(this.__query) + "px";
        this.__tooltip.style.top = (this.findPosY(this.__query) + this.__query.offsetHeight) + "px";
        
        this.__tooltip.style.width = (this.__query.offsetWidth - 65) + "px";
        this.__tooltip.style.visibility = "visible";
    }
};

QuerySuggester.prototype.hide = function() {
    if (this.__tooltip) {
        this.__terms = new Array();
        this.__tooltip.style.visibility = "hidden";
    }
};

// Text-selection helper-functions

QuerySuggester.prototype.canHandleRanges = function() {
    return this.__query.createTextRange || this.__query.setSelectionRange;
};

QuerySuggester.prototype.selectRange = function(from, to) {
    if (this.__query.createTextRange) {
        var t = this.__query.createTextRange();
        t.moveStart("character", from);
        t.select();
    } else if (this.__query.setSelectionRange) {
        this.__query.setSelectionRange(from, to);
    } else {
        this.debug("Couldn't select range.");
    }
};

QuerySuggester.prototype.getCaretPosition = function() {
    if (document.selection) {
        var range = document.selection.createRange().duplicate();
        range.collapse(true);
        range.moveStart("character", -1000);
        return range.text.length;
    } else if (this.__query.setSelectionRange) {
        return this.__query.selectionStart;
    } else {
        this.debug("Couldn't find caret position.");
        return this.__query.value.length;
    }
};

QuerySuggester.prototype.clearInlineSuggestion = function() {
    if (this.__query && this.canHandleRanges() && this.clearInlineSuggestionBeforeSubmit) {
        this.__query.value = this.__query.value.substring(0, this.getCaretPosition());
    }
};

// General helper-functions

/**
 * Helper-function that extracts the body of a function, by converting it to a string, and
 * extracting the substring from after the first { to the last }. If the func argument
 * isn't a function, an empty string is returned.
 *
 * @param func the function whose body to extract
 * @return the body of func
 */
QuerySuggester.prototype.getFunctionBody = function(func) {
    var body = "";
    if (typeof func == "function") {
        body = func.toString();
        body = body.substring(body.indexOf("{") + 1, body.lastIndexOf("}"));
    }
    return body;
};

QuerySuggester.prototype.findPosX = function(obj) {
    var curleft = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent && obj.className != "pageContainer") {
            curleft += obj.offsetLeft;
            obj = obj.offsetParent;
        }
    } else if (obj.x)
        curleft += obj.x;
    return curleft;
};

QuerySuggester.prototype.findPosY = function(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent && obj.className != "pageContainer") {
            curtop += obj.offsetTop
            obj = obj.offsetParent;
        }
    } else if (obj.y) {
        curtop += obj.y;
    }
    return curtop;
};

QuerySuggester.prototype.byId = function(id) {
    var element = document.getElementById ? document.getElementById(id) : false;
    return element && element != null ? element : false;
};

QuerySuggester.prototype.debug = function(message) {
    if (this.__debugAreaId) {
        var err = this.byId(this.__debugAreaId);
        if (err) {
            err.value += message + "\n";
        }
    }
};

// Private members

QuerySuggester.prototype.__suggestionUrl = false;   // The url to fetch suggestions from
QuerySuggester.prototype.__form = false;            // The form
QuerySuggester.prototype.__query = false;           // The query input field
QuerySuggester.prototype.__queryId = false;         // The id of the query input field
QuerySuggester.prototype.__tooltip = false;         // The tooltip div
QuerySuggester.prototype.__debugAreaId = false;     // Text-area for debugging

QuerySuggester.prototype.__timeout = false;         // The current timeout
QuerySuggester.prototype.__prev = "";               // The previously sent term
QuerySuggester.prototype.__original = "";           // The term before panning into the suggestions
QuerySuggester.prototype.__index = -1;              // The index of the text cursor in the list of suggestions
QuerySuggester.prototype.__mouseIndex = -1;         // The position of the mouse in the list of suggestions
QuerySuggester.prototype.__terms = new Array();     // The list of suggestions
QuerySuggester.prototype.__cache = new Array();     // A result-cache
QuerySuggester.prototype.__enabled = false;
QuerySuggester.prototype.__deletePressed = false;   // Delete or backspace has been pressed



// Global stuff


// Global array of all instantiated query-suggesters
var querySuggesters = new Array();

// Global mouse-handling function
function mouseOver(id, index) {
    if (id >= 0 && id < querySuggesters.length) {
        querySuggesters[id].mouseOver(index);
    }
}

// Global mouse-handling function
function mouseOut(id, index) {
    if (id >= 0 && id < querySuggesters.length) {
        querySuggesters[id].mouseOut(index);
    }
}

// Global mouse-handling function
function mouseClick(id, index) {
    if (id >= 0 && id < querySuggesters.length) {
        querySuggesters[id].mouseClick(index);
    } else if (id == -1 && index == -1) {
        for (var i = 0; i < querySuggesters.length; ++i) {
            querySuggesters[i].mouseClick(index);
        }
    }
}


}
/*
     FILE ARCHIVED ON 19:30:45 Jul 22, 2021 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 19:30:58 Jan 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  exclusion.robots: 0.1
  exclusion.robots.policy: 0.084
  cdx.remote: 0.156
  esindex: 0.016
  LoadShardBlock: 101.543 (6)
  PetaboxLoader3.datanode: 129.127 (8)
  PetaboxLoader3.resolve: 79.573 (3)
  load_resource: 142.414 (2)
*/