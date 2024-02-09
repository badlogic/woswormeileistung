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

function resizeBody(m) {
  var fontSize = getCookie('fontSize');
  if ((fontSize == null) || (fontSize == '')) fontSize = '1.0em';
  fontSize = parseFloat(fontSize) + (m * 0.2) + 'em';
  setCookie('fontSize', fontSize);
  refreshSize();
}

function setDesktop() {
  setCookie('viewport','desktop');
  refreshSize();
}

function setMobile() {
  setCookie('viewport','mobile');
  refreshSize();
}

function refreshSize() {
  var fontSize = getCookie('fontSize');
  if (fontSize != null) document.body.style.fontSize = fontSize; 
	
  var viewport = getCookie('viewport');
  if (viewport != null && viewport=="desktop") {
    document.querySelector('meta[name=viewport]').setAttribute('content', 'width=1025');
	$('.mobileLink').css('display','inline');
  }
  if (viewport != null && viewport=="mobile") {
    document.querySelector('meta[name=viewport]').setAttribute('content', 'width=device-width, initial-scale=1');
  }
  
}

function getCookie(name) {
  var cookieArray = document.cookie.split(';');
  for (var i = 0; i < cookieArray.length; i++) {
    var nameValuePair = cookieArray[i].split('=');
    var xname = nameValuePair[0]
    while (xname.charAt(0) == ' ') {
      xname = xname.substring(1);
    }
    if (xname == name) return nameValuePair[1];
  }
  return null;
}

function setCookie(name, value) {
  document.cookie = name + "=" + value + ";path=/";  
}

function changecss(theClass,element,value) {
	$(theClass).css(element,value);
}



}
/*
     FILE ARCHIVED ON 19:30:46 Jul 22, 2021 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 19:30:53 Jan 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  exclusion.robots: 0.108
  exclusion.robots.policy: 0.095
  cdx.remote: 0.123
  esindex: 0.009
  LoadShardBlock: 223.267 (6)
  PetaboxLoader3.datanode: 186.133 (8)
  load_resource: 224.082 (2)
  PetaboxLoader3.resolve: 113.034 (2)
*/