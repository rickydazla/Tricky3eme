// Plugins

// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
log.history = log.history || [];   // store logs to an array for reference
log.history.push(arguments);
arguments.callee = arguments.callee.caller; 
if(this.console) console.log( Array.prototype.slice.call(arguments) );
};

// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info, log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();)b[a]=b[a]||c})(window.console=window.console||{});

// jQuery/helper plugins

/*!
 * HTML5 Placeholder jQuery Plugin v1.8.2
 * @link http://github.com/mathiasbynens/Placeholder-jQuery-Plugin
 * @author Mathias Bynens <http://mathiasbynens.be/>
 */
 
;(function($) {

	var isInputSupported = 'placeholder' in document.createElement('input'),
	    isTextareaSupported = 'placeholder' in document.createElement('textarea');
	if (isInputSupported && isTextareaSupported) {
		$.fn.placeholder = function() {
			return this;
		};
		$.fn.placeholder.input = $.fn.placeholder.textarea = true;
	} else {
		$.fn.placeholder = function() {
			return this.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
				.bind('focus.placeholder', clearPlaceholder)
				.bind('blur.placeholder', setPlaceholder)
			.trigger('blur.placeholder').end();
		};
		$.fn.placeholder.input = isInputSupported;
		$.fn.placeholder.textarea = isTextareaSupported;
	}

	function args(elem) {
		// Return an object of element attributes
		var newAttrs = {},
		    rinlinejQuery = /^jQuery\d+$/;
		$.each(elem.attributes, function(i, attr) {
			if (attr.specified && !rinlinejQuery.test(attr.name)) {
				newAttrs[attr.name] = attr.value;
			}
		});
		return newAttrs;
	}

	function clearPlaceholder() {
		var $input = $(this);
		if ($input.val() === $input.attr('placeholder') && $input.hasClass('placeholder')) {
			if ($input.data('placeholder-password')) {
				$input.hide().next().attr('id', $input.removeAttr('id').data('placeholder-id')).show().focus();
			} else {
				$input.val('').removeClass('placeholder');
			}
		}
	}

	function setPlaceholder(elem) {
		var $replacement,
		    $input = $(this),
		    $origInput = $input,
		    id = this.id;
		if ($input.val() === '') {
			if ($input.is(':password')) {
				if (!$input.data('placeholder-textinput')) {
					try {
						$replacement = $input.clone().attr({ type: 'text' });
					} catch(e) {
						$replacement = $('<input>').attr($.extend(args(this), { type: 'text' }));
					}
					$replacement
						.removeAttr('name')
						// We could just use the `.data(obj)` syntax here, but that wouldn&rsquo;t work in pre-1.4.3 jQueries
						.data('placeholder-password', true)
						.data('placeholder-id', id)
						.bind('focus.placeholder', clearPlaceholder);
					$input
						.data('placeholder-textinput', $replacement)
						.data('placeholder-id', id)
						.before($replacement);
				}
				$input = $input.removeAttr('id').hide().prev().attr('id', id).show();
			}
			$input.addClass('placeholder').val($input.attr('placeholder'));
		} else {
			$input.removeClass('placeholder');
		}
	}

	$(function() {
		// Look for forms
		$('form').bind('submit.placeholder', function() {
			// Clear the placeholder values so they don&rsquo;t get submitted
			var $inputs = $('.placeholder', this).each(clearPlaceholder);
			setTimeout(function() {
				$inputs.each(setPlaceholder);
			}, 10);
		});
	});

	// Clear placeholder values upon page reload
	$(window).bind('unload.placeholder', function() {
		$('.placeholder').val('');
	});

}(jQuery));

// max-height boxes
$.fn.setAllToMaxHeight = function(){
return this.height( Math.max.apply(this, $.map( this , function(e){ return $(e).height() }) ) );
}

/**
 * --------------------------------------------------------------------
 * jQuery accessible tabs plugin
 * Author: Scott Jehl, scott@filamentgroup.com
 * Copyright (c) 2009 Filament Group 
 * licensed under MIT (filamentgroup.com/examples/mit-license.txt)
 * --------------------------------------------------------------------
 */
jQuery.fn.tabs = function(settings){
	//configurable options
	var o = $.extend({
		updateHash: false,
		autoRotate: false,
		alwaysScrollToTop: true
	},settings);
	
	return $(this).each(function(){
		//reference to tabs container
		var tabs = $(this);

		//maybe set ARIA app mode depending on use case
		/*
		if( !$('body').is('[role]') ){ 
			$('body').attr('role','application');
		}
		*/
		
		//nav is first ul
		var tabsNav = tabs.find('ul:first');
		
		//body is nav's next sibling
		var tabsBody = $(tabsNav.find('a:eq(0)').attr('href')).parent();
		
		var tabIDprefix = 'tab-';

		var tabIDsuffix = '-enhanced';
		
		//add class to nav, tab body
		tabsNav
			.addClass('tabs-nav')
			.attr('role','tablist');
			
		tabsBody
			.addClass('tabs-body');
		
		//find tab panels, add class and aria
		tabsBody.find('>div').each(function(){
			$(this)
				.addClass('tabs-panel')
				.attr('role','tabpanel')
				.attr('aria-hidden', true)
				.attr('aria-labelledby', tabIDprefix + $(this).attr('id'))
				.attr('id', $(this).attr('id') + tabIDsuffix);
		});
		
		//set role of each tab
		tabsNav.find('li').each(function(){
			$(this)
				.attr('role','tab')
				.attr('id', tabIDprefix+$(this).find('a').attr('href').split('#')[1]);
		});

		//switch selected on click
		tabsNav.find('a').attr('tabindex','-1');
		
		//generic select tab function
		function selectTab(tab,fromHashChange){	
				//unselect tabs
				tabsNav.find('li.tabs-selected')
					.removeClass('tabs-selected')
					.find('a')
						.attr('tabindex','-1');
				//set selected tab item	
				tab
					.attr('tabindex','0')
					.parent()
						.addClass('tabs-selected')
						.find("a")
						.focus();
				//unselect  panels
				tabsBody.find('div.tabs-panel-selected').attr('aria-hidden',true).removeClass('tabs-panel-selected');
				//select active panel
				$( tab.attr('href') + tabIDsuffix ).addClass('tabs-panel-selected').attr('aria-hidden',false);
				
				//update hash if option is true
				if( o.updateHash ){
					location.hash = tab.attr('href');
				}
		};			

			
		tabsNav.find('a')
			.click(function( e ){
				selectTab($(this));
				e.preventDefault();
			})
			.keydown(function(event){
				var currentTab = $(this).parent();
				var ret = true;
				switch(event.keyCode){
					case 37://left
					case 38://up
						if(currentTab.prev().size() > 0){
							selectTab(currentTab.prev().find('a'));
							currentTab.prev().find('a').eq(0).focus();
							ret = false;
						}
					break;
					case 39: //right
					case 40://down
						if(currentTab.next().size() > 0){
							selectTab(currentTab.next().find('a'));
							currentTab.next().find('a').eq(0).focus();
							ret = false;
						}
					break;
					case 36: //home key
						selectTab(tabsNav.find('li:first a'));
						tabsNav.find('li:first a').eq(0).focus();
						ret = false;
					break;
					case 35://end key
						selectTab(tabsNav.find('li:last a'));
						tabsNav.find('li:last a').eq(0).focus();
						ret = false;
					break;
				}
				return ret;
			});
			
		//if tabs are rotating, stop them upon user events	
		tabs.bind('click keydown focus',function(){
			if(o.autoRotate){
				clearInterval(tabRotator);
			}
		});
		
		//function to select a tab from the url hash
		function selectTabFromHash(hash){
			var currHash = hash || window.location.hash;
			var hashedTab = tabsNav.find('a[href=#'+ currHash.replace('#','') +']');
		    if( hashedTab.size() > 0){
		    	selectTab(hashedTab,true);	
		    }
		    else {
		    	selectTab( tabsNav.find('a:first'),true);
		    }
		    //return true/false
		    return !!hashedTab.size();
		}
		
		
		//set tab from hash at page load, if no tab hash, select first tab
		selectTabFromHash(null,true);
		
		//support hashchange event if available for backbutton, history, etc
		if( o.updateHash ){
			$(window).bind("hashchange", function(){
				var newHash = location.hash;
				selectTabFromHash(newHash,true);
				
			});
		}

		//auto rotate tabs
		if(o.autoRotate){
			var tabRotator = setInterval(function(){
				var currentTabLI = tabsNav.find('li.tabs-selected');
				var nextTab = currentTabLI.next();
				if(nextTab.length){
					selectTab(nextTab.find('a'),false );
				}
				else{
					selectTab( tabsNav.find('a:first'),false );
				}
			}, o.autoRotate);
		}
		
		if(o.alwaysScrollToTop){
			$(window)[0].scrollTo(0,0);
		}
	});
};

/**
 * --------------------------------------------------------------------
 * jQuery customInput plugin
 * Author: Maggie Costello Wachs maggie@filamentgroup.com, Scott Jehl, scott@filamentgroup.com
 * Copyright (c) 2009 Filament Group 
 * licensed under MIT (filamentgroup.com/examples/mit-license.txt)
 * --------------------------------------------------------------------
 */
jQuery.fn.customInput = function(){
	return $(this).each(function(){	
		if($(this).is('[type=checkbox],[type=radio]')){
			var input = $(this);
			
			// get the associated label using the input's id
			var label = $('label[for='+input.attr('id')+']');
			
			// necessary for browsers that don't support the :hover pseudo class on labels
			label.hover(
				function(){ $(this).addClass('hover'); },
				function(){ $(this).removeClass('hover'); }
			);
			
			//bind custom event, trigger it, bind click,focus,blur events					
			input.bind('updateState', function(){	
				input.is(':checked') ? label.addClass('checked') : label.removeClass('checked checkedHover checkedFocus'); 
			})
			.trigger('updateState')
			.click(function(){ 
				$('input[id='+ $(this).attr('id') +']').trigger('updateState'); 
			})
			.focus(function(){ 
				label.addClass('focus'); 
				if(input.is(':checked')){  $(this).addClass('checkedFocus'); } 
			})
			.blur(function(){ label.removeClass('focus checkedFocus'); });
		}
	});
};


/* 
	===========================================================
	
	Note: SlidesJS version 2.0 beta 1 is not meant
	for production deployment. Please download the latest
	version at https://github.com/nathansearles/Slides.
	
	===========================================================
*/ 

/*

	 .d8888b.  888 d8b      888                888888  .d8888b.  
	d88P  Y88b 888 Y8P      888                  "88b d88P  Y88b 
	Y88b.      888          888                   888 Y88b.      
	 "Y888b.   888 888  .d88888  .d88b.  .d8888b  888  "Y888b.   
	    "Y88b. 888 888 d88" 888 d8P  Y8b 88K      888     "Y88b. 
	      "888 888 888 888  888 88888888 "Y8888b. 888       "888 
	Y88b  d88P 888 888 Y88b 888 Y8b.          X88 88P Y88b  d88P 
	 "Y8888P"  888 888  "Y88888  "Y8888   88888P' 888  "Y8888P"  
	                                            .d88P            
	                                          .d88P"             
	                                         888P"               
	
	Created by Nathan Searles <http://nathansearles.com>
	
	Documentation and examples <http://slidesjs.com>
	Support forum <http://groups.google.com/group/slidesjs>
	
	Version: 2.0 beta 1
	Updated: June 22nd, 2011
	
	SlidesJS is an open source project, contribute at GitHub:
	https://github.com/nathansearles/Slides
	
	(c) 2011 by Nathan Searles
	
	Thanks to:
	Thomas Reynolds <http://awardwinningfjords.com/>
	Adam j. Sontag <http://ajpiano.com/>
	
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

/*
	Documentaion
	============================================================
	
	Basic Markup Structure
	============================================================
	
	For just images you can simply use:
	
	<div id="slides">
			<img src="http://slidesjs.com/examples/standard/img/slide-1.jpg" width="570" height="270" alt="Slide 1">
			<img src="http://slidesjs.com/examples/standard/img/slide-2.jpg" width="570" height="270" alt="Slide 2">
			<img src="http://slidesjs.com/examples/standard/img/slide-3.jpg" width="570" height="270" alt="Slide 3">
			<img src="http://slidesjs.com/examples/standard/img/slide-4.jpg" width="570" height="270" alt="Slide 4">
	</div>
	
	Or you can use <div>s for your slides
	
	<div id="slides">
			<div>
				<img src="http://slidesjs.com/examples/standard/img/slide-1.jpg" width="570" height="270" alt="Slide 1">
			</div>
			<div>
				<img src="http://slidesjs.com/examples/standard/img/slide-2.jpg" width="570" height="270" alt="Slide 2">
			</div>
			<div>
				<img src="http://slidesjs.com/examples/standard/img/slide-3.jpg" width="570" height="270" alt="Slide 3">
			</div>
			<div>
				<img src="http://slidesjs.com/examples/standard/img/slide-4.jpg" width="570" height="270" alt="Slide 4">
			</div>
	</div>
	
	Simple as that. No extra <div>s, no navigation or pagination to define, it's all created for you. SlidesJS creates
	two <div>s for the slideshow, ".slidesContainer" and ".slidesControl", both are required and can not be changed.
	
	Navigation classes are ".slidesPrevious" and ".slidesNext" and are created as anchor tags. These cannot be changed.
	
	Pagination uses an unordered list markup structure. The <ul> has a class of ".slidesPagination". This cannot be changed.
	
	You may define your own navigation or pagination, but they must use the same class names,
	sorry it saves from including extraneous code.
	
	Basic CSS
	============================================================

	No CSS required. Shit yeah!
	
	Initialize SlidesJS
	============================================================
	
	<script>
		$(function(){
			$("#slides").slides();
		});
	</script>
	
	Tip: With SidesJS 2 you need to define the width and height if it's different from the default (780px x 300px). This resolves many issues having to do with loading and makes SlidesJS 2 self contained, not requiring any CSS.

	<pre><script>
	 $(function(){
	  $("#slides").slides({
	    width: 640,
	    height: 480
	  });
	 });
	</script></pre>
	
	Method Calls - The good stuff
	============================================================
	
	Play:
		$("#slides").slides("play");

	Pause:
		$("#slides").slides("pause");

	Stop:
		$("#slides").slides("stop");

	Next:
		$("#slides").slides("next");
			- Uses default effect
	
		$("#slides").slides("next","fade");
			- Define effect, "slide" or "fade"

	Previous:
		$("#slides").slides("previous");
			- Uses default effect

		$("#slides").slides("previous","fade");
			- Define effect, "slide" or "fade"
	
	Goto a slide
		$("#slides").slides("slide",2);
			- Goto slide 2 using default effect
			
		$("#slides").slides("slide",4,"fade");
			- Define effect, "slide" or "fade"
	
	Update:
		$("#slides").slides("update");
			- Rebuilds pagination 

	Destroy:
		$("#slides").slides("destroy");
			- Removes SlidesJS, returns to predefined state

	Status:
		$("#slides").slides("status");
			- Returns JSON object:
				{
					current: 4,
					state: "playing",
					total: 7
				}
		
		$("#slides").slides("status","current");
			- Returns current slide number

		$("#slides").slides("status","state");
			- Returns playing, paused, or stopped
		
		$("#slides").slides("status","total");
			- Returns total slides in slideshow
			
		Options
		============================================================
		Check out the notes on the options below
*/

/*
	jQuery UI Widget, skip past this for SlidesJS
*/

/*!
 * jQuery UI Widget @VERSION
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
(function ($, undefined) {
  var slice = Array.prototype.slice;
  var _cleanData = $.cleanData;
  $.cleanData = function (elems) {
    for (var i = 0, elem;
    (elem = elems[i]) != null; i++) {
      $(elem).triggerHandler("remove");
    }
    _cleanData(elems);
  };
  $.widget = function (name, base, prototype) {
    var namespace = name.split(".")[0],
        fullName;
    name = name.split(".")[1];
    fullName = namespace + "-" + name;
    if (!prototype) {
      prototype = base;
      base = $.Widget;
    }
    // create selector for plugin
    $.expr[":"][fullName] = function (elem) {
      return !!$.data(elem, name);
    };
    $[namespace] = $[namespace] || {};
    // create the constructor using $.extend() so we can carry over any
    // static properties stored on the existing constructor (if there is one)
    $[namespace][name] = $.extend(function (options, element) {
      // allow instantiation without "new" keyword
      if (!this._createWidget) {
        return new $[namespace][name](options, element);
      }
      // allow instantiation without initializing for simple inheritance
      // must use "new" keyword (the code above always passes args)
      if (arguments.length) {
        this._createWidget(options, element);
      }
    }, $[namespace][name]);
    var basePrototype = new base();
    // we need to make the options hash a property directly on the new instance
    // otherwise we'll modify the options hash on the prototype that we're
    // inheriting from
    basePrototype.options = $.widget.extend({}, basePrototype.options);
    $.each(prototype, function (prop, value) {
      if ($.isFunction(value)) {
        prototype[prop] = (function () {
          var _super = function (method) {
            return base.prototype[method].apply(this, slice.call(arguments, 1));
          };
          var _superApply = function (method, args) {
            return base.prototype[method].apply(this, args);
          };
          return function () {
            var __super = this._super,
                __superApply = this._superApply,
                returnValue;
            this._super = _super;
            this._superApply = _superApply;
            returnValue = value.apply(this, arguments);
            this._super = __super;
            this._superApply = __superApply;
            return returnValue;
          };
        }());
      }
    });
    $[namespace][name].prototype = $.widget.extend(basePrototype, {
      namespace: namespace,
      widgetName: name,
      widgetEventPrefix: name,
      widgetBaseClass: fullName
    }, prototype);
    $.widget.bridge(name, $[namespace][name]);
  };
  $.widget.extend = function (target) {
    var input = slice.call(arguments, 1),
        inputIndex = 0,
        inputLength = input.length,
        key, value;
    for (; inputIndex < inputLength; inputIndex++) {
      for (key in input[inputIndex]) {
        value = input[inputIndex][key];
        if (input[inputIndex].hasOwnProperty(key) && value !== undefined) {
          target[key] = $.isPlainObject(value) ? $.widget.extend({}, target[key], value) : value;
        }
      }
    }
    return target;
  };
  $.widget.bridge = function (name, object) {
    $.fn[name] = function (options) {
      var isMethodCall = typeof options === "string",
          args = slice.call(arguments, 1),
          returnValue = this;
      // allow multiple hashes to be passed on init
      options = !isMethodCall && args.length ? $.widget.extend.apply(null, [options].concat(args)) : options;
      if (isMethodCall) {
        this.each(function () {
          var instance = $.data(this, name);
          if (!instance) {
            return $.error("cannot call methods on " + name + " prior to initialization; " + "attempted to call method '" + options + "'");
          }
          if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
            return $.error("no such method '" + options + "' for " + name + " widget instance");
          }
          var methodValue = instance[options].apply(instance, args);
          if (methodValue !== instance && methodValue !== undefined) {
            returnValue = methodValue.jquery ? returnValue.pushStack(methodValue.get()) : methodValue;
            return false;
          }
        });
      } else {
        this.each(function () {
          var instance = $.data(this, name);
          if (instance) {
            instance.option(options || {})._init();
          } else {
            object(options, this);
          }
        });
      }
      return returnValue;
    };
  };
  $.Widget = function (options, element) {
    // allow instantiation without "new" keyword
    if (!this._createWidget) {
      return new $[namespace][name](options, element);
    }
    // allow instantiation without initializing for simple inheritance
    // must use "new" keyword (the code above always passes args)
    if (arguments.length) {
      this._createWidget(options, element);
    }
  };
  $.Widget.prototype = {
    widgetName: "widget",
    widgetEventPrefix: "",
    defaultElement: "<div>",
    options: {
      disabled: false,
      // callbacks
      create: null
    },
    _createWidget: function (options, element) {
      element = $(element || this.defaultElement || this)[0];
      this.element = $(element);
      this.options = $.widget.extend({}, this.options, this._getCreateOptions(), options);
      this.bindings = $();
      this.hoverable = $();
      this.focusable = $();
      if (element !== this) {
        $.data(element, this.widgetName, this);
        this._bind({
          remove: "destroy"
        });
      }
      this._create();
      this._trigger("create");
      this._init();
    },
    _getCreateOptions: $.noop,
    _create: $.noop,
    _init: $.noop,
    destroy: function () {
      this._destroy();
      // we can probably remove the unbind calls in version 2
      // all event bindings should go through this._bind()
      this.element.unbind("." + this.widgetName).removeData(this.widgetName);
      this.widget().unbind("." + this.widgetName).removeAttr("aria-disabled").removeClass(
      this.widgetBaseClass + "-disabled " + "ui-state-disabled");
      // clean up events and states
      this.bindings.unbind("." + this.widgetName);
      this.hoverable.removeClass("ui-state-hover");
      this.focusable.removeClass("ui-state-focus");
    },
    _destroy: $.noop,
    widget: function () {
      return this.element;
    },
    option: function (key, value) {
      var options = key,
          parts, curOption, i;
      if (arguments.length === 0) {
        // don't return a reference to the internal hash
        return $.widget.extend({}, this.options);
      }
      if (typeof key === "string") {
        if (value === undefined) {
          return this.options[key];
        }
        // handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
        options = {};
        parts = key.split(".");
        key = parts.shift();
        if (parts.length) {
          curOption = options[key] = $.widget.extend({}, this.options[key]);
          for (i = 0; i < parts.length - 1; i++) {
            curOption[parts[i]] = curOption[parts[i]] || {};
            curOption = curOption[parts[i]];
          }
          curOption[parts.pop()] = value;
        } else {
          options[key] = value;
        }
      }
      this._setOptions(options);
      return this;
    },
    _setOptions: function (options) {
      var self = this;
      $.each(options, function (key, value) {
        self._setOption(key, value);
      });
      return this;
    },
    _setOption: function (key, value) {
      this.options[key] = value;
      if (key === "disabled") {
        this.widget().toggleClass(this.widgetBaseClass + "-disabled ui-state-disabled", !! value).attr("aria-disabled", value);
        this.hoverable.removeClass("ui-state-hover");
        this.focusable.removeClass("ui-state-focus");
      }
      return this;
    },
    enable: function () {
      return this._setOption("disabled", false);
    },
    disable: function () {
      return this._setOption("disabled", true);
    },
    _bind: function (element, handlers) {
      // no element argument, shuffle and use this.element
      if (!handlers) {
        handlers = element;
        element = this.element;
      } else {
        // accept selectors, DOM elements
        element = $(element);
        this.bindings = this.bindings.add(element);
      }
      var instance = this;
      $.each(handlers, function (event, handler) {
        element.bind(event + "." + instance.widgetName, function () {
          // allow widgets to customize the disabled handling
          // - disabled as an array instead of boolean
          // - disabled class as method for disabling individual parts
          if (instance.options.disabled === true || $(this).hasClass("ui-state-disabled")) {
            return;
          }
          return (typeof handler === "string" ? instance[handler] : handler).apply(instance, arguments);
        });
      });
    },
    _hoverable: function (element) {
      this.hoverable = this.hoverable.add(element);
      this._bind(element, {
        mouseenter: function (event) {
          $(event.currentTarget).addClass("ui-state-hover");
        },
        mouseleave: function (event) {
          $(event.currentTarget).removeClass("ui-state-hover");
        }
      });
    },
    _focusable: function (element) {
      this.focusable = this.focusable.add(element);
      this._bind(element, {
        focusin: function (event) {
          $(event.currentTarget).addClass("ui-state-focus");
        },
        focusout: function (event) {
          $(event.currentTarget).removeClass("ui-state-focus");
        }
      });
    },
    _trigger: function (type, event, data) {
      var callback = this.options[type],
          args;
      event = $.Event(event);
      event.type = (type === this.widgetEventPrefix ? type : this.widgetEventPrefix + type).toLowerCase();
      data = data || {};
      // copy original event properties over to the new event
      // this would happen if we could call $.event.fix instead of $.Event
      // but we don't have a way to force an event to be fixed multiple times
      if (event.originalEvent) {
        for (var i = $.event.props.length, prop; i;) {
          prop = $.event.props[--i];
          event[prop] = event.originalEvent[prop];
        }
      }
      this.element.trigger(event, data);
      args = $.isArray(data) ? [event].concat(data) : [event, data];
      return !($.isFunction(callback) && callback.apply(this.element[0], args) === false || event.isDefaultPrevented());
    }
  };
  $.each({
    show: "fadeIn",
    hide: "fadeOut"
  }, function (method, defaultEffect) {
    $.Widget.prototype["_" + method] = function (element, options, callback) {
      options = options || {};
      var hasOptions = !$.isEmptyObject(options),
          effectName = options.effect || defaultEffect;
      options.complete = callback;
      if (options.delay) {
        element.delay(options.delay);
      }
      if (hasOptions && $.effects && ($.effects.effect[effectName] || $.uiBackCompat !== false && $.effects[effectName])) {
        element[method](options);
      } else if (effectName !== method && element[effectName]) {
        element[effectName](options.duration, options.easing, callback);
      } else {
        element.queue(function () {
          $(this)[method]();
          if (callback) {
            callback.call(element[0]);
          }
        });
      }
    };
  });
  // DEPRECATED
  if ($.uiBackCompat !== false) {
    $.Widget.prototype._getCreateOptions = function () {
      return $.metadata && $.metadata.get(this.element[0])[this.widgetName];
    };
  }
})(jQuery);

/*
	SlidesJS, let the good times roll
*/
(function($) {
  $.widget("js.slides", {
		options: {
			width: 780, // [Number] Define the slide width
			responsive: false, // [Boolean] slideshow will scale to its container
			height: 300, // [Number] Define the slide height
			navigation: true, // [Boolean] Auto generate the naviagation, next/previous buttons
			pagination: true, // [Boolean] Auto generate the pagination
			effects: {
				navigation: "slide",  // [String] Can be either "slide" or "fade"
				pagination: "slide" // [String] Can be either "slide" or "fade"
			},
			direction: "left", // [String] Define the slide direction: "Up", "Right", "Down", "left"
			fade: {
				interval: 1000, // [Number] Interval of fade in milliseconds
				crossfade: false, // [Boolean] TODO: add this feature. Crossfade the slides, great for images, bad for text
				easing: "" // [String] Dependency: jQuery Easing plug-in <http://gsgd.co.uk/sandbox/jquery/easing/>
			},
			slide: {
				interval: 1000, // [Number] Interval of fade in milliseconds
				browserWindow: false, // [Boolean] Slide in/out from browser window, bad ass
				easing: "" // [String] Dependency: jQuery Easing plug-in <http://gsgd.co.uk/sandbox/jquery/easing/>
			},
			preload: {
				active: false, // [Boolean] Preload the slides before showing them, this needs some work
				image: "../img/loading.gif" // [String] Define the path to a load .gif, yes I should do something cooler
			},
			startAtSlide: 1, // [Number] What should the first slide be?
			playInterval: 5000, // [Number] Time spent on each slide in milliseconds
			pauseInterval: 8000, // [Number] Time spent on pause, triggered on any navigation or pagination click
			autoHeight: false, // [Boolean] TODO: add this feature. Auto sets height based on each slide
			navigateStart: function( current ){
				// console.log( "navigateStart: ", current );
			},
			navigateEnd: function( current ){
				// console.log( "navigateEnd: ", current );
			},
			loaded: function() {
				// console.log( "loaded" );
			}
		},
    _create: function() {	
			
			// Error correction for only 1 slide
			if (this.element.children().length < 2) {
				return;
			}
			
			if ( this.options.slide.browserWindow ) {
				this.element.css({
					width: window.innerWidth,
					position: "relative",
					left: - (window.innerWidth / 2) + (this.options.width / 2),
					overflow: "hidden"
				});
				
				$(window).resize( $.proxy(function() {
					this.element.css({
						width: window.innerWidth,
						left: - (window.innerWidth / 2) + (this.options.width / 2)
					});

					this.slidesContainer.css({
						left: this.options.slide.browserWindow ?  (window.innerWidth - this.options.width) / 2 : ""
					});
				},this));
			}
		
			this.slidesContainer = this.element.children().not(".slidesNavigation").wrapAll( "<div class='slidesContainer'>" ).parent().css({
				width: this.options.responsive ? "100%" : this.options.width,
				height: this.options.height,
				overflow: this.options.slide.browserWindow ? "visible" : "hidden",
				position: "relative",
				left: this.options.slide.browserWindow ?  (window.innerWidth - this.options.width) / 2 : ""
			});
			
			this.slidesControl = this.slidesContainer.wrapInner( "<div class='slidesControl'>" ).children().css({
				display: "none"
			});
			
			// Define the slides
			this.slides = this.slidesControl.children();
			
			// Set CSS for slidesControl
			this.slidesControl.css({
				position: "relative",
				width: this.options.responsive ? "100%" : this.options.width,
				height: this.options.height,
				left: 0
			});

			// Set CSS for each slide
			this.slides.css({
				position: "absolute",
				top: 0, 
				left: 0,
				zIndex: 0,
				display: "none"
			});

			// Show the starting slide with a fade in
			this.slides.eq( this.options.startAtSlide - 1 ).fadeIn( this.options.fade.interval );
						
			if ( this.options.preload.active ) {
				
/*				TODO: loading image, need to remove on load callback
				
					this.slidesContainer.css({
						backgroundImage: "url(" + this.options.preload.image + ")",
						backgroundPosition: "50% 50%",
						backgroundRepeat: "no-repeat"
					});
*/					
				var preloadImage;
			
				if (this.slides.eq( this.options.startAtSlide - 1 ).is("img")) {
					preloadImage = this.slides.eq( this.options.startAtSlide - 1 ).attr("src");
				} else {
					preloadImage = this.slides.eq( this.options.startAtSlide - 1 ).find("img").attr("src");
				}
			
				this._loadImage( preloadImage ).then( $.proxy(function( url ) {
			  	this.slidesControl.fadeIn( this.options.fade.interval );
					this._trigger( "loaded", this.options.startAtSlide, this );
				},this));
			} else {
				 this.slidesControl.fadeIn( this.options.fade.interval );
			}

			if ( this.options.navigation ) {
				this.prevButton = $("<a>",{
					"class": "slidesPrevious slidesNavigation",
					href: "#",
					title: "Previous",
					text: "Previous"
				}).appendTo( this.element );
				
				this.nextButton = $("<a>",{
					"class": "slidesNext slidesNavigation",
					href: "#",
					title: "Next",
					text: "Next"
				}).appendTo( this.element );
			} else {
				this.nextButton = $(".slidesNext");
				this.prevButton = $(".slidesPrevious");
			}		
			
			if (this.options.pagination) {
				this._buildPagination();
				// add current class to first pagination
				this.pagination.children().eq( this.options.startAtSlide - 1 ).addClass("slidesCurrent");
			}
			
			this.current = this.options.startAtSlide - 1;
			
			this.element.delegate( ".slidesNavigation", "click", $.proxy(this, "_navigate") );
			
			this.total = this.slides.length;
    },
		_loaded: function() {
			if ( this.options.responsive ) {
				
				// TODO: cleanup and condense
				this.slidesContainer.css({
					height: this.slides.height()
				});

				this.slidesControl.css({
					height: this.slides.height()
				});

				$(window).resize( $.proxy(function() {
					this.slidesContainer.css({
						height: this.slides.height()
					});
					this.slidesControl.css({
						height: this.slides.height()
					});
				},this));
			}
		},
    _buildPagination: function() {
			
			if (this.pagination) {
				// Remove the current paginaiton
				this.pagination.remove();
				// Redefine slides with new children
				this.slides = this.slidesControl.children();
			}
			
			this.pagination = $("<ul>",{
				"class": "slidesPagination"
			}).appendTo(this.element);
			
			this.slides.each(
				$.proxy(function(index, element) {
					$("<li><a href='#" + index + "' class='slidesNavigation slidesPaginationItem' data-slidesindex=" + index + "> " + ( index + 1 ) + "</a></li>").appendTo(this.pagination);
				},this)
			);
			
    },
		_loadImage: function(imageSrc) {
			var deferred, preloader;
			var loadImageCache = {};
		  if (typeof loadImageCache[imageSrc] === "undefined") {
		    deferred = $.Deferred();

		    preloader = new Image();
		    preloader.onload  = function() {
					deferred.resolve(this.src);
				};
		    preloader.onerror = function() {
					deferred.reject(this.src);
				};
		    preloader.src = imageSrc;

		    loadImageCache[imageSrc] = deferred;
		  }

		  return loadImageCache[imageSrc];
		},
		next: function( effect ) {
			this._navigate("next", effect);
		},
		previous: function( effect ) {
			this._navigate("previous", effect);
		},
		slide: function( slide, effect ) {			
			this.element.data("goto", (slide - 1));
			this._navigate("pagination", effect);
		},
		_navigate: function( event, effect ) {
			var to, position, direction, next, prev, pagination, $target = $(event.target), currentSlide = this.slides.eq( this.current );
			
			/*
				Slide to error correction
			*/
			if ( this.element.data("goto") < 0 ) {
				// If goto is less then 0
				this.element.data("goto",0);
			} else  if ( this.element.data("goto") > this.total ) {
				// If goto is greater then total slides
				this.element.data("goto",(this.total - 1));
			}
			
			/*
				Check if slides is currently animating
			*/
			if ( this.element.data("animated") || $target.data("slidesindex") === this.current || this.element.data("goto") === this.current ) {
				return false;
			}
			
			/*
				Is this event coming from a click?
			*/
			if (typeof(event) === "object") {
				event.preventDefault();

				// Pause on navigation item click
				if ( this.state === "playing" && this.options.pauseInterval ) {
					this.pause();
				}
			} else {
				if (event === "next") {
					next = true;
				} else {
					prev = true;
				}
			}
		
			/*
				Set to animated
			*/
			this.element.data("animated",true);
			
			if ( $target.hasClass( "slidesNext" ) ) {
				// Next button clicked
				next = true;
				
			} else if ( $target.hasClass("slidesPrevious") ) {
				
				// Previous button clicked
				prev = true;		
				
			}	else if ( $target.hasClass("slidesPaginationItem") ||  event === "pagination") {

				// Paginaiton item clicked
				if ( this.current > $target.data("slidesindex") || this.current > this.element.data("goto") ) {
					prev = true;					
				} else {
					next = true;
				}
				
				pagination = true;
				
				effect = effect ? effect : this.options.effects.pagination;
			}
			
			if (pagination) {
				// Get next from data-slidesindex
				to = this.element.data("goto") > -1 ? this.element.data("goto") : $target.data("slidesindex");
			} else {
				// Get next based on curent
				to = next ? (this.current + 1) : (prev ? this.current - 1 : this.current);
			}

			// Pass slide from number
			this._trigger("navigateStart", ( this.current + 1 ), this);
			
			// creat the loop
			if ( to == this.slides.length && !pagination ) {
				// last slide, loop to first
				to = 0;
			} else if ( to == -1 && !pagination ) {
				// first slide, loop to last
				to = this.slides.length - 1;
			}
			
			if (this.options.pagination) {
				// Change the pagination
				this.pagination.children().removeClass("slidesCurrent");
				this.pagination.children().eq( to ).addClass("slidesCurrent");
			}
			
			// Effects methods
			if (effect === "fade") {
				this._fade({
					next: next,
					to: to,
					currentSlide: currentSlide
				});
			} else {
				this._slide({
					next: next,
					to: to,
					currentSlide: currentSlide
				});
			}
		},
		_slide: function (navigateData) {
			/*
				Thanks to Thomas Reynolds <http://awardwinningfjords.com/>
			*/
			
			var isFlipped = navigateData.next ? 1 : -1;
			var isOpposite = this.options.direction.match(/right|down/) ? -1 : 1;
			var type = this.options.direction.match(/left|right/) ? "horizontal" : "vertical";
			var vector = (type == "horizontal") ? "width" : "height";
			
			vector = this.options.responsive ? this.slides.width() : this.options[vector] ;
			
			var	position = vector * isOpposite * isFlipped;
			
			if (this.options.slide.browserWindow) {
				 if (navigateData.next) {
					position = Math.abs( this.options.width - window.innerWidth - position);
				} else {
					position = this.options.width - window.innerWidth + position;
				}					
			}
			
			var direction = position * -1;
			
			// Setup the "to" slide
			this.slides.eq( navigateData.to ).css({
				left: type === "vertical" ? 0 : position,
				top:  type === "vertical" ? position : 0,
				zIndex: 5,
				display: "block"
			});
			
			// animate control
			this.slidesControl.animate({
				left: type === "vertical" ? 0 : direction,
				top:  type === "vertical" ? direction : 0
			},this.options.slide.interval, this.options.slide.easing, $.proxy(function(){
				// after animation reset control position
				this.slidesControl.css({
					top: 0,
					left:0
				});
				// reset and show next
				this.slides.eq( navigateData.to ).css({
					top: 0,
					left:0,
					zIndex: 5
				});
				
				// reset previous slide
				navigateData.currentSlide.css({
					top: 0,
					left:0,
					display: "none",
					zIndex: 0
				});
				
				this.current = navigateData.to;
				
				this._trigger("navigateEnd", ( this.current + 1 ), this);
			}, this));
		},
		_fade: function (navigateData) {

				// put hidden to slide above current
				this.slides.eq( navigateData.to ).css({
					zIndex: 10
				// fade in next
				}).fadeIn(this.options.fade.interval, this.options.fade.easing, $.proxy(function(){
				
						// hide previous
						navigateData.currentSlide.css({
							display: "none",
							zIndex: 0
						});								
							
						// reset zindex
						this.slides.eq( navigateData.to ).css({
							zIndex: 0
						});					
										
						this.current = navigateData.to;

						this._trigger("navigateEnd", ( this.current + 1 ), this);
					
				}, this));
		},
		play: function( gotoNext ) {
			if (gotoNext !== false) {
				this._navigate("next");
			}
			
			var playInterval = setInterval( $.proxy(function() {
				this._navigate("next");
			}, this), this.options.playInterval);
			
			// Set status
			this.state = "playing";
			
			// Store the unique interval ID
			this.element.data("playIntervalId",playInterval);
		},
		pause: function() {
			clearTimeout( this.element.data("pauseTimeoutId") );
			
			clearInterval( this.element.data("playIntervalId") );

			var pauseTimeout = setTimeout($.proxy(function() {
				this.play();
			 }, this), this.options.pauseInterval);
			
			// Set status
			this.state = "paused";
			
			// Store the unique pause timeout ID
			this.element.data("pauseTimeoutId",pauseTimeout);
		},
		stop: function() {
			clearInterval( this.element.data("playIntervalId") );
			
			// Set status
			this.state = "stopped";
		},
		update: function() {
			this._buildPagination();	
		},
		status: function( key ) {
			if (key) {
				return this[key] ? this[key] : false;
			} else {
				return {
					"state": this.state,
					"current": this.current,
					"total": this.total
				};
			}
			
		},
		_setOption: function(key, value) {
      switch(key) {
				/*
					TODO: This needs work, note status function use of this[key]
					$("#slides").slides("option","pagination", false);
				
        case "pagination":
					if (value !== this.options.pagination ) {
						value ? this._buildPagination() : this.pagination.remove();
					}
          break;
				*/
      }
      $.Widget.prototype._setOption.apply(this,arguments);
    },
    destroy: function() {
			
			this.slidesContainer.contents().unwrap();
			
			this.slidesControl.contents().unwrap();
			
			this.element.unbind();
			
			this.pagination.remove();
			
			this.nextButton.remove();
			
			this.prevButton.remove();
			
			this.slides.attr( "style", "" );
			
      $.Widget.prototype.destroy.call(this);
    },
		_trigger: function( event, current ) {
			if (event != "create") {
				this.options[event]( current );
			}
			if (event === "navigateEnd") {
				this.element.data("animated",false);
			}
			if (event === "loaded") {
				this._loaded();
			}
		}
  });
})(jQuery);