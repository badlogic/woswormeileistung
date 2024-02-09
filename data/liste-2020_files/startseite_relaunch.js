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

if (typeof console === "undefined" || typeof console.log === "undefined") {
  console = {};
  console.log = function () { };
}

// Remove "no-js" class from body
jQuery(document).ready(function() {
  jQuery('.no-js')
    .removeClass('no-js')
    .addClass('has-js');
});

let currentTopicsGlobalPause = false;

/* To be HTML valid on http://validator.w3.org (we still have HTML 4.01 defined)
   We do not use ng-init but instead initialize angular manual
   To be clear: we cannot insert any ng- attributes direct into HTML as this would make the side invalid
   and need to do it with jquery before bootstrapping angular
*/

jQuery(document).ready(function() {

  /* SPLASH SCREEN
  date = new Date().getDate();

  if ((date==26 || window.location.host.indexOf('iwww.entw')>=0) && (location.pathname=='/' || location.pathname=='/index.shtml' || location.pathname=='/intranet.shtml' || location.pathname=='/internet.shtml')) {
    $('html').attr('style','overflow:hidden;');
    jQuery('.splashScreen').fadeIn(1000);
  }
  */

  var $elem;

  // Current Topis ("Bühne")
  var len = 0;
  $elem = jQuery(".current-topic");

//  $elem.find('.current-topic-itemlist').append('<div class="current-topic-points"><div class="current-topic-points-inner"><ul><li><span></span></li></ul></div></div>');

  jQuery(".current-topic-item", $elem).each(function (index, value) {
    jQuery(value)
      .attr('ng-show', 'index == ' + (index+1));
    len++;
  });

  // by ps random for Buecher SlideShow
  var ran = Math.floor((Math.random() * len)+1);
  if($elem.parent().hasClass("contentBlock") && $elem.parent().hasClass("Vorschau")) {
	  // Slideshow /HPTH/Bibliothek/vorschau.shtml
	  $elem
    .attr('ng-controller', 'CurrentTopicsCtrl')
    .attr('ng-init', 'index=' + ran + ';length=' + len + ';reloadAtFinish="true";start(5000);')
    .attr('ng-mouseleave', '')
    .attr('ng-mouseenter', '')
    .attr('ng-keydown', '')
    ;
  }
  else if($elem.parent().hasClass("contentBlock")) {
	  // Slideshow /SERV/ANG/BIBL/index.shtml
    $elem
    .attr('ng-controller', 'CurrentTopicsCtrl')
    .attr('ng-init', 'index=' + ran + ';length=' + len + ';start(5000);')
    .attr('ng-mouseleave', 'start()')
    .attr('ng-mouseenter', 'stop()')
    .attr('ng-keydown', 'pauseOrResume($event)')
    ;
  } else {
  // Startseite Slideshow
  $elem
    .attr('ng-controller', 'CurrentTopicsCtrl')
    .attr('ng-init', 'index=1;length=' + len + ';start(20000);')
    .attr('ng-mouseleave', 'start()')
    .attr('ng-mouseenter', 'stop()')
    .attr('ng-keydown', 'pauseOrResume($event)')
    ;
  }

//by ps for contentBlockSlideShow

  if($elem.parent().hasClass("contentBlock")) {
   jQuery(".current-topic-left").append('<div class="playButton"><a href="javascript:void(0);"><img src="/img/design/play.gif" alt="Nächstes Bild anzeigen"></a></div>');
   var j=2;
   jQuery('.current-topic-left .playButton a').each(function(index,value){ jQuery(value).attr('ng-click', 'select(index+1)');});
  } else {
  $elem.find('.current-topic-itemlist').prepend('<div class="current-topic-points"><div class="current-topic-points-inner"><img id="globalPause" tabindex="0" alt="Slideshow pausieren" src="img/slide/Slide_Pause.svg"><ul class="current-topic-points-list"><li><span></span></li></ul></div></div>');
  jQuery(".current-topic-points li", $elem)
    .attr('ng-repeat', 'i in range(1, length) track by $index')
    .attr('ng-click', 'select(i)')
    .attr('ng-class', '{active: index==i}')
    ;
  //lberger:
  //pause slideshow globally
  jQuery('#globalPause').on("click", toggle_global_current_topics_pause);
  jQuery('#globalPause').on("keypress", function(e){
    if(e.keyCode == 13){
      toggle_global_current_topics_pause();
    }
  });

  }
  
  // - Fonda, Ulrich:
  // - add next/prev button handlers
  $elem.find('.current-topic-controls-prev').attr('ng-click','prev()');
  $elem.find('.current-topic-controls-next').attr('ng-click','next()');

  // Slideshow(s)
  jQuery(".ng-nike-slide-show")
    .attr('nike-slide-show', '')
    //.find('.playButton a').attr('ng-click', 'next();')
    ;

   // TODO: offset classe suchen, wert ermittlen und dann offset=n setezen (anber nur wenn offset gefunden)
   // name|="offset"]
   //console.log(jQuery(".ng-nike-slide-show[class*='offset-']").attr('class'));
   // http://stackoverflow.com/a/9776526
   //console.log(jQuery(".ng-nike-slide-show").attr("class"));
   jQuery(".ng-nike-slide-show").each(function() {
    var matches = jQuery(".ng-nike-slide-show").attr("class").match(/offset-?(\d*)$/);
    if(matches && matches[1]) {
      jQuery(this).attr('offset', matches[1]);
    }
   });


  // Angular Bootstrap
  /*window.setTimeout(function() {
    angular.bootstrap(document, ['nike']);
  }, 50);*/
  angular.bootstrap(document, ['nike']);

  setTimeout(positionArrows,500);

});


/*
* lberger:
* pause slideshow globally
*/
function toggle_global_current_topics_pause(e){
  console.log("toggle_global_current_topics_pause");
  currentTopicsGlobalPause = !currentTopicsGlobalPause;
  console.log("pause: " + currentTopicsGlobalPause);
  jQuery('#globalPause').attr("src", currentTopicsGlobalPause ? "img/slide/Slide_Play.svg" : "img/slide/Slide_Pause.svg");
  jQuery('#globalPause').attr("alt", currentTopicsGlobalPause ? "Slideshow fortsetzen" : "Slideshow pausieren");
}

function recalculate_current_topic_itemlist () {
          var $elem = jQuery('.current-topic');
          var $points = $elem.find('.current-topic-points');
          var $pointsinner = $elem.find('.current-topic-points-inner');
          var $itemlist = $elem.find('.current-topic-itemlist');
          var $slide = $elem.find('.current-topic-item:not(.ng-hide)');
          var $slide_left = $slide.find('.current-topic-left');
		  
          $itemlist.css('min-height', $slide.outerHeight());
          current = $pointsinner.outerHeight();
          $points.css('top', $slide_left.height() - current);
      }

 function positionArrows() {

        var $slide = jQuery('.current-topic-item:not(.ng-hide) .current-topic-left');
        var $prev = jQuery('.current-topic-controls-prev');
        var $next = jQuery('.current-topic-controls-next');

        $prev.add($next).css('top', ($slide.height() / 2));
    }

var nike = angular.module('nike', ['ngAnimate'])

  .controller("CurrentTopicsCtrl", function($scope, $timeout) {

    $scope.length = 0;
    $scope.index = 1
//  $scope.interval = 4700; laut kerle wegen screenreader erhöhen auf 20s
    $scope.interval = 4000; // default
    $scope.paused = true;
    var timeout = null;
	$scope.reloadAtFinish=false;
	$scope.countElems = 0;

    $scope.play = function() {
      timeout = $timeout(function() {
        if(!$scope.paused) {
          if(!currentTopicsGlobalPause){
            $scope.next();
          }
          $scope.play();
        }
      }, $scope.interval);
    };

    $scope.start = function(interval) {
      //    console.log('Int1:'+interval);
      if (interval != undefined){
        $scope.interval = interval;
      }
      if($scope.paused) {
        //console.log('start');
        $scope.paused = false;
        $scope.play();
      }
    }
    $scope.stop = function() {
      //console.log('stop');
      $timeout.cancel(timeout);
      timeout = null;
      $scope.paused = true;
    };

    $scope.pauseOrResume = function($event) {
      if ($event.keyCode == 80) {
         if ($scope.paused == false) {
            $scope.stop();
         }
         else {
            $scope.start();
           }
      }
    }

    $scope.range = function(min, max, step) {
      max = Math.ceil(max);
      step = (step == undefined) ? 1 : step;
      var input = [];
      for (var i = min; i <= max; i += step) {
        input.push(i);
      }
      return input;
    };

    $scope.select = function(index) {
	  if ($scope.reloadAtFinish) {
		  $scope.countElems = $scope.countElems + 1
		  if ($scope.countElems > $scope.length) {
			  location.reload();
		  }
	  }
      if(index < 1) {
        index = $scope.length;
      }
      if(index > $scope.length) {
        index = 1;
      }
      $scope.index = index;

      var $el = jQuery('.current-topic-item')[$scope.index-1];
      jQuery('img', $el).each(function (index, value) {
        var $el = jQuery(value);
        var src = $el.attr('data-src');
        if(src) {
          $el.attr('src', src);
          $el.attr('data-src', '');
        }
      });

      setTimeout(recalculate_current_topic_itemlist,500);
      positionArrows();

    }

      $scope.next = function () {
          $scope.select($scope.index + 1);
	}

      $scope.prev = function () {
          $scope.select($scope.index - 1);
      }

      positionArrows();

      jQuery(window).on('debouncedwidth', function () {
          positionArrows();
      });


	$scope.recalculate_current_topic_itemlist = function () {
          var $elem = jQuery('.current-topic');
          var $points = $elem.find('.current-topic-points');
          var $itemlist = $elem.find('.current-topic-itemlist');
          var $slide = $elem.find('.current-topic-item:not(.ng-hide)');
          var $slide_left = $slide.find('.current-topic-left');
          
          $itemlist.css('min-height', $slide.outerHeight());
          current = $points.outerHeight();
          $points.css('top', $slide_left.height() - current);
      }
  })

  .directive('nikeSlideShow', function() {
    return {
      replace: false,
      compile: function(element, attrs) {

        //var $el = jQuery('#' + attrs.id); TODO: not used?
        var index = 0;
        var length = 0;
        var width = 0;
        var height = 0;
        var offset = 0;



        var $elSlideshow = jQuery('#' + attrs.id);
        $elSlideshow.append('<div class="playButton"><a href="javascript:void(0);"><img alt="N&auml;chstes Bild anzeigen" src="/img/design/play.gif"></a></div>');
        jQuery('.playButton a', $elSlideshow).attr('ng-click', 'next();');


        var classes = $elSlideshow.attr('class');
        //console.log(classes.indexOf("offset=3")); // TODO

        //console.log('Offset', attrs.offset);
        if(attrs.offset) {
          offset = attrs.offset;
        }


        function prepare_image($img) {

          var src = $img.attr('data-src');
          if(src) {
            //$img.attr('width', width);
            //$img.attr('height', height);
            $img.css({
              //'display': 'inline-block',
              //'minWidth': width + 'px',
              //'minHeight': height + 'px',
              //'backgroundColor': '#ddd',
            });
            //$img.attr('src', src);
            $img.load(src);
            $img.attr('data-src', '');
          }
        }

        jQuery('#' + attrs.id + ' > div.slide').each(function (index, value) {
          var $el = jQuery(value);
          $el.attr('ng-show', 'currentImageIndex==' + index);

          if(index == 0) {
            width = $el.attr('width'); // TODO: may be wrong
            height = $el.attr('height'); // TODO: may be wrong
          }

          // BERECHNENNUNG HIER

          // Preload image 2 (index 1)
          if(index == 1) {
           prepare_image($el);
          }
          length++;
        });

        // Return Link function
        return function(scope, element, attrs) {

          scope.currentImageIndex = 0;

          if(offset > 0) { // offset != -1
            var now = new Date();
            var day = now.getDate();
            //day -= 10;
            scope.currentImageIndex = ((day + offset) % length);
          }
          //console.log(length);
          //console.log(day);
          //console.log(scope.currentImageIndex);
          var $img = jQuery('#' + attrs.id + ' > div.slide').eq(scope.currentImageIndex);
          prepare_image($img);

          //scope.currentImageIndex = 0; // Anzahl_bilder % tag (1-31) + offset



          scope.next = function() {
            scope.currentImageIndex++;
            if(scope.currentImageIndex >= length) {
              scope.currentImageIndex = 0;
            }

            var $img = jQuery('#' + attrs.id + ' > div.slide').eq(scope.currentImageIndex);
            prepare_image($img);

            // Preload next image
            var preload_index = scope.currentImageIndex+1;
            if(preload_index <= length-1) {
              var $img = jQuery('#' + attrs.id + ' > div.slide').eq(preload_index);
              prepare_image($img);
            }
          }
        };
      },
    };
  })


  .run(function() {
      // -  Fonda, Ulrich:
         
      jQuery(window).on('debouncedwidth', function () {
          recalculate_current_topic_itemlist();
      });
      setTimeout(recalculate_current_topic_itemlist,500);
  })

  ;



}
/*
     FILE ARCHIVED ON 19:30:46 Jul 22, 2021 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 19:30:56 Jan 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  exclusion.robots: 0.073
  exclusion.robots.policy: 0.062
  cdx.remote: 0.104
  esindex: 0.011
  LoadShardBlock: 177.597 (6)
  PetaboxLoader3.datanode: 171.264 (8)
  load_resource: 183.478 (2)
  PetaboxLoader3.resolve: 99.885 (2)
*/