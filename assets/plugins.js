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

/*! http://mths.be/placeholder v1.8.5 by @mathias */
(function(g,a,$){var f='placeholder' in a.createElement('input'),b='placeholder' in a.createElement('textarea');if(f&&b){$.fn.placeholder=function(){return this};$.fn.placeholder.input=$.fn.placeholder.textarea=true}else{$.fn.placeholder=function(){return this.filter((f?'textarea':':input')+'[placeholder]').bind('focus.placeholder',c).bind('blur.placeholder',e).trigger('blur.placeholder').end()};$.fn.placeholder.input=f;$.fn.placeholder.textarea=b;$(function(){$('form').bind('submit.placeholder',function(){var h=$('.placeholder',this).each(c);setTimeout(function(){h.each(e)},10)})});$(g).bind('unload.placeholder',function(){$('.placeholder').val('')})}function d(i){var h={},j=/^jQuery\d+$/;$.each(i.attributes,function(l,k){if(k.specified&&!j.test(k.name)){h[k.name]=k.value}});return h}function c(){var h=$(this);if(h.val()===h.attr('placeholder')&&h.hasClass('placeholder')){if(h.data('placeholder-password')){h.hide().next().show().focus().attr('id',h.removeAttr('id').data('placeholder-id'))}else{h.val('').removeClass('placeholder')}}}function e(){var l,k=$(this),h=k,j=this.id;if(k.val()===''){if(k.is(':password')){if(!k.data('placeholder-textinput')){try{l=k.clone().attr({type:'text'})}catch(i){l=$('<input>').attr($.extend(d(this),{type:'text'}))}l.removeAttr('name').data('placeholder-password',true).data('placeholder-id',j).bind('focus.placeholder',c);k.data('placeholder-textinput',l).data('placeholder-id',j).before(l)}k=k.removeAttr('id').hide().prev().attr('id',j).show()}k.addClass('placeholder').val(k.attr('placeholder'))}else{k.removeClass('placeholder')}}}(this,document,jQuery));

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


/*
 *  Hyphenator 3.3.0 - client side hyphenation for webbrowsers
 *  Copyright (C) 2011  Mathias Nater, Z&uuml;rich (mathias at mnn dot ch)
 *  Project and Source hosted on http://code.google.com/p/hyphenator/
 * 
 *  This JavaScript code is free software: you can redistribute
 *  it and/or modify it under the terms of the GNU Lesser
 *  General Public License (GNU LGPL) as published by the Free Software
 *  Foundation, either version 3 of the License, or (at your option)
 *  any later version.  The code is distributed WITHOUT ANY WARRANTY;
 *  without even the implied warranty of MERCHANTABILITY or FITNESS
 *  FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 *  As additional permission under GNU GPL version 3 section 7, you
 *  may distribute non-source (e.g., minimized or compacted) forms of
 *  that code without the copy of the GNU GPL normally required by
 *  section 4, provided you include this license notice and a URL
 *  through which recipients can access the Corresponding Source.
 */

var Hyphenator=(function(window){var
supportedLang={'be':'be.js','ca':'ca.js','cs':'cs.js','da':'da.js','bn':'bn.js','de':'de.js','el':'el-monoton.js','el-monoton':'el-monoton.js','el-polyton':'el-polyton.js','en':'en-us.js','en-gb':'en-gb.js','en-us':'en-us.js','es':'es.js','fi':'fi.js','fr':'fr.js','grc':'grc.js','gu':'gu.js','hi':'hi.js','hu':'hu.js','hy':'hy.js','it':'it.js','kn':'kn.js','la':'la.js','lt':'lt.js','lv':'lv.js','ml':'ml.js','no':'no-nb.js','no-nb':'no-nb.js','nl':'nl.js','or':'or.js','pa':'pa.js','pl':'pl.js','pt':'pt.js','ru':'ru.js','sl':'sl.js','sv':'sv.js','ta':'ta.js','te':'te.js','tr':'tr.js','uk':'uk.js'},languageHint=(function(){var k,r='';for(k in supportedLang){if(supportedLang.hasOwnProperty(k)){r+=k+', ';}}r=r.substring(0,r.length-2);return r;}()),prompterStrings={'be':'Мова гэтага сайта не можа быць вызначаны аўтаматычна. Калі ласка пакажыце мову:','cs':'Jazyk t&eacute;to internetov&eacute; str&aacute;nky nebyl automaticky rozpozn&aacute;n. Určete pros&iacute;m jej&iacute; jazyk:','da':'Denne websides sprog kunne ikke bestemmes. Angiv venligst sprog:','de':'Die Sprache dieser Webseite konnte nicht automatisch bestimmt werden. Bitte Sprache angeben:','en':'The language of this website could not be determined automatically. Please indicate the main language:','es':'El idioma del sitio no pudo determinarse autom%E1ticamente. Por favor, indique el idioma principal:','fi':'Sivun kielt%E4 ei tunnistettu automaattisesti. M%E4%E4rit%E4 sivun p%E4%E4kieli:','fr':'La langue de ce site n%u2019a pas pu %EAtre d%E9termin%E9e automatiquement. Veuillez indiquer une langue, s.v.p.%A0:','hu':'A weboldal nyelv&eacute;t nem siker&uuml;lt automatikusan meg&aacute;llap&iacute;tani. K&eacute;rem adja meg a nyelvet:','hy':'Չհաջողվեց հայտնաբերել այս կայքի լեզուն։ Խնդրում ենք նշեք հիմնական լեզուն՝','it':'Lingua del sito sconosciuta. Indicare una lingua, per favore:','kn':'ಜಾಲ ತಾಣದ ಭಾಷೆಯನ್ನು ನಿರ್ಧರಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಮುಖ್ಯ ಭಾಷೆಯನ್ನು ಸೂಚಿಸಿ:','lt':'Nepavyko automati&scaron;kai nustatyti &scaron;ios svetainės kalbos. Pra&scaron;ome įvesti kalbą:','lv':'&Scaron;īs lapas valodu nevarēja noteikt automātiski. Lūdzu norādiet pamata valodu:','ml':'ഈ വെ%u0D2C%u0D4D%u200Cസൈറ്റിന്റെ ഭാഷ കണ്ടുപിടിയ്ക്കാ%u0D28%u0D4D%u200D കഴിഞ്ഞില്ല. ഭാഷ ഏതാണെന്നു തിരഞ്ഞെടുക്കുക:','nl':'De taal van deze website kan niet automatisch worden bepaald. Geef de hoofdtaal op:','no':'Nettstedets spr&aring;k kunne ikke finnes automatisk. Vennligst oppgi spr&aring;k:','pt':'A l&iacute;ngua deste site n&atilde;o p&ocirc;de ser determinada automaticamente. Por favor indique a l&iacute;ngua principal:','ru':'Язык этого сайта не может быть определен автоматически. Пожалуйста укажите язык:','sl':'Jezika te spletne strani ni bilo mogoče samodejno določiti. Prosim navedite jezik:','sv':'Spr%E5ket p%E5 den h%E4r webbplatsen kunde inte avg%F6ras automatiskt. V%E4nligen ange:','tr':'Bu web sitesinin dili otomatik olarak tespit edilememiştir. L&uuml;tfen d&ouml;k&uuml;manın dilini se&ccedil;iniz%A0:','uk':'Мова цього веб-сайту не може бути визначена автоматично. Будь ласка, вкажіть головну мову:'},basePath=(function(){var s=document.getElementsByTagName('script'),i=0,p,src,t;while(!!(t=s[i++])){if(!t.src){continue;}src=t.src;p=src.indexOf('Hyphenator.js');if(p!==-1){return src.substring(0,p);}}return'http://hyphenator.googlecode.com/svn/trunk/';}()),isLocal=(function(){var re=false;if(window.location.href.indexOf(basePath)!==-1){re=true;}return re;}()),documentLoaded=false,documentCount=0,persistentConfig=false,contextWindow=window,doFrames=false,dontHyphenate={'script':true,'code':true,'pre':true,'img':true,'br':true,'samp':true,'kbd':true,'var':true,'abbr':true,'acronym':true,'sub':true,'sup':true,'button':true,'option':true,'label':true,'textarea':true,'input':true},enableCache=true,storageType='local',storage,enableReducedPatternSet=false,enableRemoteLoading=true,displayToggleBox=false,hyphenateClass='hyphenate',dontHyphenateClass='donthyphenate',min=6,orphanControl=1,isBookmarklet=(function(){var loc=null,re=false,jsArray=document.getElementsByTagName('script'),i,l;for(i=0,l=jsArray.length;i<l;i++){if(!!jsArray[i].getAttribute('src')){loc=jsArray[i].getAttribute('src');}if(!loc){continue;}else if(loc.indexOf('Hyphenator.js?bm=true')!==-1){re=true;}}return re;}()),mainLanguage=null,defaultLanguage='',elements=[],exceptions={},countObjProps=function(obj){var k,l=0;for(k in obj){if(obj.hasOwnProperty(k)){l++;}}return l;},docLanguages={},state=0,url='(\\w*:\/\/)?((\\w*:)?(\\w*)@)?((([\\d]{1,3}\\.){3}([\\d]{1,3}))|((www\\.|[a-zA-Z]\\.)?[a-zA-Z0-9\\-\\.]+\\.([a-z]{2,4})))(:\\d*)?(\/[\\w#!:\\.?\\+=&%@!\\-]*)*',mail='[\\w-\\.]+@[\\w\\.]+',urlOrMailRE=new RegExp('('+url+')|('+mail+')','i'),zeroWidthSpace=(function(){var zws,ua=navigator.userAgent.toLowerCase();zws=String.fromCharCode(8203);if(ua.indexOf('msie 6')!==-1){zws='';}if(ua.indexOf('opera')!==-1&&ua.indexOf('version/10.00')!==-1){zws='';}return zws;}()),createElem=function(tagname,context){context=context||contextWindow;if(document.createElementNS){return context.document.createElementNS('http://www.w3.org/1999/xhtml',tagname);}else if(document.createElement){return context.document.createElement(tagname);}},onHyphenationDone=function(){},onError=function(e){window.alert("Hyphenator.js says:\n\nAn Error ocurred:\n"+e.message);},selectorFunction=function(){var tmp,el=[],i,l;if(document.getElementsByClassName){el=contextWindow.document.getElementsByClassName(hyphenateClass);}else{tmp=contextWindow.document.getElementsByTagName('*');l=tmp.length;for(i=0;i<l;i++){if(tmp[i].className.indexOf(hyphenateClass)!==-1&&tmp[i].className.indexOf(dontHyphenateClass)===-1){el.push(tmp[i]);}}}return el;},intermediateState='hidden',hyphen=String.fromCharCode(173),urlhyphen=zeroWidthSpace,safeCopy=true,Expando=(function(){var container={},name="HyphenatorExpando_"+Math.random(),uuid=0;return{getDataForElem:function(elem){return container[elem[name].id];},setDataForElem:function(elem,data){var id;if(elem[name]&&elem[name].id!==''){id=elem[name].id;}else{id=uuid++;elem[name]={'id':id};}container[id]=data;},appendDataForElem:function(elem,data){var k;for(k in data){if(data.hasOwnProperty(k)){container[elem[name].id][k]=data[k];}}},delDataOfElem:function(elem){delete container[elem[name]];}};}()),runOnContentLoaded=function(w,f){var DOMContentLoaded=function(){},toplevel,hyphRunForThis={};if(documentLoaded&&!hyphRunForThis[w.location.href]){f();hyphRunForThis[w.location.href]=true;return;}function init(context){contextWindow=context||window;if(!hyphRunForThis[contextWindow.location.href]&&(!documentLoaded||contextWindow!=window.parent)){documentLoaded=true;f();hyphRunForThis[contextWindow.location.href]=true;}}function doScrollCheck(){try{document.documentElement.doScroll("left");}catch(error){setTimeout(doScrollCheck,1);return;}init(window);}function doOnLoad(){var i,haveAccess,fl=window.frames.length;if(doFrames&&fl>0){for(i=0;i<fl;i++){haveAccess=undefined;try{haveAccess=window.frames[i].document.toString();}catch(e){haveAccess=undefined;}if(!!haveAccess){init(window.frames[i]);}}contextWindow=window;f();hyphRunForThis[window.location.href]=true;}else{init(window);}}if(document.addEventListener){DOMContentLoaded=function(){document.removeEventListener("DOMContentLoaded",DOMContentLoaded,false);if(doFrames&&window.frames.length>0){return;}else{init(window);}};}else if(document.attachEvent){DOMContentLoaded=function(){if(document.readyState==="complete"){document.detachEvent("onreadystatechange",DOMContentLoaded);if(doFrames&&window.frames.length>0){return;}else{init(window);}}};}if(document.addEventListener){document.addEventListener("DOMContentLoaded",DOMContentLoaded,false);window.addEventListener("load",doOnLoad,false);}else if(document.attachEvent){document.attachEvent("onreadystatechange",DOMContentLoaded);window.attachEvent("onload",doOnLoad);toplevel=false;try{toplevel=window.frameElement===null;}catch(e){}if(document.documentElement.doScroll&&toplevel){doScrollCheck();}}},getLang=function(el,fallback){if(!!el.getAttribute('lang')){return el.getAttribute('lang').toLowerCase();}try{if(!!el.getAttribute('xml:lang')){return el.getAttribute('xml:lang').toLowerCase();}}catch(ex){}if(el.tagName!=='HTML'){return getLang(el.parentNode,true);}if(fallback){return mainLanguage;}return null;},autoSetMainLanguage=function(w){w=w||contextWindow;var el=w.document.getElementsByTagName('html')[0],m=w.document.getElementsByTagName('meta'),i,text,e,ul;mainLanguage=getLang(el,false);if(!mainLanguage){for(i=0;i<m.length;i++){if(!!m[i].getAttribute('http-equiv')&&(m[i].getAttribute('http-equiv').toLowerCase()==='content-language')){mainLanguage=m[i].getAttribute('content').toLowerCase();}if(!!m[i].getAttribute('name')&&(m[i].getAttribute('name').toLowerCase()==='dc.language')){mainLanguage=m[i].getAttribute('content').toLowerCase();}if(!!m[i].getAttribute('name')&&(m[i].getAttribute('name').toLowerCase()==='language')){mainLanguage=m[i].getAttribute('content').toLowerCase();}}}if(!mainLanguage&&doFrames&&contextWindow!=window.parent){autoSetMainLanguage(window.parent);}if(!mainLanguage&&defaultLanguage!==''){mainLanguage=defaultLanguage;}if(!mainLanguage){text='';ul=navigator.language?navigator.language:navigator.userLanguage;ul=ul.substring(0,2);if(prompterStrings.hasOwnProperty(ul)){text=prompterStrings[ul];}else{text=prompterStrings.en;}text+=' (ISO 639-1)\n\n'+languageHint;mainLanguage=window.prompt(unescape(text),ul).toLowerCase();}if(!supportedLang.hasOwnProperty(mainLanguage)){if(supportedLang.hasOwnProperty(mainLanguage.split('-')[0])){mainLanguage=mainLanguage.split('-')[0];}else{e=new Error('The language "'+mainLanguage+'" is not yet supported.');throw e;}}},gatherDocumentInfos=function(){var elToProcess,tmp,i=0,process=function(el,hide,lang){var n,i=0,hyphenatorSettings={};if(hide&&intermediateState==='hidden'){if(!!el.getAttribute('style')){hyphenatorSettings.hasOwnStyle=true;}else{hyphenatorSettings.hasOwnStyle=false;}hyphenatorSettings.isHidden=true;el.style.visibility='hidden';}if(el.lang&&typeof(el.lang)==='string'){hyphenatorSettings.language=el.lang.toLowerCase();}else if(lang){hyphenatorSettings.language=lang.toLowerCase();}else{hyphenatorSettings.language=getLang(el,true);}lang=hyphenatorSettings.language;if(supportedLang[lang]){docLanguages[lang]=true;}else{if(supportedLang.hasOwnProperty(lang.split('-')[0])){lang=lang.split('-')[0];hyphenatorSettings.language=lang;}else if(!isBookmarklet){onError(new Error('Language '+lang+' is not yet supported.'));}}Expando.setDataForElem(el,hyphenatorSettings);elements.push(el);while(!!(n=el.childNodes[i++])){if(n.nodeType===1&&!dontHyphenate[n.nodeName.toLowerCase()]&&n.className.indexOf(dontHyphenateClass)===-1&&!(n in elToProcess)){process(n,false,lang);}}};if(isBookmarklet){elToProcess=contextWindow.document.getElementsByTagName('body')[0];process(elToProcess,false,mainLanguage);}else{elToProcess=selectorFunction();while(!!(tmp=elToProcess[i++])){process(tmp,true,'');}}if(!Hyphenator.languages.hasOwnProperty(mainLanguage)){docLanguages[mainLanguage]=true;}else if(!Hyphenator.languages[mainLanguage].prepared){docLanguages[mainLanguage]=true;}if(elements.length>0){Expando.appendDataForElem(elements[elements.length-1],{isLast:true});}},convertPatterns=function(lang){var plen,anfang,ende,pats,pat,key,tmp={};pats=Hyphenator.languages[lang].patterns;for(plen in pats){if(pats.hasOwnProperty(plen)){plen=parseInt(plen,10);anfang=0;ende=plen;while(!!(pat=pats[plen].substring(anfang,ende))){key=pat.replace(/\d/g,'');tmp[key]=pat;anfang=ende;ende+=plen;}}}Hyphenator.languages[lang].patterns=tmp;Hyphenator.languages[lang].patternsConverted=true;},convertExceptionsToObject=function(exc){var w=exc.split(', '),r={},i,l,key;for(i=0,l=w.length;i<l;i++){key=w[i].replace(/-/g,'');if(!r.hasOwnProperty(key)){r[key]=w[i];}}return r;},loadPatterns=function(lang){var url,xhr,head,script;if(supportedLang[lang]&&!Hyphenator.languages[lang]){url=basePath+'patterns/'+supportedLang[lang];}else{return;}if(isLocal&&!isBookmarklet){xhr=null;if(typeof XMLHttpRequest!=='undefined'){xhr=new XMLHttpRequest();}if(!xhr){try{xhr=new ActiveXObject("Msxml2.XMLHTTP");}catch(e){xhr=null;}}if(xhr){xhr.open('HEAD',url,false);xhr.setRequestHeader('Cache-Control','no-cache');xhr.send(null);if(xhr.status===404){onError(new Error('Could not load\n'+url));delete docLanguages[lang];return;}}}if(createElem){head=window.document.getElementsByTagName('head').item(0);script=createElem('script',window);script.src=url;script.type='text/javascript';head.appendChild(script);}},prepareLanguagesObj=function(lang){var lo=Hyphenator.languages[lang],wrd;if(!lo.prepared){if(enableCache){lo.cache={};lo['cache']=lo.cache;}if(enableReducedPatternSet){lo.redPatSet={};}if(lo.hasOwnProperty('exceptions')){Hyphenator.addExceptions(lang,lo.exceptions);delete lo.exceptions;}if(exceptions.hasOwnProperty('global')){if(exceptions.hasOwnProperty(lang)){exceptions[lang]+=', '+exceptions.global;}else{exceptions[lang]=exceptions.global;}}if(exceptions.hasOwnProperty(lang)){lo.exceptions=convertExceptionsToObject(exceptions[lang]);delete exceptions[lang];}else{lo.exceptions={};}convertPatterns(lang);wrd='[\\w'+lo.specialChars+'@'+String.fromCharCode(173)+String.fromCharCode(8204)+'-]{'+min+',}';lo.genRegExp=new RegExp('('+url+')|('+mail+')|('+wrd+')','gi');lo.prepared=true;}if(!!storage){try{storage.setItem('Hyphenator_'+lang,window.JSON.stringify(lo));}catch(e){}}},prepare=function(callback){var lang,interval,tmp1,tmp2;if(!enableRemoteLoading){for(lang in Hyphenator.languages){if(Hyphenator.languages.hasOwnProperty(lang)){prepareLanguagesObj(lang);}}state=2;callback();return;}state=1;for(lang in docLanguages){if(docLanguages.hasOwnProperty(lang)){if(!!storage&&storage.getItem('Hyphenator_'+lang)){Hyphenator.languages[lang]=window.JSON.parse(storage.getItem('Hyphenator_'+lang));if(exceptions.hasOwnProperty('global')){tmp1=convertExceptionsToObject(exceptions.global);for(tmp2 in tmp1){if(tmp1.hasOwnProperty(tmp2)){Hyphenator.languages[lang].exceptions[tmp2]=tmp1[tmp2];}}}if(exceptions.hasOwnProperty(lang)){tmp1=convertExceptionsToObject(exceptions[lang]);for(tmp2 in tmp1){if(tmp1.hasOwnProperty(tmp2)){Hyphenator.languages[lang].exceptions[tmp2]=tmp1[tmp2];}}delete exceptions[lang];}tmp1='[\\w'+Hyphenator.languages[lang].specialChars+'@'+String.fromCharCode(173)+String.fromCharCode(8204)+'-]{'+min+',}';Hyphenator.languages[lang].genRegExp=new RegExp('('+url+')|('+mail+')|('+tmp1+')','gi');delete docLanguages[lang];continue;}else{loadPatterns(lang);}}}if(countObjProps(docLanguages)===0){state=2;callback();return;}interval=window.setInterval(function(){var finishedLoading=true,lang;for(lang in docLanguages){if(docLanguages.hasOwnProperty(lang)){finishedLoading=false;if(!!Hyphenator.languages[lang]){delete docLanguages[lang];prepareLanguagesObj(lang);}}}if(finishedLoading){window.clearInterval(interval);state=2;callback();}},100);},toggleBox=function(){var myBox,bdy,myIdAttribute,myTextNode,myClassAttribute,text=(Hyphenator.doHyphenation?'Hy-phen-a-tion':'Hyphenation');if(!!(myBox=contextWindow.document.getElementById('HyphenatorToggleBox'))){myBox.firstChild.data=text;}else{bdy=contextWindow.document.getElementsByTagName('body')[0];myBox=createElem('div',contextWindow);myIdAttribute=contextWindow.document.createAttribute('id');myIdAttribute.nodeValue='HyphenatorToggleBox';myClassAttribute=contextWindow.document.createAttribute('class');myClassAttribute.nodeValue=dontHyphenateClass;myTextNode=contextWindow.document.createTextNode(text);myBox.appendChild(myTextNode);myBox.setAttributeNode(myIdAttribute);myBox.setAttributeNode(myClassAttribute);myBox.onclick=Hyphenator.toggleHyphenation;myBox.style.position='absolute';myBox.style.top='0px';myBox.style.right='0px';myBox.style.margin='0';myBox.style.backgroundColor='#AAAAAA';myBox.style.color='#FFFFFF';myBox.style.font='6pt Arial';myBox.style.letterSpacing='0.2em';myBox.style.padding='3px';myBox.style.cursor='pointer';myBox.style.WebkitBorderBottomLeftRadius='4px';myBox.style.MozBorderRadiusBottomleft='4px';bdy.appendChild(myBox);}},hyphenateWord=function(lang,word){var lo=Hyphenator.languages[lang],parts,i,l,w,wl,s,hypos,p,maxwins,win,pat=false,patk,c,t,n,numb3rs,inserted,hyphenatedword,val,subst,ZWNJpos=[];if(word===''){return'';}if(word.indexOf(hyphen)!==-1){return word;}if(enableCache&&lo.cache.hasOwnProperty(word)){return lo.cache[word];}if(lo.exceptions.hasOwnProperty(word)){return lo.exceptions[word].replace(/-/g,hyphen);}if(word.indexOf('-')!==-1){parts=word.split('-');for(i=0,l=parts.length;i<l;i++){parts[i]=hyphenateWord(lang,parts[i]);}return parts.join('-');}w='_'+word+'_';if(word.indexOf(String.fromCharCode(8204))!==-1){parts=w.split(String.fromCharCode(8204));w=parts.join('');for(i=0,l=parts.length;i<l;i++){parts[i]=parts[i].length.toString();}parts.pop();ZWNJpos=parts;}wl=w.length;s=w.split('');if(!!lo.charSubstitution){for(subst in lo.charSubstitution){if(lo.charSubstitution.hasOwnProperty(subst)){w=w.replace(new RegExp(subst,'g'),lo.charSubstitution[subst]);}}}if(word.indexOf("'")!==-1){w=w.toLowerCase().replace("'","&rsquo;");}else{w=w.toLowerCase();}hypos=[];numb3rs={'0':0,'1':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9};n=wl-lo.shortestPattern;for(p=0;p<=n;p++){maxwins=Math.min((wl-p),lo.longestPattern);for(win=lo.shortestPattern;win<=maxwins;win++){if(lo.patterns.hasOwnProperty(patk=w.substring(p,p+win))){pat=lo.patterns[patk];if(enableReducedPatternSet&&(typeof pat==='string')){lo.redPatSet[patk]=pat;}if(typeof pat==='string'){t=0;val=[];for(i=0;i<pat.length;i++){if(!!(c=numb3rs[pat.charAt(i)])){val.push(i-t,c);t++;}}pat=lo.patterns[patk]=val;}}else{continue;}for(i=0;i<pat.length;i++){c=p-1+pat[i];if(!hypos[c]||hypos[c]<pat[i+1]){hypos[c]=pat[i+1];}i++;}}}inserted=0;for(i=lo.leftmin;i<=(wl-2-lo.rightmin);i++){if(ZWNJpos.length>0&&ZWNJpos[0]===i){ZWNJpos.shift();s.splice(i+inserted-1,0,String.fromCharCode(8204));inserted++;}if(!!(hypos[i]&1)){s.splice(i+inserted+1,0,hyphen);inserted++;}}hyphenatedword=s.slice(1,-1).join('');if(enableCache){lo.cache[word]=hyphenatedword;}return hyphenatedword;},hyphenateURL=function(url){return url.replace(/([:\/\.\?#&_,;!@]+)/gi,'$&'+urlhyphen);},removeHyphenationFromElement=function(el){var h,i=0,n;switch(hyphen){case'|':h='\\|';break;case'+':h='\\+';break;case'*':h='\\*';break;default:h=hyphen;}while(!!(n=el.childNodes[i++])){if(n.nodeType===3){n.data=n.data.replace(new RegExp(h,'g'),'');n.data=n.data.replace(new RegExp(zeroWidthSpace,'g'),'');}else if(n.nodeType===1){removeHyphenationFromElement(n);}}},registerOnCopy=function(el){var body=el.ownerDocument.getElementsByTagName('body')[0],shadow,selection,range,rangeShadow,restore,oncopyHandler=function(e){e=e||window.event;var target=e.target||e.srcElement,currDoc=target.ownerDocument,body=currDoc.getElementsByTagName('body')[0],targetWindow='defaultView'in currDoc?currDoc.defaultView:currDoc.parentWindow;if(target.tagName&&dontHyphenate[target.tagName.toLowerCase()]){return;}shadow=currDoc.createElement('div');shadow.style.overflow='hidden';shadow.style.position='absolute';shadow.style.top='-5000px';shadow.style.height='1px';body.appendChild(shadow);if(!!window.getSelection){selection=targetWindow.getSelection();range=selection.getRangeAt(0);shadow.appendChild(range.cloneContents());removeHyphenationFromElement(shadow);selection.selectAllChildren(shadow);restore=function(){shadow.parentNode.removeChild(shadow);selection.addRange(range);};}else{selection=targetWindow.document.selection;range=selection.createRange();shadow.innerHTML=range.htmlText;removeHyphenationFromElement(shadow);rangeShadow=body.createTextRange();rangeShadow.moveToElementText(shadow);rangeShadow.select();restore=function(){shadow.parentNode.removeChild(shadow);if(range.text!==""){range.select();}};}window.setTimeout(restore,0);};if(!body){return;}el=el||body;if(window.addEventListener){el.addEventListener("copy",oncopyHandler,false);}else{el.attachEvent("oncopy",oncopyHandler);}},hyphenateElement=function(el){var hyphenatorSettings=Expando.getDataForElem(el),lang=hyphenatorSettings.language,hyphenate,n,i,controlOrphans=function(part){var h,r;switch(hyphen){case'|':h='\\|';break;case'+':h='\\+';break;case'*':h='\\*';break;default:h=hyphen;}if(orphanControl>=2){r=part.split(' ');r[1]=r[1].replace(new RegExp(h,'g'),'');r[1]=r[1].replace(new RegExp(zeroWidthSpace,'g'),'');r=r.join(' ');}if(orphanControl===3){r=r.replace(/[ ]+/g,String.fromCharCode(160));}return r;};if(Hyphenator.languages.hasOwnProperty(lang)){hyphenate=function(word){if(!Hyphenator.doHyphenation){return word;}else if(urlOrMailRE.test(word)){return hyphenateURL(word);}else{return hyphenateWord(lang,word);}};if(safeCopy&&(el.tagName.toLowerCase()!=='body')){registerOnCopy(el);}i=0;while(!!(n=el.childNodes[i++])){if(n.nodeType===3&&n.data.length>=min){n.data=n.data.replace(Hyphenator.languages[lang].genRegExp,hyphenate);if(orphanControl!==1){n.data=n.data.replace(/[\S]+ [\S]+$/,controlOrphans);}}}}if(hyphenatorSettings.isHidden&&intermediateState==='hidden'){el.style.visibility='visible';if(!hyphenatorSettings.hasOwnStyle){el.setAttribute('style','');el.removeAttribute('style');}else{if(el.style.removeProperty){el.style.removeProperty('visibility');}else if(el.style.removeAttribute){el.style.removeAttribute('visibility');}}}if(hyphenatorSettings.isLast){state=3;documentCount--;if(documentCount>(-1000)&&documentCount<=0){documentCount=(-2000);onHyphenationDone();}}},hyphenateDocument=function(){function bind(fun,arg){return function(){return fun(arg);};}var i=0,el;while(!!(el=elements[i++])){if(el.ownerDocument.location.href===contextWindow.location.href){window.setTimeout(bind(hyphenateElement,el),0);}}},removeHyphenationFromDocument=function(){var i=0,el;while(!!(el=elements[i++])){removeHyphenationFromElement(el);}state=4;},createStorage=function(){try{if(storageType!=='none'&&typeof(window.localStorage)!=='undefined'&&typeof(window.sessionStorage)!=='undefined'&&typeof(window.JSON.stringify)!=='undefined'&&typeof(window.JSON.parse)!=='undefined'){switch(storageType){case'session':storage=window.sessionStorage;break;case'local':storage=window.localStorage;break;default:storage=undefined;break;}}}catch(f){}},storeConfiguration=function(){if(!storage){return;}var settings={'STORED':true,'classname':hyphenateClass,'donthyphenateclassname':dontHyphenateClass,'minwordlength':min,'hyphenchar':hyphen,'urlhyphenchar':urlhyphen,'togglebox':toggleBox,'displaytogglebox':displayToggleBox,'remoteloading':enableRemoteLoading,'enablecache':enableCache,'onhyphenationdonecallback':onHyphenationDone,'onerrorhandler':onError,'intermediatestate':intermediateState,'selectorfunction':selectorFunction,'safecopy':safeCopy,'doframes':doFrames,'storagetype':storageType,'orphancontrol':orphanControl,'dohyphenation':Hyphenator.doHyphenation,'persistentconfig':persistentConfig,'defaultlanguage':defaultLanguage};storage.setItem('Hyphenator_config',window.JSON.stringify(settings));},restoreConfiguration=function(){var settings;if(storage.getItem('Hyphenator_config')){settings=window.JSON.parse(storage.getItem('Hyphenator_config'));Hyphenator.config(settings);}};return{version:'3.3.0',doHyphenation:true,languages:{},config:function(obj){var assert=function(name,type){if(typeof obj[name]===type){return true;}else{onError(new Error('Config onError: '+name+' must be of type '+type));return false;}},key;if(obj.hasOwnProperty('storagetype')){if(assert('storagetype','string')){storageType=obj.storagetype;}if(!storage){createStorage();}}if(!obj.hasOwnProperty('STORED')&&storage&&obj.hasOwnProperty('persistentconfig')&&obj.persistentconfig===true){restoreConfiguration();}for(key in obj){if(obj.hasOwnProperty(key)){switch(key){case'STORED':break;case'classname':if(assert('classname','string')){hyphenateClass=obj[key];}break;case'donthyphenateclassname':if(assert('donthyphenateclassname','string')){dontHyphenateClass=obj[key];}break;case'minwordlength':if(assert('minwordlength','number')){min=obj[key];}break;case'hyphenchar':if(assert('hyphenchar','string')){if(obj.hyphenchar==='&shy;'){obj.hyphenchar=String.fromCharCode(173);}hyphen=obj[key];}break;case'urlhyphenchar':if(obj.hasOwnProperty('urlhyphenchar')){if(assert('urlhyphenchar','string')){urlhyphen=obj[key];}}break;case'togglebox':if(assert('togglebox','function')){toggleBox=obj[key];}break;case'displaytogglebox':if(assert('displaytogglebox','boolean')){displayToggleBox=obj[key];}break;case'remoteloading':if(assert('remoteloading','boolean')){enableRemoteLoading=obj[key];}break;case'enablecache':if(assert('enablecache','boolean')){enableCache=obj[key];}break;case'enablereducedpatternset':if(assert('enablereducedpatternset','boolean')){enableReducedPatternSet=obj[key];}break;case'onhyphenationdonecallback':if(assert('onhyphenationdonecallback','function')){onHyphenationDone=obj[key];}break;case'onerrorhandler':if(assert('onerrorhandler','function')){onError=obj[key];}break;case'intermediatestate':if(assert('intermediatestate','string')){intermediateState=obj[key];}break;case'selectorfunction':if(assert('selectorfunction','function')){selectorFunction=obj[key];}break;case'safecopy':if(assert('safecopy','boolean')){safeCopy=obj[key];}break;case'doframes':if(assert('doframes','boolean')){doFrames=obj[key];}break;case'storagetype':if(assert('storagetype','string')){storageType=obj[key];}break;case'orphancontrol':if(assert('orphancontrol','number')){orphanControl=obj[key];}break;case'dohyphenation':if(assert('dohyphenation','boolean')){Hyphenator.doHyphenation=obj[key];}break;case'persistentconfig':if(assert('persistentconfig','boolean')){persistentConfig=obj[key];}break;case'defaultlanguage':if(assert('defaultlanguage','string')){defaultLanguage=obj[key];}break;default:onError(new Error('Hyphenator.config: property '+key+' not known.'));}}}if(storage&&persistentConfig){storeConfiguration();}},run:function(){documentCount=0;var process=function(){try{if(contextWindow.document.getElementsByTagName('frameset').length>0){return;}documentCount++;autoSetMainLanguage(undefined);gatherDocumentInfos();prepare(hyphenateDocument);if(displayToggleBox){toggleBox();}}catch(e){onError(e);}},i,haveAccess,fl=window.frames.length;if(!storage){createStorage();}if(!documentLoaded&&!isBookmarklet){runOnContentLoaded(window,process);}if(isBookmarklet||documentLoaded){if(doFrames&&fl>0){for(i=0;i<fl;i++){haveAccess=undefined;try{haveAccess=window.frames[i].document.toString();}catch(e){haveAccess=undefined;}if(!!haveAccess){contextWindow=window.frames[i];process();}}}contextWindow=window;process();}},addExceptions:function(lang,words){if(lang===''){lang='global';}if(exceptions.hasOwnProperty(lang)){exceptions[lang]+=", "+words;}else{exceptions[lang]=words;}},hyphenate:function(target,lang){var hyphenate,n,i;if(Hyphenator.languages.hasOwnProperty(lang)){if(!Hyphenator.languages[lang].prepared){prepareLanguagesObj(lang);}hyphenate=function(word){if(urlOrMailRE.test(word)){return hyphenateURL(word);}else{return hyphenateWord(lang,word);}};if(typeof target==='string'||target.constructor===String){return target.replace(Hyphenator.languages[lang].genRegExp,hyphenate);}else if(typeof target==='object'){i=0;while(!!(n=target.childNodes[i++])){if(n.nodeType===3&&n.data.length>=min){n.data=n.data.replace(Hyphenator.languages[lang].genRegExp,hyphenate);}else if(n.nodeType===1){if(n.lang!==''){Hyphenator.hyphenate(n,n.lang);}else{Hyphenator.hyphenate(n,lang);}}}}}else{onError(new Error('Language "'+lang+'" is not loaded.'));}},getRedPatternSet:function(lang){return Hyphenator.languages[lang].redPatSet;},isBookmarklet:function(){return isBookmarklet;},getConfigFromURI:function(){var loc=null,re={},jsArray=document.getElementsByTagName('script'),i,j,l,s,gp,option;for(i=0,l=jsArray.length;i<l;i++){if(!!jsArray[i].getAttribute('src')){loc=jsArray[i].getAttribute('src');}if(!loc){continue;}else{s=loc.indexOf('Hyphenator.js?');if(s===-1){continue;}gp=loc.substring(s+14).split('&');for(j=0;j<gp.length;j++){option=gp[j].split('=');if(option[0]==='bm'){continue;}if(option[1]==='true'){re[option[0]]=true;continue;}if(option[1]==='false'){re[option[0]]=false;continue;}if(isFinite(option[1])){re[option[0]]=parseInt(option[1],10);continue;}if(option[0]==='onhyphenationdonecallback'){re[option[0]]=new Function('',option[1]);continue;}re[option[0]]=option[1];}break;}}return re;},toggleHyphenation:function(){if(Hyphenator.doHyphenation){removeHyphenationFromDocument();Hyphenator.doHyphenation=false;storeConfiguration();toggleBox();}else{hyphenateDocument();Hyphenator.doHyphenation=true;storeConfiguration();toggleBox();}}};}(window));Hyphenator['languages']=Hyphenator.languages;Hyphenator['config']=Hyphenator.config;Hyphenator['run']=Hyphenator.run;Hyphenator['addExceptions']=Hyphenator.addExceptions;Hyphenator['hyphenate']=Hyphenator.hyphenate;Hyphenator['getRedPatternSet']=Hyphenator.getRedPatternSet;Hyphenator['isBookmarklet']=Hyphenator.isBookmarklet;Hyphenator['getConfigFromURI']=Hyphenator.getConfigFromURI;Hyphenator['toggleHyphenation']=Hyphenator.toggleHyphenation;window['Hyphenator']=Hyphenator;if(Hyphenator.isBookmarklet()){Hyphenator.config({displaytogglebox:true,intermediatestate:'visible',doframes:true});Hyphenator.config(Hyphenator.getConfigFromURI());Hyphenator.run();}Hyphenator.languages['en-us']=Hyphenator.languages['en']={leftmin:2,rightmin:3,shortestPattern:2,longestPattern:9,specialChars:"",patterns:{3:"x1qei2e1je1f1to2tlou2w3c1tue1q4tvtw41tyo1q4tz4tcd2yd1wd1v1du1ta4eu1pas4y1droo2d1psw24sv1dod1m1fad1j1su4fdo2n4fh1fi4fm4fn1fopd42ft3fu1fy1ga2sss1ru5jd5cd1bg3bgd44uk2ok1cyo5jgl2g1m4pf4pg1gog3p1gr1soc1qgs2oi2g3w1gysk21coc5nh1bck1h1fh1h4hk1zo1ci4zms2hh1w2ch5zl2idc3c2us2igi3hi3j4ik1cab1vsa22btr1w4bp2io2ipu3u4irbk4b1j1va2ze2bf4oar1p4nz4zbi1u2iv4iy5ja1jeza1y1wk1bk3fkh4k1ikk4k1lk1mk5tk1w2ldr1mn1t2lfr1lr3j4ljl1l2lm2lp4ltn1rrh4v4yn1q1ly1maw1brg2r1fwi24ao2mhw4kr1cw5p4mkm1m1mo4wtwy4x1ar1ba2nn5mx1ex1h4mtx3i1muqu2p3wx3o4mwa1jx3p1naai2x1ua2fxx4y1ba2dn1jy1cn3fpr2y1dy1i",4:"4dryn2itni4on1inn1im_up3nik4ni4dy5giye4tyes4_ye44ab_nhe4nha4abe2n2gyn1guy1ery5eep2pe4abry3lay3lone4wne4v1nesy3chn1erne2q3neo1nenp2seps4hy2cey5lu2nedne2cyme44nk2y5at2adine2b2ne_y5ac2p1tp2ten1den1cun1cryn5dp2th4adup4twpub3ae4rxu3ayn5gaff4pue4n2au4p1ppuf4n2atag1ipu4mag1na2gon4asx3tix1t2pu2na4gya3haa3heah4la3ho_ti2a5ian2an5puspu2tnak4_th2n1kl_te4_ta4mu4u4mupmun23mum2alex4ob_sy25ynxal1i_st4y1o4xi5cxi5a4alm_si2_sh2m5sixhu4m4sh4m3r4amam2py2rabm2pixhi2yo5dr2ai4m1pmo2vmos2x2edmo2r4n1la2mor2asx3c2xas5yom4x4apxam3nme44mokrbi2nne44andy4osp4ot3noemn4omn4a4m1n4nog4m1l2angws4l1posw3shwri4wra4yp3iwom11wo2m2izrb4ow4nopo4pr2cem2isrd2iano4mig4y3pomi3awiz55mi_no4n4m1fme4v2re_wir42mes1menme2mme2gre1o2med4me_4nop4m5c4m1bwil21noureu2whi4w3ev4maprev2w1era2plpo4crfu4r4fyy5pu2maha3pu2mab2a2rn1p4npi44lyb4lya2p3nwam42l1w1lut4luplu3or1glluf4lu5a2wacltu2y3rol1tr4vv4r3guyr4rl1te4rh_nru4ar1il2sel4sc4l1rl5prl4plys4c4lovri3ar4ib4lof3lo_ar2par3q_os3ll4oll2i4as_ri1o3vokl2levoi44p1mlka35vo_ns4cas4ll1izr4iqr2is3vivl1it3lika2tan2sen2slrle42l3hlgo3l5gal5frns3mvi4p3ley_od2r2meles24athr4myle2al3drv1inldi4l2de2vilnt2il3civik4lce42l1b4lavv3ifrno4r3nua1trr2ocnt4sy4sok4syks4la2tuk4sck3ouko5ryss4a2tyau4b4klyys1tnu1akis4au3rki4pro4ek4ima2va5ki_nu4dn4umn3uokes4k1erav1irok2ke4g1keek2ed_me2aw3ikal4aws4k5agk3ab3ka_aye4ays4veg3jo4p5ba_4vedjew3n1v24ve_ja4pzar23vatizi4n1w41batba4z2b1bb2beix4o4i5w4b1d4be_rox5nym4nyp4n3za4ittr3por1r4i1ti1bel2ith2itei2su4rs2r1sars4cr2seis1p3betvag4i2sor1shbe3wr1sioad34b3hbi2bbi4d3bie3isf4ise2is_1bilr1sp5va_r5sw_le2uz4eir1ibi2tuxu3r1tiu1v2i1raze4nze4pb2l2uu4mo1biip3iz1eripe4b4louts44b1m4b3no3br3bodi4osbo4eru3aio4mi1ol4io_3booo1ce4inyin1u2insru2n2inn4inl4inkrv4e2inioch42iner3vo4indpi2np4idbt4lb4tob3trry4cry3t2in_o4elbu4ni2muim1i5saiil3v4ilnil1iil5fs1apo3er4b5w5by_bys4_in1sau4i1lazet4u2suo3ev2z1ii2go4igius1p5saw4s5bo2fi4ifti3fl4if_i3etsch2usc22ie4i2dui4dri2diid5dpi3au3ruz4ils1cuz4is4s5d4se_se4a2ce_2ici4ich3ceii1bri5bo1ceni1blse2g5seiibe43cepi2aniam4ur2li2al2i1acet4hy2scew41phy4ch_5phuhu4thu4gche2h4tyh4shur1durc44hr44h5p5sev5sexu1ra4s3fup3p2s3gph3t2sh_ho4g2h1n_he23ciau3pl4h1mci5ch2lozo4m4ciihi2vhi4p2cim2cin4phsu1peu1ouo1geu5osheu4sho4he4th1es4shwun5zun5ysi1bunu45cizo4glck3ihep5he2nh4ed1sioph2l5hazsi2rcly4zte4_ge21siscoe22cog5siu1siv5siz_ga24skes1l2s2leha4m2s1ms3ma1ogyo1h2u1ni3gus3gun2guegu4acov1gth3_eu3g4ros1n4_es3u2nez4zyum2pu1mi3som_ev2oig4cri2gov15goos4opgon2ul5v5goeu3lugob53go_2c1t4ph_g1nog1nic2te4sov4ulsgn4ag4myc4twcud5c4ufc4uipe2t3glo1gleul2igla4_eg23giz3cun5givgi4u3gir5gio1cusul4e2spagil4g1ic5gi__eb4cze41d2a5da_u1laggo44daf2dagg2gege4v1geo1gen2ged3dato1la2ge_ol2dol2i5daypek4p4eed1d42de_4gazol2tuiv3ol2vo2lys1sa2gamgaf4o2meui4n2ui2pe2cd4em4fugi4jku3fl3ufaf2tyf4to1denu4du4pe_2f3sfri2de1ps1si4f5pfos5d3eqs4sls4snfo2rss2tdes25fon4p1b_ci23payss5w2st_de1tf4l2de1v2fin4dey4d1fd4gast2idg1id2gyd1h25di_ud5dfi3au4cy_ch4pav43didu3cud1iff2fyu3crd1inst4r4f1ffev4fer11dio2fedfe4bdir2s2ty4fe_dis1on1au3ca4f5bon1c2ondd5k25far4fagpa1peys45eyc1exps4ul2dlyp4ale3whon3s3do_e1wa5doee5vud4oge1visu2msu2nub4euav4su2rp4ai6rk_d4or3dosu1atdo4v3doxp4adoo4k4swoo2padre4eus4e3upe5un2ophet5z4syc3syl4y3hoy1ads4pd4swd4syd2tho4wo3ta_du2c4etn2tabta2luac4es4wdu4g2ess4uabdu4n4duptav4st5bow1io1pr5dyn2tawe1sp2t1bop1uead1tz4et4chopy5ea4l4t1d4te_2tyle1si4esh1tee4tyat1cr4twoteg4es2c4eru1teoer1s2eroea2tte4po1rat1wh3tusea2v3teu3texer1i2e1ber1h4tey2t1f4t1ge3br2th_th2e4thle1ce3tumec2i2ths2erb1tia4tueer1aou5vtud2tif22tige1potu1aou4lttu41timt5toos4le1cre2pat4swe5owe1cue4ottsh4eos4e1ort4sce3ol4edieo2ge5of1tio4eno4enn5tiq4edoti4u1tive3my1tiz4othee2ct5laee2ft5lo4t1mee2mtme4e1meem5bcoi4to3be5exo1ry2tof1effel2iel2ftos24t1pe1la1traos2ceig2ei5de5ico2soe1h45egyeg5n",5:"_ach4e4go_e4goseg1ule5gurtre5feg4iceher4eg5ibeger44egaltre4mei5gle3imbe3infe1ingtra3beir4deit3eei3the5ity5triae4jud3efiteki4nek4la2trime4la_e4lactri4v4toute4law5toure3leaefil45elece4ledto2rae5len4tonye1lestro3ve4fic4tonoto3mytom4bto2mato5ice5limto2gre3lioe2listru5i4todo4ellaee4tyello4e5locel5ogeest4el2shel4tae5ludel5uge4mace4mage5man2t1n2ee2s4ee4p1e2mele4metee4naemi4eee4lyeel3i3tled3tle_e4mistlan4eed3iem3iztrus4emo4gti3zaem3pie4mule4dulemu3ne4dritiv4aedon2e4dolti3tle5neae5neeen3emtis4pti5sotis4m3tisee3newti3sae5niee5nile3nioedi5zen3ite5niu5enized1ited3imeno4ge4nosen3oven4swti5oc4t1s2en3uaen5ufe3ny_4en3zed3ibe3diae4oi4ede4s3tini4ed3deo3ret2ina2e2dae4culeo4toe5outec4te4t3t2t4tes2t1ine5pel4timpe2corephe4e4plie2col5tigutu3arti5fytu4bie3pro3tienep4sh5tidie4putt4icoeci4t4tick2ti2bec3imera4bti4aber3ar4tuf45tu3ier4bler3che4cib2ere_4thooecca54thil3thet4thea3turethan4e4cade4bitere4qe4ben5turieret4tur5oeav5oeav5itu5ry4tess4tes_ter5ve1rio4eriter4iueri4v1terier3m4ter3cte5pe4t1waer3noeast3er5obe5rocero4rer1oue3assea5sp1tent4ertler3twtwis4eru4t3tende1s4a3tenc5telsear2te2scateli4e3scres5cue1s2ee2sec3tel_te5giear5kear4cte5diear3ae3sha2t1ede5ande2sice2sid5tecttece44teattype3ty5phesi4uea4gees4mie2sole3acte2sone1a4bdys5pdy4sedu4petaun4d3uleta5sytas4e4tare4tarctar4ata5pl2estrta5mo4talke2surtal3idu5eleta4bta5lae3teoua5naet1ic4taf4etin4ta5doe5tir4taciuan4id1ucad1u1ae3trae3tre2d1s2syn5ouar2d4drowet3uaet5ymdro4pdril4dri4b5dreneu3rouar3ieute44draieu5truar3te2vasdop4pe5veadoo3ddoni4u4belsum3iev1erdoli4do4laev3idevi4le4vinevi4ve5voc2d5ofdo5dee4wage5wee4d1n4ewil54d5lue3wit2d3lou3ber5eye_u1b4i3dledfa3blfab3rfa4ce3dle_fain4suit3su5issu2g34d5lasu4b3fa3tasu1al4fato1di1vd2iti5disiuci4bfeas4di1redi4pl4feca5fectdio5gfe3life4mofen2d4st3wuc4it5ferr5diniucle3f4fesf4fie4stry1dinaf4flydi3ge3dictd4icedia5bs4tops1tle5stirs3tifs4ties1ticfic4is5tias4ti_4ficsfi3cuud3ers3thefil5iste2w4filyudev45finas4tedfi2nes2talfin4ns2tagde2tode4suflin4u1dicf2ly5ud5isu5ditde1scd2es_der5sfon4tu4don5dermss4lid4erhfor4is4siede2pudepi4fra4tf5reade3pade3nufril4frol5ud4side3nou4eneuens4ug5infu5el5dem_s5setfu5nefu3rifusi4fus4s4futade5lode5if4dee_5gal_3galiga3lo2d1eds3selg5amos2s5cssas3u1ing4ganouir4mgass4gath3uita4deaf5dav5e5dav44dato4darygeez44spotspor4s4pon4gelydark5s4ply4spio4geno4genydard5ge3omg4ery5gesigeth54getoge4tydan3g4g1g2da2m2g3gergglu5dach4gh3inspil4gh4to4cutr1gi4agia5rula5bspho5g4icogien5s2pheulch42sperspa4n5spai3c4utu1lenul4gigir4lg3islcu5pycu3picu4mic3umecu2maso5vi5glasu5liagli4bg3lig5culiglo3r4ul3mctu4ru1l4og4na_c3terul1tig2ning4nio4ultug4noncta4b4c3s2cru4dul5ulsor5dgo3isum5absor5ccris4go3nic4rinson4gsona45gos_cri5fcre4vum4bi5credg4raigran25solvsoft3so4ceunat44graygre4nco5zi4gritcoz5egruf4cow5ag5stecove4cos4es5menun4ersmel44corbco4pl4gu4tco3pacon5tsman3gy5racon3ghach4hae4mhae4th5aguha3lac4onecon4aun4ims3latu2ninhan4gs3ket5colocol5ihan4kuni3vhap3lhap5ttras4co4grhar2dco5agsir5aclim45sionhas5shaun44clichaz3acle4m1head3hearun3s4s3ingun4sws2ina2s1in4silysil4eh5elohem4p4clarhena45sidiheo5r1c4l4h4eras5icc2c1itu4orsh3ernshor4h3eryci3phshon34cipecion45cinoc1ingc4inahi5anhi4cohigh5h4il2shiv5h4ina3ship3cilihir4lhi3rohir4phir4rsh3iohis4ssh1inci4lau5pia4h1l4hlan44cier5shevcia5rhmet4ch4tish1erh5ods3cho2hoge4chi2z3chitho4mahome3hon4aho5ny3hoodhoon45chiouptu44ura_ho5ruhos4esew4ihos1p1housu4ragses5tu4rasur4behree5se5shs1e4s4h1s24chedh4tarht1enht5esur4fru3rifser4os4erlhun4tsen5gur1inu3riosen4dhy3pehy3phu1ritces5tur3iz4cesa4sencur4no4iancian3i4semeia5peiass45selv5selfi4atu3centse1le4ceniib5iaib3inseg3ruros43cencib3li3cell5cel_s5edli5bun4icam5icap4icar4s4ed3secticas5i4cayiccu44iceour4pe4ced_i5cidsea5wi2cipseas4i4clyur4pi4i1cr5icrai4cryic4teictu2ccon4urti4ic4umic5uoi3curcci4ai4daiccha5ca4thscof4ide4s4casys4cliscle5i5dieid3ios4choid1itid5iui3dlei4domid3owu5sadu5sanid5uous4apied4ecany4ield3s4cesien4ei5enn4sceii1er_i3esci1estus3ciuse5as4cedscav5if4frsca4pi3fieu5siau3siccan4eiga5bcan5d4calous5sli3gibig3ilig3inig3iti4g4lus1trig3orig5oti5greigu5iig1ur2c5ah4i5i44cag4cach4ca1blusur4sat3usa5tab5utoi3legil1erilev4uta4b4butail3iail2ibil3io3sanc2ilitil2izsal4t5bustil3oqil4tyil5uru3tati4magsa5losal4m4ute_4imetbu3res3act5sack2s1ab4imitim4nii3mon4utelbumi4bu3libu4ga4inav4utenbsor42b5s2u4tis4briti3neervi4vr3vic4inga4inger3vey4ingir3ven4ingo4inguu4t1li5ni_i4niain3ioin1isbo4tor5uscrunk5both5b5ota5bos42i1no5boriino4si4not5borein3seru3in2int_ru4glbor5di5nusut5of5bor_uto5gioge4io2grbon4au5tonru3enu4touion3iio5phior3ibod3iio5thi5otiio4toi4ourbne5gb3lisrt4shblen4ip4icr3triip3uli3quar4tivr3tigrti4db4le_b5itzira4bi4racird5ert5ibi4refbi3tri4resir5gibi5ourte5oir4isr3tebr4tagbin4diro4gvac3uir5ul2b3ifis5agis3arisas52is1cis3chbi4eris3erbi5enrson3be5yor5shais3ibisi4di5sisbe3tw4is4krs3es4ismsbe5trr3secva4geis2piis4py4is1sbe3sp4bes4be5nuval5ois1teis1tirrys4rros44be5mis5us4ita_rron4i4tagrri4vi3tani3tatbe3lorri4or4reoit4esbe1libe5gu4itiarre4frre4cbe3giit3igbe3dii2tim2itio4itisrp4h4r3pet4itonr4peait5rybe3debe3dai5tudit3ul4itz_4be2dbeat3beak4ro4varo4tyros4sro5roiv5ioiv1itror3i5root1roomval1ub3berva5mo4izarva5piron4eban3ijac4qban4ebal1ajer5srom4prom4iba4geazz5i5judgay5alax4idax4ickais4aw4ly3awaya1vorav5ocav3igke5liv3el_ve4lov4elyro1feke4tyv4erdv4e2sa5vanav3ag5k2ick4illkilo5au1thk4in_4ves_ro3crkin4gve4teaun5dk5ishau4l2au3gu4kleyaugh3ve4tyk5nes1k2noat3ulkosh4at5uekro5n4k1s2at5uaat4that5te5vianat4sk5vidil4abolaci4l4adela3dylag4nlam3o3landrob3la4tosr4noular4glar3ilas4ea4topr3nivr3nita2tomr5nica4toglbin44l1c2vi5gnat3ifat1ica5tiar3neyr5net4ati_ld5isat4hol4driv2incle4bileft55leg_5leggr4nerr3nel4len_3lencr4nar1lentle3phle4prvin5dler4e3lergr3mitl4eroat5evr4mio5lesq3lessr3menl3eva4vingrma5cvio3lvi1ou4leyevi5rovi3so4l1g4vi3sulgar3l4gesate5cat5apli4agli2amr3lo4li4asr4lisli5bir4ligr2led4lics4vitil4icul3icyl3idaat5ac3lidirk4lel4iffli4flr3ket3lighvit3r4vityriv3iri2tulim3ili4moris4pl4inar3ishris4clin3ir4is_li5og4l4iqlis4pas1trl2it_as4shas5phri2pla4socask3ia3sicl3kallka4ta3sibl4lawashi4l5leal3lecl3legl3lel5riphas4abar2shrin4grin4ear4sarin4dr2inal5lowarre4l5met3rimol4modlmon42l1n2a3roorim5ilo4civo4la5rigil5ogo3loguri5et5longlon4iri1erlood5r4icolop3il3opmlora44ricir4icerib3a5los_v5oleri4agria4blos4tlo4taar2mi2loutar2izar3iolpa5bl3phal5phi4rhall3pit5voltar4im3volv2l1s2vom5ivori4l4siear4fllt5agar4fivo4rylten4vo4talth3ia3reeltis4ar4drw5ablrgo4naraw4lu3brluch4lu3cilu3enwag5olu5idlu4ma5lumia5raur5gitwait5luo3rw5al_luss4r5gisar4atl5venrgi4nara3pwar4tar3alwas4tly5mely3no2lys4l5ysewa1teaque5ma2car3gicma4clr3get5magnwed4nmaid54maldrg3erweet3wee5vwel4lapoc5re4whwest3ap3in4aphires2tr4es_mar3vre5rumas4emas1t5matemath3rero4r4eriap5atr1er4m5bilre1pumbi4vapar4a5nuran3ul4med_an3uare5lure1lian4twre5itmel4tan2trre4fy4antomen4are3fire2fe4menemen4imens4re1de3ment2r2edme5onre4awwin4g5reavme4tare3anme1tere1alm4etr3wiserdin4rdi4aan4stwith3an2span4snan2samid4amid4gan5otwl4esr4dalm4illmin4a3mindrcum3rc4itr3charcen4min4tm4inumiot4wl3ina3niumis5lan3ita3nip4mithan3ioan1gla3neuws4per2bina3nena5neem4ninw5s4tan1dl4mocrrbi4fmo2d1mo4gomois2xac5ex4agor4bagmo3mer4baba3narrau4ta5monrare4rar5cra5nor4aniam1inr2amiam5ifra4lomo3spmoth3m5ouf3mousam3icxer4ixe5roraf4tr5aclm3petra3bixhil5mpi4aam3ag3quetm5pirmp5is3quer2que_qua5vmpov5mp4tram5ab3alyz4m1s25alyt4alysa4ly_ali4exi5di5multx4ime4aldia4laral3adal5abak1enain5opu3trn4abu4nac_na4can5act5putexpe3dna4lia4i4n4naltai5lya3ic_pur4rag5ulnank4nar3c4narenar3inar4ln5arm3agognas4c4ag4l4ageupul3cage4oaga4na4gab3nautnav4e4n1b4ncar5ad5umn3chaa3ducptu4rpti3mnc1innc4itad4suad3owad4len4dain5dana5diua3ditndi4ba3dion1ditn3dizn5ducndu4rnd2we3yar4n3eara3dianeb3uac4um5neckac3ulp4siba3cio5negene4laac1inne5mine4moa3cie4nene4a2cine4poyc5erac1er2p1s2pro1tn2erepro3lner4rych4e2nes_4nesp2nest4neswpri4sycom4n5evea4carab3uln4gabn3gelpre3vpre3rycot4ng5han3gibng1inn5gitn4glangov4ng5shabi5an4gumy4erf4n1h4a5bannhab3a5bal3n4iani3anni4apni3bani4bl_us5ani5dini4erni2fip3petn5igr_ure3_un3up3per_un5op3pennin4g_un5k5nis_p5pel_un1en4ithp4ped_un1ani3tr_to4pympa3_til4n3ketnk3inyn5ic_se2ny4o5gy4onsnmet44n1n2_ru4d5pounnni4vnob4lpo4tan5ocly4ped_ro4qyper5noge4pos1s_ri4gpo4ry1p4or_res2no4mono3my_ree2po4ninon5ipoin2y4poc5po4gpo5em5pod_4noscnos4enos5tno5tayp2ta3noun_ra4cnowl3_pi2tyra5m_pi4eyr5ia_out3_oth32n1s2ns5ab_or3t_or1d_or3cplu4mnsid1nsig4y3s2eys3ion4socns4pen5spiploi4_odd5nta4bpli4n_ni4cn5tib4plignti2fpli3a3plannti4p1p2l23ysis2p3k2ys3ta_mis1nu5enpi2tun3uinp3ithysur4nu1men5umi3nu4nyt3icnu3trz5a2b_li4t_li3o_li2n_li4g_lev1_lep5_len4pion4oard3oas4e3pi1ooat5ip4inoo5barobe4l_la4mo2binpind4_ju3rob3ul_is4i_ir5rp4in_ocif3o4cil_in3so4codpi3lopi3enocre33piec5pidipi3dep5ida_in2kod3icodi3oo2do4odor3pi4cypian4_ine2o5engze3rooe4ta_im3m_id4l_hov5_hi3b_het3_hes3_go4r_gi4bpho4ro5geoo4gero3gie3phobog3it_gi5azo5ol3phizo4groogu5i4z1z22ogyn_fes3ohab5_eye55phieph1icoiff4_en3sph4ero3ing_en3go5ism_to2qans3v_el5d_eer4bbi4to3kenok5iebio5mo4lanper1v4chs_old1eol3erpe5ruo3letol4fi_du4co3liaper3op4ernp4erio5lilpe5ono5liop4encpe4la_do4tpee4do5livcin2q3pediolo4rol5pld3tabol3ub3pedeol3uno5lusedg1le1loaom5ahoma5l2p2edom2beom4bl_de3o3fich3pe4ao4met_co4ro3mia_co3ek3shao5midom1inll1fll3teapa2teo4monom3pi3pare_ca4tlue1pon4aco3nanm2an_pa4pum2en_on5doo3nenng1hoon4guon1ico3nioon1iso5niupa3nypan4ao3nou_bri2pain4ra1oronsu4rk1hopac4tpa4ceon5umonva5_ber4ood5eood5i6rks_oop3io3ordoost5rz1scope5dop1erpa4ca_ba4g_awn4_av4i_au1down5io3pito5pon1sync_as1s_as1p_as3ctch1c_ar5so5ra_ow3elo3visov4enore5auea1mor3eioun2d_ant4orew4or4guou5etou3blo5rilor1ino1rio_ang4o3riuor2miorn2eo5rofoto5sor5pe3orrhor4seo3tisorst4o3tif_an5cor4tyo5rum_al3tos3al_af1tos4ceo4teso4tano5scros2taos4poos4paz2z3wosi4ue3pai",6:"os3ityos3itoz3ian_os4i4ey1stroos5tilos5titxquis3_am5atot3er_ot5erso3scopor3thyweek1noth3i4ot3ic_ot5icao3ticeor3thiors5enor3ougor3ityor3icaouch5i4o5ria_ani5mv1ativore5sho5realus2er__an3teover3sov4erttot3icoviti4o5v4olow3dero4r3agow5esto4posiop3ingo5phero5phanthy3sc3operaontif5on3t4ionten45paganp3agattele2gonspi4on3omyon4odipan3elpan4tyon3keyon5est3oncil_ar4tyswimm6par5diompro5par5elp4a4ripar4isomo4gepa5terst5scrpa5thy_atom5sta1tio5miniom3icaom3ic_ss3hatsky1scpear4lom3ena_ba5naol3umer1veilpedia4ped4icolli4er1treuo5liteol3ishpeli4epe4nano5lis_pen4thol3ingp4era_r1thoup4erago3li4f_bas4er1krauperme5ol5id_o3liceper3tio3lescolass4oi3terpe5tenpe5tiz_be5raoi5son_be3smphar5iphe3nooi5letph4es_oi3deroic3esph5ingr3ial_3ognizo5g2ly1o1gis3phone5phonio5geneo4gatora3mour2amenofit4tof5itera3chupi4ciepoly1eod5dedo5cureoc3ula1pole_5ocritpee2v1param4oc3raco4clamo3chetob5ingob3a3boast5eoke1st3nu3itpi5thanuf4fentu3meoerst2o3chasplas5tn3tinepli5ernti4ernter3sntre1pn4s3esplum4bnsati4npre4cns4moonon1eqnor5abpo3et5n5lessn5oniz5pointpoly5tnon4agnk3rup3nomicng1sprno5l4inois5i4n3o2dno3blenni3aln5keroppa5ran3itor3nitionis4ta5nine_ni3miznd3thrmu2dron3geripray4e5precipre5copre3emm3ma1bpre4lan5gerep3rese3press_can5cmedi2c5pri4e_ce4la3neticpris3op3rocal3chain4er5ipros3en4erarnera5bnel5iz_cit5rne4gatn5d2ifpt5a4bjanu3aign4itn3chisn5chiln5cheon4ces_nau3seid4iosna3talnas5tinan4itnanci4na5mitna5liahnau3zput3er2n1a2bhex2a3hatch1multi3hair1sm4pousg1utanmpo3rim4p1inmp5iesmphas4rach4empar5iraf5figriev1mpara5mo5seyram3et4mora_rane5oran4gemo3ny_monol4rap3er3raphymo3nizgno5morar5ef4raril1g2nacg1leadmoni3ara5vairav3elra5ziemon5gemon5etght1wemoi5sege3o1dmma5ryr5bine3fluoren1dixmis4ti_de3ra_de3rie3chasrch4err4ci4bm4inglm5ineedu2al_3miliame3tryrdi4er_des4crd3ingdi2rerme5thimet3alre5arr3mestim5ersadi2rende2ticdes3icre4cremen4temensu5re3disred5itre4facmen4dede2mosmen5acmem1o3reg3ismel5onm5e5dyme3died2d5ibren4te5mediare5pindd5a5bdata1bmba4t5cle4arma3tisma5scemar4lyre4spichs3huma5riz_dumb5re3strre4terbrus4qre3tribio1rhre5utiman3izre4valrev3elbi1orbbe2vie_eas3ire5vilba1thyman5is5maniamal4tymal4lima5linma3ligmag5inav3ioul5vet4rg3inglus3teanti1dl5umn_ltur3a_el3emltera4ltane5lp5ingloun5dans5gra2cabllos5etlor5ouric5aslo5rie_enam35ricidri4cie5lope_rid5erri3encri3ent_semi5lom3errig5an3logicril3iz5rimanlob5allm3ingrim4pell5out5rina__er4ril5linal2lin4l3le4tl3le4nriph5eliv3er_ge5og_han5k_hi3er_hon3olin3ea1l4inel4im4p_idol3_in3ci_la4cy_lath5rit3iclim4blrit5urriv5elriv3et4l4i4lli4gra_leg5elif3errk4linlid5er4lict_li4cor5licioli4atorl5ish_lig5a_mal5o_man5a_mer3c5less_rm5ersrm3ingy3thinle5sco3l4erilera5b5lene__mon3ele4matld4erild4erela4v4ar1nis44lativ_mo3rola5tanlan4telan5etlan4dllab3ic_mu5takin4dek3est_ro5filk3en4dro5ker5role__of5te4jestyys3icaron4al5izont_os4tlron4tai4v3ot_pe5tero3pelrop3ici5voreiv5il__pio5n_pre3mro4the_ran4tiv3en_rov5eliv3ellit3uati4tramr5pentrp5er__rit5ui4tismrp3ingit5ill_ros5tit3ica4i2tici5terirre4stit3era4ita5mita4bi_row5dist4lyis4ta_is4sesrsa5tiissen4is4sal_sci3erse4crrs5er_islan4rse5v2yo5netish5opis3honr4si4bis5han5iron_ir4minrtach4_self5iri3turten4diri5dei4rel4ire4de_sell5r4tieriq3uidrtil3irtil4lr4tilyr4tistiq5uefip4re4_sing4_ting4yn3chrru3e4lion3at2in4th_tin5krum3pli4no4cin3ityrun4ty_ton4aruti5nymbol5rvel4i_top5irv5er_r5vestin5geni5ness_tou5s_un3cein3cerincel45ryngei4n3auim3ulai5miniimi5lesac3riim5ida_ve5rasalar4ima5ryim3ageill5abil4istsan4deila5rai2l5am_wil5ii4ladeil3a4bsa5voright3iig3eraab5erd4ific_iff5enif5eroi3entiien5a45ie5gaidi5ou3s4cieab5latidi4arid5ianide3al4scopyab5rogid5ancic3ulaac5ardi2c5ocic3ipaic5inase2c3oi4carai4car_se4d4ei2b5riib5iteib5it_ib5ertib3eraac5aroi4ativ4ian4tse4molsen5ata5ceouh4warts5enedhus3t4s5enin4sentd4sentlsep3a34s1er_hun5kehu4min4servohro3poa5chethov5el5se5umhouse3sev3enho5senhort3eho5rishor5at3hol4ehol5arh5odizhlo3riac5robhis3elhion4ehimer4het4edsh5oldhe2s5ph5eroushort5here5aher4bahera3p3side_5sideshen5atsi5diz4signahel4lyact5ifhe3l4ihe5do55sine_h5ecathe4canad4dinsion5aad5er_har4lehard3e3sitioha5rasha3ranhan4tead3icahang5oadi4ersk5inesk5ing5hand_han4cyhan4cislith5hala3mh3ab4lsmall32g5y3n5gui5t3guard5smithad5ranaeri4eag5ellag3onia5guerso4labsol3d2so3licain5in4grada3s4on_gor5ougo5rizgondo5xpan4dait5ens5ophyal3end3g4o4ggnet4tglad5i5g4insgin5ge3g4in_spen4d2s5peog3imen5gies_3spher5giciagh5outsp5ingge5nizge4natge5lizge5lisgel4inxi5miz4gativgar5n4a5le5oga3nizgan5isga5mets5sengs4ses_fu4minfres5cfort5assi4erss5ilyfore5tfor5ayfo5ratal4ia_fon4dessur5aflo3ref5lessfis4tif1in3gstam4i5stands4ta4p5stat_fin2d5al5levs5tero4allicstew5afight5fi5del5ficie5ficiafi3cer5stickf3icena5log_st3ingf3icanama5ra5stockstom3a5stone2f3ic_3storef2f5iss4tradam5ascs4trays4tridf5fin_fend5efeath3fault5fa3thefar5thfam5is4fa4mafall5eew3inge5verbeven4ie5vengevel3oev3ellev5asteva2p5euti5let5roset3roget5rifsy5rinet3ricet5onaam5eraam5ilyami4noamor5ieti4noe5tidetai5loethod3eten4dtal5enes5urramp5enan3ageta5loge5strotan4detanta3ta5pere3ston4es2toes5times3tigta3rizestan43analy4taticta4tures4prean3arces3pertax4ises5onaes3olue5skintch5etanar4ies4i4ntead4ie2s5ima3natiande4sesh5enan3disan4dowang5iete5geres5ences5ecres5cana4n1icte2ma2tem3at3tenanwrita45erwau4tenesert3era3nieser3set5erniz4erniter4nis5ter3de4rivaan3i3fter3isan4imewo5vener3ineeri4ere3rient3ess_teth5e5ericke1ria4er3ester5esser3ent4erenea5nimier5enaer3emoth3easthe5atthe3iser5el_th5ic_th5icaere3in5thinkere5coth5odea5ninee3realan3ishan4klier4che5anniz4erandti4atoanoth5equi3lep5utat4ic1uan4scoe4probep3rehe4predans3poe4precan4surantal4e3penttim5ulep5anceo5rol3tine_eop3aran4tiewin4deap5eroen3ishen5icsen3etren5esten5esien5eroa3pheren3dicap3itae4nanten5amoem5ulaa3pituti3zen5emnize5missem5ishap5olaem5ine3tles_t5let_em1in2apor5iem3icaem5anael3op_el4labapos3te3liv3el5ishaps5esweath3e3lierel3icaar3actwa5verto3nate3libee4l1erel3egato3rietor5iza5radeelaxa4aran4gto3warelan4dej5udie5insttra5chtraci4ar5av4wa5gere5git5arbal4ar5easeg5ing4voteetrem5iar3enta5ressar5ial4tricsvor5abe3finetro5mitron5i4tronyar3iantro3sp5eficia3rieted5uloed3icae4d1erec3ulaec4tane4cremeco5roec3orae4concar5o5de4comme4cluse4clame5citeec5ifya5ronias3anta5sia_tu4nis2t3up_ecan5ce4belstur3ise4bel_eav3ene4a3tue5atifeath3ieat5eneart3eear4ilear4icear5eseam3ereal3oueal5erea5geread5iedum4be4ducts4duct_duc5eras3tenasur5adrea5rat3abl4d5outdo3natdom5izdo5lor4dlessu4bero3dles_at3alou3ble_d4is3tdirt5idi5niz3dine_at5ech5di3endi4cam1d4i3ad3ge4tud5estdev3ilde3strud3iedud3iesdes3tide2s5oat3egovis3itde4nardemor5at3en_uen4teuer4ilde5milat3eraugh3en3demicater5nuil5izdeli4ede5comde4cildecan4de4bonv3io4rdeb5it4dativ2d3a4bat3estu5laticu4tie5ulcheul3dercuss4icu5riaath5em3cultua5thenul3ingul5ishul4lar4vi4naul4liscu5ityctim3ic4ticuuls5esc5tantultra3ct5angcros4ecrop5ocro4pl5critiath5omum4blycre3at5vilitumor5oat5i5b5crat_cras5tcoro3ncop3iccom5ercol3orun5ishco3inc5clareat3ituunt3abat5ropun4tescit3iz4cisti4cista4cipicc5ing_cin3em3cinatuper5s5videsup3ingci2a5b5chini5videdupt5ib5vide_at4tag4ch1inch3ersch3er_ch5ene3chemiche5loure5atur4fercheap3vi5aliat3uravet3er4ch3abc5e4taau5sib3cessives4tece5ram2cen4e4cedenccou3turs5erur5tesur3theaut5enur4tiecav5al4cativave4nover3thcar5omca5percan4tycan3izcan5iscan4icus4lin3versecal4laver3ieca3latca5dencab3in3butiobuss4ebus5iebunt4iv4eresuten4i4u1t2iv3erenu3tineut3ingv4erelbroth35u5tizbound34b1orabon5at5vere_bom4bibol3icblun4t5blespblath5av3erav5enuebi3ogrbi5netven3om2v1a4bvac5ilbi3lizbet5izbe5strva5liebe5nigbbi4nabas4siva5nizbari4aav5ernbarbi5av5eryvel3liazi4eravi4er",7:"_dri5v4ban5dagvar5iedbina5r43bi3tio3bit5ua_ad4derution5auti5lizver5encbuf4ferus5terevermi4ncall5incast5ercas5tigccompa5z3o1phros5itiv5chanicuri4fico5stati5chine_y5che3dupport54v3iden5cific_un4ter_at5omiz4oscopiotele4g5craticu4m3ingv3i3liz4c3retaul4li4bcul4tiscur5a4b4c5utiva5ternauiv4er_del5i5qdem5ic_de4monsdenti5fdern5izdi4latou4b5ingdrag5on5drupliuar5ant5a5si4tec5essawo4k1enec5ifiee4compear5inate4f3eretro5phewide5sp5triciatri5cesefor5ese4fuse_oth5esiar5dinear4chantra5ventrac4tetrac4itar5ativa5ratioel5ativor5est_ar5adisel5ebraton4alie4l5ic_wea5rieel5igibe4l3ingto5cratem5igraem3i3niemoni5oench4erwave1g4a4pillavoice1ption5eewill5inent5age4enthesvaude3vtill5inep5recaep5ti5bva6guer4erati_tho5rizthor5it5thodicer5ence5ternitteri5zater5iesten4tage4sage_e4sagese4sert_an5est_e4sertse4servaes5idenes5ignaesis4tees5piraes4si4btal4lisestruc5e5titioounc5erxe4cutota5bleset5itiva4m5atoa4matis5stratu4f3ical5a5lyst4ficatefill5instern5isspend4gani5zasqual4la4lenti4g3o3nas5ophiz5sophicxpecto55graph_or5angeuri4al_4graphy4gress_smol5d4hang5erh5a5nizharp5enhar5terhel4lishith5erhro5niziam5eteia4tricic4t3uascour5au2r1al_5scin4dover4nescan4t55sa3tiou5do3ny_ven4de_under5ty2p5al_anti5sylla5bliner4arturn3ari5nite_5initioinsur5aion4eryiphras4_tim5o5_ten5an_sta5blrtroph4_se5rieiq3ui3t5i5r2izis5itiviso5mer4istral5i5ticki2t5o5mtsch3ie_re5mittro3fiti4v3er_i4vers_ros5per_pe5titiv3o3ro_ped5alro5n4is_or5ato4jestierom5ete_muta5bk5iness4latelitr4ial__mist5i_me5terr4ming_lev4er__mar5tilev4eralev4ers_mag5a5liar5iz5ligaterit5ers_lat5errit5er_r5ited__im5pinri3ta3blink5er_hon5ey5litica_hero5ior5aliz_hand5irip5lic_gen3t4tolo2gylloqui5_con5grt1li2erbad5ger4operag_eu4lertho3donter2ic__ar4tie_ge4ome_ge5ot1_he3mo1_he3p6a_he3roe_in5u2tpara5bl5tar2rht1a1mintalk1a5ta3gon_par5age_aster5_ne6o3f_noe1thstyl1is_poly1s5pathic_pre1ampa4tricl3o3niz_sem4ic_semid6_semip4_semir45ommend_semiv4lea4s1a_spin1oom5etryspher1o_to6poglo4ratospe3cio3s2paceso2lute_we2b1l_re1e4ca5bolicom5erseaf6fishside5swanal6ysano5a2cside5stl5ties_5lumniasid2ed_anti1reshoe1stscy4th1s4chitzsales5wsales3cat6tes_augh4tlau5li5fom5atizol5ogizo5litiorev5olure5vertre5versbi5d2ifbil2lab_earth5pera5blro1tronro3meshblan2d1blin2d1blon2d2bor1no5ro1bot1re4ti4zr5le5quperi5stper4malbut2ed_but4tedcad5e1moist5enre5stalress5ibchie5vocig3a3roint5er4matizariv1o1lcous2ticri3tie5phisti_be5stoog5ativo2g5a5rr3a3digm4b3ingre4posir4en4tade4als_od5uctsquasis6quasir6re5fer_p5trol3rec5olldic1aiddif5fra3pseu2dr5ebrat5metric2d1lead2d1li2epro2g1epre1neuod5uct_octor5apoin3came5triem5i5liepli5narpara3memin5glim5inglypi4grappal6matmis4er_m5istryeo3graporth1riop1ism__but4tio3normaonom1icfeb1ruafermi1o_de4moio5a5lesodit1icodel3lirb5ing_gen2cy_n4t3ingmo5lestration4get2ic_4g1lishobli2g1mon4ismnsta5blmon4istg2n1or_nov3el3ns5ceivno1vembmpa5rabno4rarymula5r4nom1a6lput4tinput4tedn5o5miz_cam4penag5er_nge5nesh2t1eoun1dieck2ne1skiifac1etncour5ane3backmono1s6mono3chmol1e5cpref5ac3militapre5tenith5i2lnge4n4end5est__capa5bje1re1mma1la1ply5styr1kovian_car5olprin4t3lo2ges_l2l3ishprof5it1s2tamp",8:"lead6er_url5ing_ces5si5bch5a5nis1le1noidlith1o5g_chill5ilar5ce1nym5e5trych5inessation5arload4ed_load6er_la4c3i5elth5i2lyneg5ativ1lunk3erwrit6er_wrap3arotrav5es51ke6linga5rameteman3u1scmar1gin1ap5illar5tisticamedio6c1me3gran3i1tesima3mi3da5bves1titemil2l1agv1er1eigmi6n3is_1verely_e4q3ui3s5tabolizg5rapher5graphicmo5e2lasinfra1s2mon4ey1lim3ped3amo4no1enab5o5liz_cor5nermoth4et2m1ou3sinm5shack2ppo5sitemul2ti5uab5it5abimenta5rignit1ernato5mizhypo1thani5ficatuad1ratu4n5i4an_ho6r1ic_ua3drati5nologishite3sidin5dling_trib5utin5glingnom5e1non1o1mistmpos5itenon1i4so_re5stattro1p2istrof4ic_g2norespgnet1ism5glo5binlem5aticflow2er_fla1g6elntrol5lifit5ted_treach1etra1versl5i5ticso3mecha6_for5mer_de5rivati2n3o1me3spac6i2t3i4an_thy4l1antho1k2er_eq5ui5to4s3phertha4l1amt3ess2es3ter1geiou3ba3dotele1r6ooxi6d1iceli2t1isonspir5apar4a1leed1ulingea4n3iesoc5ratiztch3i1er_kil2n3ipi2c1a3dpli2c1abt6ap6athdrom3e5d_le6icesdrif2t1a_me4ga1l1prema3cdren1a5lpres2plipro2cess_met4ala3do5word1syth3i2_non1e2m_post1ampto3mat4rec5ompepu5bes5cstrib5utqu6a3si31stor1ab_sem6is4star3tliqui3v4arr1abolic_sph6in1de5clar12d3aloneradi1o6gs3qui3tosports3wsports3cra5n2hascro5e2cor3bin1gespokes5wspi2c1il_te3legrcroc1o1d_un3at5t_dictio5cat1a1s2buss4ingbus6i2esbus6i2erbo2t1u1lro5e2las1s2pacinb1i3tivema5rine_r3pau5li_un5err5r5ev5er__vi2c3arback2er_ma5chinesi5resid5losophyan3ti1n2sca6p1ersca2t1olar2rangesep3temb1sci2uttse3mes1tar3che5tsem1a1ph",9:"re4t1ribuuto5maticl3chil6d1a4pe5able1lec3ta6bas5ymptotyes5ter1yl5mo3nell5losophizlo1bot1o1c5laratioba6r1onierse1rad1iro5epide1co6ph1o3nscrap4er_rec5t6angre2c3i1prlai6n3ess1lum5bia_3lyg1a1miec5ificatef5i5nites2s3i4an_1ki5neticjapan1e2smed3i3cinirre6v3ocde2c5linao3les3termil5li5listrat1a1gquain2t1eep5etitiostu1pi4d1v1oir5du1su2per1e6_mi1s4ers3di1methy_mim5i2c1i5nitely_5maph1ro15moc1ra1tmoro6n5isdu1op1o1l_ko6r1te1n3ar4chs_phi2l3ant_ga4s1om1teach4er_parag6ra4o6v3i4an_oth3e1o1sn3ch2es1to5tes3toro5test1eror5tively5nop5o5liha2p3ar5rttrib1ut1_eth1y6l1e2r3i4an_5nop1oly_graph5er_5eu2clid1o1lo3n4omtrai3tor1_ratio5na5mocratiz_rav5en1o",10:"se1mi6t5ic3tro1le1um5sa3par5iloli3gop1o1am1en3ta5bath3er1o1s3slova1kia3s2og1a1myo3no2t1o3nc2tro3me6c1cu2r1ance5noc3er1osth1o5gen1ih3i5pel1a4nfi6n3ites_ever5si5bs2s1a3chu1d1ri3pleg5_ta5pes1trproc3i3ty_s5sign5a3b3rab1o1loiitin5er5arwaste3w6a2mi1n2ut1erde3fin3itiquin5tes5svi1vip3a3r",11:"pseu3d6o3f2s2t1ant5shimi1n2ut1estpseu3d6o3d25tab1o1lismpo3lyph1onophi5lat1e3ltravers3a3bschro1ding12g1o4n3i1zat1ro1pol3it3trop1o5lis3trop1o5lesle3g6en2dreeth1y6l1eneor4tho3ni4t",12:"3ra4m5e1triz1e6p3i3neph1"}};Hyphenator.config({remoteloading:false,doframes:true,persistentconfig:true});Hyphenator.run();


//////////////////////////////////////////////////////////////////////////////////
// Cloud Zoom V1.0.2
// (c) 2010 by R Cecco. <http://www.professorcloud.com>
// MIT License
//
// Please retain this copyright header in all versions of the software
//////////////////////////////////////////////////////////////////////////////////
    function format(str) {
        for (var i = 1; i < arguments.length; i++) {
            str = str.replace('%' + (i - 1), arguments[i]);
        }
        return str;
    }

    function CloudZoom(jWin, opts) {
        var sImg = $('img', jWin);
		var	img1;
		var	img2;
        var zoomDiv = null;
		var	$mouseTrap = null;
		var	lens = null;
		var	$tint = null;
		var	softFocus = null;
		var	$ie6Fix = null;
		var	zoomImage;
        var controlTimer = 0;      
        var cw, ch;
        var destU = 0;
		var	destV = 0;
        var currV = 0;
        var currU = 0;      
        var filesLoaded = 0;
        var mx,
            my; 
        var ctx = this, zw;
        // Display an image loading message. This message gets deleted when the images have loaded and the zoom init function is called.
        // We add a small delay before the message is displayed to avoid the message flicking on then off again virtually immediately if the
        // images load really fast, e.g. from the cache. 
        //var	ctx = this;
        setTimeout(function () {
            //						 <img src="/images/loading.gif"/>
            if ($mouseTrap === null) {
                var w = jWin.width();
                jWin.parent().append(format('<div style="width:%0px;position:absolute;top:75%;left:%1px;text-align:center" class="cloud-zoom-loading" >Loading...</div>', w / 3, (w / 2) - (w / 6))).find(':last').css('opacity', 0.5);
            }
        }, 200);


        var ie6FixRemove = function () {

            if ($ie6Fix !== null) {
                $ie6Fix.remove();
                $ie6Fix = null;
            }
        };

        // Removes cursor, tint layer, blur layer etc.
        this.removeBits = function () {
            //$mouseTrap.unbind();
            if (lens) {
                lens.remove();
                lens = null;             
            }
            if ($tint) {
                $tint.remove();
                $tint = null;
            }
            if (softFocus) {
                softFocus.remove();
                softFocus = null;
            }
            ie6FixRemove();

            $('.cloud-zoom-loading', jWin.parent()).remove();
        };


        this.destroy = function () {
            jWin.data('zoom', null);

            if ($mouseTrap) {
                $mouseTrap.unbind();
                $mouseTrap.remove();
                $mouseTrap = null;
            }
            if (zoomDiv) {
                zoomDiv.remove();
                zoomDiv = null;
            }
            //ie6FixRemove();
            this.removeBits();
            // DON'T FORGET TO REMOVE JQUERY 'DATA' VALUES
        };


        // This is called when the zoom window has faded out so it can be removed.
        this.fadedOut = function () {
            
			if (zoomDiv) {
                zoomDiv.remove();
                zoomDiv = null;
            }
			 this.removeBits();
            //ie6FixRemove();
        };

        this.controlLoop = function () {
            if (lens) {
                var x = (mx - sImg.offset().left - (cw * 0.5)) >> 0;
                var y = (my - sImg.offset().top - (ch * 0.5)) >> 0;
               
                if (x < 0) {
                    x = 0;
                }
                else if (x > (sImg.outerWidth() - cw)) {
                    x = (sImg.outerWidth() - cw);
                }
                if (y < 0) {
                    y = 0;
                }
                else if (y > (sImg.outerHeight() - ch)) {
                    y = (sImg.outerHeight() - ch);
                }

                lens.css({
                    left: x,
                    top: y
                });
                lens.css('background-position', (-x) + 'px ' + (-y) + 'px');

                destU = (((x) / sImg.outerWidth()) * zoomImage.width) >> 0;
                destV = (((y) / sImg.outerHeight()) * zoomImage.height) >> 0;
                currU += (destU - currU) / opts.smoothMove;
                currV += (destV - currV) / opts.smoothMove;

                zoomDiv.css('background-position', (-(currU >> 0) + 'px ') + (-(currV >> 0) + 'px'));              
            }
            controlTimer = setTimeout(function () {
                ctx.controlLoop();
            }, 30);
        };

        this.init2 = function (img, id) {

            filesLoaded++;
            //console.log(img.src + ' ' + id + ' ' + img.width);	
            if (id === 1) {
                zoomImage = img;
            }
            //this.images[id] = img;
            if (filesLoaded === 2) {
                this.init();
            }
        };

        /* Init function start.  */
        this.init = function () {
            // Remove loading message (if present);
            $('.cloud-zoom-loading', jWin.parent()).remove();


/* Add a box (mouseTrap) over the small image to trap mouse events.
		It has priority over zoom window to avoid issues with inner zoom.
		We need the dummy background image as IE does not trap mouse events on
		transparent parts of a div.
		*/
            $mouseTrap = jWin.parent().append(format("<div class='mousetrap' style='background-image:url(\".\");z-index:999;position:absolute;width:%0px;height:%1px;left:%2px;top:%3px;\'></div>", sImg.outerWidth(), sImg.outerHeight(), 0, 0)).find(':last');

            //////////////////////////////////////////////////////////////////////			
            /* Do as little as possible in mousemove event to prevent slowdown. */
            $mouseTrap.bind('mousemove', this, function (event) {
                // Just update the mouse position
                mx = event.pageX;
                my = event.pageY;
            });
            //////////////////////////////////////////////////////////////////////					
            $mouseTrap.bind('mouseleave', this, function (event) {
                clearTimeout(controlTimer);
                //event.data.removeBits();                
				if(lens) { lens.fadeOut(299); }
				if($tint) { $tint.fadeOut(299); }
				if(softFocus) { softFocus.fadeOut(299); }
				zoomDiv.fadeOut(300, function () {
                    ctx.fadedOut();
                });																
                return false;
            });
            //////////////////////////////////////////////////////////////////////			
            $mouseTrap.bind('mouseenter', this, function (event) {
				mx = event.pageX;
                my = event.pageY;
                zw = event.data;
                if (zoomDiv) {
                    zoomDiv.stop(true, false);
                    zoomDiv.remove();
                }

                var xPos = opts.adjustX,
                    yPos = opts.adjustY;
                             
                var siw = sImg.outerWidth();
                var sih = sImg.outerHeight();

                var w = opts.zoomWidth;
                var h = opts.zoomHeight;
                if (opts.zoomWidth == 'auto') {
                    w = siw;
                }
                if (opts.zoomHeight == 'auto') {
                    h = sih;
                }
                //$('#info').text( xPos + ' ' + yPos + ' ' + siw + ' ' + sih );
                var appendTo = jWin.parent(); // attach to the wrapper			
                switch (opts.position) {
                case 'top':
                    yPos -= h; // + opts.adjustY;
                    break;
                case 'right':
                    xPos += siw; // + opts.adjustX;					
                    break;
                case 'bottom':
                    yPos += sih; // + opts.adjustY;
                    break;
                case 'left':
                    xPos -= w; // + opts.adjustX;					
                    break;
                case 'inside':
                    w = siw;
                    h = sih;
                    break;
                    // All other values, try and find an id in the dom to attach to.
                default:
                    appendTo = $('#' + opts.position);
                    // If dom element doesn't exit, just use 'right' position as default.
                    if (!appendTo.length) {
                        appendTo = jWin;
                        xPos += siw; //+ opts.adjustX;
                        yPos += sih; // + opts.adjustY;	
                    } else {
                        w = appendTo.innerWidth();
                        h = appendTo.innerHeight();
                    }
                }

                zoomDiv = appendTo.append(format('<div id="cloud-zoom-big" class="cloud-zoom-big" style="display:none;position:absolute;left:%0px;top:%1px;width:%2px;height:%3px;background-image:url(\'%4\');z-index:99;"></div>', xPos, yPos, w, h, zoomImage.src)).find(':last');

                // Add the title from title tag.
                if (sImg.attr('title') && opts.showTitle) {
                    zoomDiv.append(format('<div class="cloud-zoom-title">%0</div>', sImg.attr('title'))).find(':last').css('opacity', opts.titleOpacity);
                }

                // Fix ie6 select elements wrong z-index bug. Placing an iFrame over the select element solves the issue...		
                if ($.browser.msie && $.browser.version < 7) {
                    $ie6Fix = $('<iframe frameborder="0" src="#"></iframe>').css({
                        position: "absolute",
                        left: xPos,
                        top: yPos,
                        zIndex: 99,
                        width: w,
                        height: h
                    }).insertBefore(zoomDiv);
                }

                zoomDiv.fadeIn(500);

                if (lens) {
                    lens.remove();
                    lens = null;
                } /* Work out size of cursor */
                cw = (sImg.outerWidth() / zoomImage.width) * zoomDiv.width();
                ch = (sImg.outerHeight() / zoomImage.height) * zoomDiv.height();

                // Attach mouse, initially invisible to prevent first frame glitch
                lens = jWin.append(format("<div class = 'cloud-zoom-lens' style='display:none;z-index:98;position:absolute;width:%0px;height:%1px;'></div>", cw, ch)).find(':last');

                $mouseTrap.css('cursor', lens.css('cursor'));

                var noTrans = false;

                // Init tint layer if needed. (Not relevant if using inside mode)			
                if (opts.tint) {
                    lens.css('background', 'url("' + sImg.attr('src') + '")');
                    $tint = jWin.append(format('<div style="display:none;position:absolute; left:0px; top:0px; width:%0px; height:%1px; background-color:%2;" />', sImg.outerWidth(), sImg.outerHeight(), opts.tint)).find(':last');
                    $tint.css('opacity', opts.tintOpacity);                    
					noTrans = true;
					$tint.fadeIn(500);

                }
                if (opts.softFocus) {
                    lens.css('background', 'url("' + sImg.attr('src') + '")');
                    softFocus = jWin.append(format('<div style="position:absolute;display:none;top:2px; left:2px; width:%0px; height:%1px;" />', sImg.outerWidth() - 2, sImg.outerHeight() - 2, opts.tint)).find(':last');
                    softFocus.css('background', 'url("' + sImg.attr('src') + '")');
                    softFocus.css('opacity', 0.5);
                    noTrans = true;
                    softFocus.fadeIn(500);
                }

                if (!noTrans) {
                    lens.css('opacity', opts.lensOpacity);										
                }
				if ( opts.position !== 'inside' ) { lens.fadeIn(500); }

                // Start processing. 
                zw.controlLoop();

                return; // Don't return false here otherwise opera will not detect change of the mouse pointer type.
            });
        };

        img1 = new Image();
        $(img1).load(function () {
            ctx.init2(this, 0);
        });
        img1.src = sImg.attr('src');

        img2 = new Image();
        $(img2).load(function () {
            ctx.init2(this, 1);
        });
        img2.src = jWin.attr('href');
    }

    $.fn.CloudZoom = function (options) {
		// IE6 background image flicker fix
        try {
            document.execCommand("BackgroundImageCache", false, true);
        } catch (e) {}
        this.each(function () {
			var	relOpts, opts;
			// Hmm...eval...slap on wrist.
			eval('var	a = {' + $(this).attr('rel') + '}');
			relOpts = a;
            if ($(this).is('.cloud-zoom')) {
                $(this).css({
                    'position': 'relative',
                    'display': 'block'
                });
                $('img', $(this)).css({
                    'display': 'block'
                });
                // Wrap an outer div around the link so we can attach things without them becoming part of the link.
                // But not if wrap already exists.
                if ($(this).parent().attr('id') != 'wrap') {
                    $(this).wrap('<div id="wrap" style="top:0px;z-index:99;position:relative;"></div>');
                }
                opts = $.extend({}, $.fn.CloudZoom.defaults, options);
                opts = $.extend({}, opts, relOpts);
                $(this).data('zoom', new CloudZoom($(this), opts));

            } else if ($(this).is('.cloud-zoom-gallery')) {
                opts = $.extend({}, relOpts, options);
                $(this).data('relOpts', opts);
                $(this).bind('mouseenter', $(this), function (event) {
                    var data = event.data.data('relOpts');
                    // Destroy the previous zoom
                    $('#' + data.useZoom).data('zoom').destroy();
                    // Change the biglink to point to the new big image.
                    $('#' + data.useZoom).attr('href', event.data.attr('href'));
                    // Change the small image to point to the new small image.
                    $('#' + data.useZoom + ' img').attr('src', event.data.data('relOpts').smallImage);
                    // Init a new zoom with the new images.				
                    $('#' + event.data.data('relOpts').useZoom).CloudZoom();
                    return false;
                });
                $(this).bind('click', $(this), function (event) {
                    return false;
                });
            }
        });
        return this;
    };

    $.fn.CloudZoom.defaults = {
        zoomWidth: 'auto',
        zoomHeight: 'auto',
        position: 'right',
        tint: false,
        tintOpacity: 0.5,
        lensOpacity: 0.5,
        softFocus: false,
        smoothMove: 3,
        showTitle: true,
        titleOpacity: 0.5,
        adjustX: 0,
        adjustY: 0
    };
