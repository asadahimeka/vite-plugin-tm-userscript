// ==UserScript==
// @name              Test script
// @version           0.0.1
// @description       Test script
// @author            noname
// @namespace         com.script.Test
// @license           MIT
// @homepage          https://greasyfork.org/scripts/******
// @supportURL        https://github.com
// @match             https://abc.com/qwe*
// @match             https://asd.com/zxc*
// @run-at            document-body
// @grant             GM_download
// @grant             GM_addStyle
// @require           https://cdn.jsdelivr.net/npm/vue
// @require           https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

(function($) {
  "use strict";
  GM_addStyle(`
#app {
  background-color: beige;
}

.test {
  font-size: larger;
}
.test .hello {
  color: #000;
}

`);
  function _interopDefaultLegacy(e) {
    return e && typeof e === "object" && "default" in e ? e : { "default": e };
  }
  var $__default = /* @__PURE__ */ _interopDefaultLegacy($);


  console.log("hello");
  const hello = () => "hello";
  console.log("hello world main.ts: " + hello());
  console.log($__default["default"].fn.jquery);
  $__default["default"].noop();
})(jQuery);
