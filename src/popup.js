/*!
 * AgeGate Popup v0.0.1
 * https://github.com/nicknish/agegate-popup
 *
 * Copyright 2017 Nicholas Nishiguchi
 * Released under the MIT license
 */
(function(window) {
  'use strict';

  window.Agegate = function(options) {
    var defaults = {
      cookie: 'popup_agreed',
      body: 'Are you 21 or older?',
      cancelUrl: '/',
      expires: 7, // days
      success: function() {},
      fail: function() {}
    }

    options = options !== undefined ? options : {};
    this.setOptions(options, defaults);
    if (this.checkCookie(this.options.cookie)) return;

    this.createPopup();
    this.setEventHandlers();
    this.freezeScrolling();

    return this;
  }

  Agegate.prototype = {
    createPopup: function() {
      this.container = document.createElement('div');
      this.container.innerHTML = [
        '<div class="popup-backdrop" style="z-index: 1000; position: fixed; top: 0; right: 0; left: 0; bottom: 0; background-color: #242629; opacity: 0.78; overflow-x: hidden; overflow-y: auto;"></div>',
        '<div class="popup-modal" style="z-index: 1001; position: fixed; top: 0; right: 0; left: 0; bottom: 0; padding: 10px;">',
          '<div class="popup-container" style="box-sizing: border-box; position: relative; width: 100%; max-width: 350px; padding: 40px; margin: 80px auto 0; background: white;">',
            '<div class="popup-body" style="font-size: 26px; margin-bottom: 20px;">',
              this.options.body,
            '</div>',
            '<div class="popup-actions">',
              '<button class="popup-btn popup-agree" style="padding: 6px 12px; margin-right: 10px; border: none; font-size: 20px; background-color: rgba(0,0,0,.2); cursor: pointer;">Yes</button>',
              '<button class="popup-btn popup-cancel" style="padding: 6px 12px; border: none; font-size: 20px; background-color: rgba(0,0,0,.2); cursor: pointer;">No</button>',
            '</div>',
          '</div>',
        '</div>'
      ].join('');

      document.body.insertBefore(this.container, document.body.firstChild);
      this.agreeBtn = this.container.querySelector('.popup-agree');
      this.cancelBtn = this.container.querySelector('.popup-cancel');
    },
    destroyPopup: function() {
      this.container.parentNode.removeChild(this.container);
      this.allowScrolling();
    },
    successHandler: function() {
      this.setCookie();
      this.destroyPopup();
      this.options.success();
    },
    failHandler: function() {
      this.options.fail();
      window.location.href = this.options.cancelUrl;
    },
    setOptions: function(options, defaults) {
      this.options = Object.assign(defaults, options, { defaults: defaults });
    },
    checkCookie: function(cookie) {
      return Cookies.get(cookie);
    },
    setCookie: function() {
      Cookies.set(this.options.cookie, true, { expires: this.options.expires });
    },
    setEventHandlers: function() {
      this.agreeBtn.addEventListener('click', this.successHandler.bind(this), false);
      this.cancelBtn.addEventListener('click', this.failHandler.bind(this), false);
    },
    freezeScrolling: function() {
      document.body.style.overflowY = 'hidden';
    },
    allowScrolling: function() {
      document.body.style.overflowY = 'auto';
    }
  }

  /*!
   * Object.assign Polyfill
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
   */
  if (typeof Object.assign != 'function') {
    Object.defineProperty(Object, 'assign', {
      value: function assign(target, varArgs) {
        'use strict';

        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];

          if (nextSource != null) {
            for (var nextKey in nextSource) {
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) to[nextKey] = nextSource[nextKey];
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }

  /*!
   * JavaScript Cookie v2.1.4
   * https://github.com/js-cookie/js-cookie
   *
   * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
   * Released under the MIT license
   */
  ;(function (factory) {
    var registeredInModuleLoader = false;
    if (typeof define === 'function' && define.amd) {
      define(factory);
      registeredInModuleLoader = true;
    }
    if (typeof exports === 'object') {
      module.exports = factory();
      registeredInModuleLoader = true;
    }
    if (!registeredInModuleLoader) {
      var OldCookies = window.Cookies;
      var api = window.Cookies = factory();
      api.noConflict = function () {
        window.Cookies = OldCookies;
        return api;
      };
    }
  }(function () {
    function extend () {
      var i = 0;
      var result = {};
      for (; i < arguments.length; i++) {
        var attributes = arguments[ i ];
        for (var key in attributes) {
          result[key] = attributes[key];
        }
      }
      return result;
    }

    function init (converter) {
      function api (key, value, attributes) {
        var result;
        if (typeof document === 'undefined') {
          return;
        }

        // Write

        if (arguments.length > 1) {
          attributes = extend({
            path: '/'
          }, api.defaults, attributes);

          if (typeof attributes.expires === 'number') {
            var expires = new Date();
            expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
            attributes.expires = expires;
          }

          // We're using "expires" because "max-age" is not supported by IE
          attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

          try {
            result = JSON.stringify(value);
            if (/^[\{\[]/.test(result)) {
              value = result;
            }
          } catch (e) {}

          if (!converter.write) {
            value = encodeURIComponent(String(value))
              .replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
          } else {
            value = converter.write(value, key);
          }

          key = encodeURIComponent(String(key));
          key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
          key = key.replace(/[\(\)]/g, escape);

          var stringifiedAttributes = '';

          for (var attributeName in attributes) {
            if (!attributes[attributeName]) {
              continue;
            }
            stringifiedAttributes += '; ' + attributeName;
            if (attributes[attributeName] === true) {
              continue;
            }
            stringifiedAttributes += '=' + attributes[attributeName];
          }
          return (document.cookie = key + '=' + value + stringifiedAttributes);
        }

        // Read

        if (!key) {
          result = {};
        }

        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all. Also prevents odd result when
        // calling "get()"
        var cookies = document.cookie ? document.cookie.split('; ') : [];
        var rdecode = /(%[0-9A-Z]{2})+/g;
        var i = 0;

        for (; i < cookies.length; i++) {
          var parts = cookies[i].split('=');
          var cookie = parts.slice(1).join('=');

          if (cookie.charAt(0) === '"') {
            cookie = cookie.slice(1, -1);
          }

          try {
            var name = parts[0].replace(rdecode, decodeURIComponent);
            cookie = converter.read ?
              converter.read(cookie, name) : converter(cookie, name) ||
              cookie.replace(rdecode, decodeURIComponent);

            if (this.json) {
              try {
                cookie = JSON.parse(cookie);
              } catch (e) {}
            }

            if (key === name) {
              result = cookie;
              break;
            }

            if (!key) {
              result[name] = cookie;
            }
          } catch (e) {}
        }

        return result;
      }

      api.set = api;
      api.get = function (key) {
        return api.call(api, key);
      };
      api.getJSON = function () {
        return api.apply({
          json: true
        }, [].slice.call(arguments));
      };
      api.defaults = {};

      api.remove = function (key, attributes) {
        api(key, '', extend(attributes, {
          expires: -1
        }));
      };

      api.withConverter = init;

      return api;
    }

    return init(function () {});
  }));
}(window));
