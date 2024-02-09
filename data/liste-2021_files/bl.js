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


function BackgroundLoader() {}


//
// Private members
//

BackgroundLoader.prototype.__request = false;
BackgroundLoader.prototype.__sequenceNumber = false;
BackgroundLoader.prototype.__loadedCallback = function(content) {};
BackgroundLoader.prototype.__errorCallback = function(error) {};


//
// Public methods
//

BackgroundLoader.prototype.setSequenceNumber = function(sequenceNumber) {
    this.__sequenceNumber = sequenceNumber;
};

BackgroundLoader.prototype.setLoadedCallback = function(loadedCallback) {
    this.__loadedCallback = loadedCallback;
};

BackgroundLoader.prototype.setErrorCallback = function(errorCallback) {
    this.__errorCallback = errorCallback;
};

BackgroundLoader.prototype.loadUrl = function(url) {
    this.__request = this.__getXmlHttpRequest();
    if (this.__request) {
        var loader = this;
        this.__request.onreadystatechange = function() { loader.__processReqChange(); };
        this.__request.open("GET", encodeURI(url), true);
        this.__request.send(null);
    }
};

BackgroundLoader.prototype.isEnabled = function() {
    return this.__getXmlHttpRequest() != null;
};


//
// Private methods
//

BackgroundLoader.prototype.__processReqChange = function() {
    var request = this.__request;
    // only if req shows "loaded"
    if (request.readyState == 4) {
        // only if "OK"
        if (request.status == 200) {
            this.sequenceNumber == false
                    ? this.__loadedCallback(request.responseText)
                    : this.__loadedCallback(request.responseText, this.__sequenceNumber);
        } else {
            this.sequenceNumber == false
                    ? this.__errorCallback(request.status + ": " + request.statusText)
                    : this.__errorCallback(request.status + ": " + request.statusText, this.__sequenceNumber);
        }
    }
};

BackgroundLoader.prototype.__getXmlHttpRequest = function() {
    if (typeof XMLHttpRequest != "undefined") {
        return new XMLHttpRequest();
    } else {
        try {
            return new ActiveXObject("Msxml2.XMLHTTP");
        } catch(e1) {
            try {
                return new ActiveXObject("Microsoft.XMLHTTP");
            } catch(e2) {
                return null;
            }
        }
    }
};


}
/*
     FILE ARCHIVED ON 21:06:42 Dec 08, 2022 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 19:36:17 Jan 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  exclusion.robots: 0.083
  exclusion.robots.policy: 0.07
  cdx.remote: 0.109
  esindex: 0.011
  LoadShardBlock: 302.849 (6)
  PetaboxLoader3.resolve: 242.874 (4)
  PetaboxLoader3.datanode: 260.076 (8)
  load_resource: 237.769 (2)
*/