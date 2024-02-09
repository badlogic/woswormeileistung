var _paq = _paq || [];

var dsgvo = getCookie('pddsgvo');
if (dsgvo != 'j' || dsgvo == undefined) {
  _paq.push(['disableCookies']);
  _paq.push(['trackPageView']);
} else {
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
}

function getSiteId() {
  if (location.host.indexOf('entw') > 0) {
    if (location.host.startsWith('intranet')) {
      return 6;
    } else {
      return 2;
    }
  } else {
    if (location.host.startsWith('intranet')) {
      return 15;
    } else {
      return 1;
    }
  }
}

function getCookie(name) {
  var cookieArray = document.cookie.split(';');
  for (var i = 0; i < cookieArray.length; i++) {
    var nameValuePair = cookieArray[i].split('=');
    var xname = nameValuePair[0];
    while (xname.charAt(0) == ' ') {
      xname = xname.substring(1);
    }
    if (xname == name) return nameValuePair[1];
  }
  return null;
}

(function () {
  siteId = getSiteId();
  var u = '//www.' + (location.host.indexOf('entw') > 0 ? 'entw.' : '') + 'parlament.gv.at/piwik/';
  _paq.push(['setTrackerUrl', u + 'piwik.php']);
  _paq.push(['setSiteId', getSiteId()]);
  var d = document,
    g = d.createElement('script'),
    s = d.getElementsByTagName('script')[0];
  g.type = 'text/javascript';
  g.async = true;
  g.defer = true;
  g.src = u + 'piwik.js';
  s.parentNode.insertBefore(g, s);
})();
