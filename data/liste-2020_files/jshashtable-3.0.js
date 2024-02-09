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
 * @license jahashtable, a JavaScript implementation of a hash table. It creates a single constructor function called
 * Hashtable in the global scope.
 *
 * http://www.timdown.co.uk/jshashtable/
 * Copyright 2013 Tim Down.
 * Version: 3.0
 * Build date: 17 July 2013
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Hashtable=function(t){function n(t){return typeof t==p?t:""+t}function e(t){var r;return typeof t==p?t:typeof t.hashCode==y?(r=t.hashCode(),typeof r==p?r:e(r)):n(t)}function r(t,n){for(var e in n)n.hasOwnProperty(e)&&(t[e]=n[e])}function i(t,n){return t.equals(n)}function u(t,n){return typeof n.equals==y?n.equals(t):t===n}function o(n){return function(e){if(null===e)throw new Error("null is not a valid "+n);if(e===t)throw new Error(n+" must not be undefined")}}function s(t,n,e,r){this[0]=t,this.entries=[],this.addEntry(n,e),null!==r&&(this.getEqualityFunction=function(){return r})}function a(t){return function(n){for(var e,r=this.entries.length,i=this.getEqualityFunction(n);r--;)if(e=this.entries[r],i(n,e[0]))switch(t){case E:return!0;case K:return e;case q:return[r,e[1]]}return!1}}function l(t){return function(n){for(var e=n.length,r=0,i=this.entries,u=i.length;u>r;++r)n[e+r]=i[r][t]}}function f(t,n){for(var e,r=t.length;r--;)if(e=t[r],n===e[0])return r;return null}function h(t,n){var e=t[n];return e&&e instanceof s?e:null}function c(){var n=[],i={},u={replaceDuplicateKey:!0,hashCode:e,equals:null},o=arguments[0],a=arguments[1];a!==t?(u.hashCode=o,u.equals=a):o!==t&&r(u,o);var l=u.hashCode,c=u.equals;this.properties=u,this.put=function(t,e){g(t),d(e);var r,o,a=l(t),f=null;return r=h(i,a),r?(o=r.getEntryForKey(t),o?(u.replaceDuplicateKey&&(o[0]=t),f=o[1],o[1]=e):r.addEntry(t,e)):(r=new s(a,t,e,c),n.push(r),i[a]=r),f},this.get=function(t){g(t);var n=l(t),e=h(i,n);if(e){var r=e.getEntryForKey(t);if(r)return r[1]}return null},this.containsKey=function(t){g(t);var n=l(t),e=h(i,n);return e?e.containsKey(t):!1},this.containsValue=function(t){d(t);for(var e=n.length;e--;)if(n[e].containsValue(t))return!0;return!1},this.clear=function(){n.length=0,i={}},this.isEmpty=function(){return!n.length};var y=function(t){return function(){for(var e=[],r=n.length;r--;)n[r][t](e);return e}};this.keys=y("keys"),this.values=y("values"),this.entries=y("getEntries"),this.remove=function(t){g(t);var e,r=l(t),u=null,o=h(i,r);return o&&(u=o.removeEntryForKey(t),null!==u&&0==o.entries.length&&(e=f(n,r),n.splice(e,1),delete i[r])),u},this.size=function(){for(var t=0,e=n.length;e--;)t+=n[e].entries.length;return t}}var y="function",p="string",v="undefined";if(typeof encodeURIComponent==v||Array.prototype.splice===t||Object.prototype.hasOwnProperty===t)return null;var g=o("key"),d=o("value"),E=0,K=1,q=2;return s.prototype={getEqualityFunction:function(t){return typeof t.equals==y?i:u},getEntryForKey:a(K),getEntryAndIndexForKey:a(q),removeEntryForKey:function(t){var n=this.getEntryAndIndexForKey(t);return n?(this.entries.splice(n[0],1),n[1]):null},addEntry:function(t,n){this.entries.push([t,n])},keys:l(0),values:l(1),getEntries:function(t){for(var n=t.length,e=0,r=this.entries,i=r.length;i>e;++e)t[n+e]=r[e].slice(0)},containsKey:a(E),containsValue:function(t){for(var n=this.entries,e=n.length;e--;)if(t===n[e][1])return!0;return!1}},c.prototype={each:function(t){for(var n,e=this.entries(),r=e.length;r--;)n=e[r],t(n[0],n[1])},equals:function(t){var n,e,r,i=this.size();if(i==t.size()){for(n=this.keys();i--;)if(e=n[i],r=t.get(e),null===r||r!==this.get(e))return!1;return!0}return!1},putAll:function(t,n){for(var e,r,i,u,o=t.entries(),s=o.length,a=typeof n==y;s--;)e=o[s],r=e[0],i=e[1],a&&(u=this.get(r))&&(i=n(r,u,i)),this.put(r,i)},clone:function(){var t=new c(this.properties);return t.putAll(this),t}},c.prototype.toQueryString=function(){for(var t,e=this.entries(),r=e.length,i=[];r--;)t=e[r],i[r]=encodeURIComponent(n(t[0]))+"="+encodeURIComponent(n(t[1]));return i.join("&")},c}();

}
/*
     FILE ARCHIVED ON 19:30:46 Jul 22, 2021 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 19:31:03 Jan 28, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  exclusion.robots: 0.102
  exclusion.robots.policy: 0.088
  cdx.remote: 0.13
  esindex: 0.015
  LoadShardBlock: 392.526 (6)
  PetaboxLoader3.datanode: 440.633 (8)
  load_resource: 258.195 (2)
  PetaboxLoader3.resolve: 122.698 (2)
*/