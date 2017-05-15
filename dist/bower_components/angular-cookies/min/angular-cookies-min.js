/**
 * @license AngularJS v1.3.13
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */
!function(o,n,e){"use strict";n.module("ngCookies",["ng"]).factory("$cookies",["$rootScope","$browser",function(o,i){function r(){var o,r,f,u;for(o in c)a(t[o])&&i.cookies(o,e);for(o in t)r=t[o],n.isString(r)||(r=""+r,t[o]=r),r!==c[o]&&(i.cookies(o,r),u=!0);if(u){u=!1,f=i.cookies();for(o in t)t[o]!==f[o]&&(a(f[o])?delete t[o]:t[o]=f[o],u=!0)}}var t={},c={},f,u=!1,s=n.copy,a=n.isUndefined;return i.addPollFn(function(){var n=i.cookies();f!=n&&(f=n,s(n,c),s(n,t),u&&o.$apply())})(),u=!0,o.$watch(r),t}]).factory("$cookieStore",["$cookies",function(o){return{get:function(e){var i=o[e];return i?n.fromJson(i):i},put:function(e,i){o[e]=n.toJson(i)},remove:function(n){delete o[n]}}}])}(window,window.angular);