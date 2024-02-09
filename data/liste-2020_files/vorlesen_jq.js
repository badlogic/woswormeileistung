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
 * vorlesen.js:
 * Requires "prototype.js" (is already used on Parlament.gv.at)
 * @author: Johannes Zweng
 * @date: 25.10.2013
 * Version: 1.1
 */


// Encapsulate everything here in a local name-space
(function(){
	
// -- configuration --
var speakerImageId = '#vorleseSpeakerImage';
var playerPlatzhalterDivId = '#vorlesePlayerPlatzhalter';
var audioPlayerId = '#vorleseAudioPlayer';
var docAudioPlayerId = 'vorleseAudioPlayer';
var arrIconSpeakerImage = new Array('/img/icons/medium/vorlesen_lila.gif', '/img/icons/medium/vorlesen_lila.gif');
var audioUrlPrefix = 'https://web.archive.org/web/20210722193046/https://vorlesen.parlament.gv.at/reader';
var readerServiceCustomer = 'parlament.gv.at';
//-- configuration --


// initialization:
var speakerIconPaused = arrIconSpeakerImage[0];
var speakerIconPlaying = arrIconSpeakerImage[1];
var isPlayerHidden = true;
var hasPlayedBefore = false;



/*
* Toggle vorlese audio player
* (the only function name in global namespace!)
*/
toggleVorlesePlayer = function () {	
	if (isPlayerHidden) {
		showPlayer();
	} else {
		hidePlayer();
	}
};


//
// local functions below
//
var hidePlayer = function() {
	var playerDiv = $(playerPlatzhalterDivId);
	var playButton = $(speakerImageId);
	if (playerDiv!=null && playerDiv.is(':visible')) {
		pauseHtml5();
		playerDiv.hide();
	}
	if (playButton!=null) {
		playButton.src = speakerIconPaused;
	}
	isPlayerHidden = true;
};

var showPlayer = function() {
	var playerDiv = $(playerPlatzhalterDivId);
	var playButton = $(speakerImageId);
	if (playerDiv!=null && !playerDiv.is(':visible')) {
		playerDiv.show();
	}
	setAudioSource();
	if (playButton!=null) {
		playButton.src = speakerIconPlaying;
	}

	//
	// optionally start playing immediately:
	//
	var playHtml5 = function() {
		var player = document.getElementById(docAudioPlayerId);
		if (player!=null && player.canPlayType && player.paused) {
			player.play();
		}
	};
	if (hasPlayedBefore) {
		playHtml5();
	} 
	// workaround for some html5 player
	// let's wait some ms the first time
	else {
		hasPlayedBefore=true;
		window.setTimeout(function() {
			playHtml5();
		},800);
	}
	isPlayerHidden = false;
};

var setAudioSource = function() {
	var player = $(audioPlayerId);
	var docPlayer = document.getElementById(docAudioPlayerId);
	var audioUrl;
	var url = encodeURIComponent(document.location.href);

	if (player!=null) {
		// first check if the player supports the "canPlayType" Field
		if (player.attr("src") === 'none' || player.attr("src") == '' || player.attr("src") == null || player.attr("src") === false ) {
			//if (player.canPlayType('audio/ogg') === 'maybe' || player.canPlayType('audio/ogg') === 'probably' ) {
			if (docPlayer.canPlayType('audio/ogg; codecs="vorbis"') === 'maybe' || docPlayer.canPlayType('audio/ogg; codecs="vorbis"') === 'probably') {
				// if the browser understands ogg/vorbis then use it:
				audioUrl = audioUrlPrefix + '/reader.do?customer=' + readerServiceCustomer + '&lang=de_AT&voice=leopold&format=ogg&url=' + url + '&html=&token=null';
			} else {
				// otherwise use MP3:
				audioUrl = audioUrlPrefix + '/reader.do?customer=' + readerServiceCustomer + '&lang=de_AT&voice=leopold&format=mp3&url=' + url + '&html=&token=null';
			}			
			player.attr( "src",audioUrl);

		}
	}
};

var pauseHtml5 = function() {
	var player = document.getElementById(docAudioPlayerId);
	if (player!=null && player.canPlayType && !player.paused) {
		player.pause();
	}
};


// end of local namespace
})();



}
/*
     FILE ARCHIVED ON 19:30:46 Jul 22, 2021 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 19:30:55 Jan 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  exclusion.robots: 0.071
  exclusion.robots.policy: 0.057
  cdx.remote: 0.098
  esindex: 0.012
  LoadShardBlock: 198.704 (6)
  PetaboxLoader3.datanode: 165.185 (8)
  load_resource: 109.735 (2)
  PetaboxLoader3.resolve: 66.934 (2)
*/