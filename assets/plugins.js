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
