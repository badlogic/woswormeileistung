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

function nextStenprot() {
    $(".redeEntry").get(getActiveIndex()+1).click();
    openActive();
}
function lastStenprot() {
    $(".redeEntry").get(getActiveIndex()-1).click();
    openActive();
}

function openActive() {
    //TODO oder lieber nicht?
}

function getActiveIndex() {
    return $(".redeEntry").index($(".redeEntry.active"));
};

function ladeStenprot(rede, url) {
    $(".redeEntry").removeClass("active");
    $(rede).addClass("active");

    //$('#protDialog').draggable();
    //$('#protDialog').resizable();

    $(".protContainer").load(url);
    $("#protDialog").show();
}


}
/*
     FILE ARCHIVED ON 19:30:49 Jul 22, 2021 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 19:31:09 Jan 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  exclusion.robots: 0.101
  exclusion.robots.policy: 0.087
  cdx.remote: 0.125
  esindex: 0.011
  LoadShardBlock: 214.793 (6)
  PetaboxLoader3.datanode: 229.236 (8)
  load_resource: 117.995 (2)
  PetaboxLoader3.resolve: 89.448 (2)
*/