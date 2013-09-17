(function($){
	var styledRadios = function(options,mainSelectElement){
		var settings = {
			Product : null,
			VariantSelectedCallBack : function(){},
            SelectFirstAvailableVariant: false,
			OnLoadCallBack:function(){},
			OptionWrapper:$('<ol class="styled-radio-wrapper"/>'),
			VariantOptionWrapper:$('<li class="custom-radio"/>')
		};

		settings = $.extend(settings, options);

		var _MainSelectElement = mainSelectElement;
		var _MainSelectID = _MainSelectElement.attr('id');
		var _ProductObj = null;
		var _OptionNames = settings.Product.product.options || [];
		var _GeneratedRadiosWrapper = [];

		var Initialize = function(){
			_ProductObj = new Helpers.MapJsonObj(settings.Product.product);
			Methods.ReplaceSelector();
		};
		

		var Methods = {
			ReplaceSelector:function(){
				var parent = _MainSelectElement.parent();
				var radios = Methods.BuildRadios();
				parent.append(radios);
				settings.SelectFirstAvailableVariant ? Methods.SelectFirstAvailableVariant() : $('label', _GeneratedRadiosWrapper[0]).trigger('click');
				settings.OnLoadCallBack();
			},
			BuildRadios:function(){
				for(var i=0;i < _OptionNames.length;i++){
					var radioWrapper = Methods.GenerateRadioElements(i, _OptionNames[i], Helpers.GetOptionValues(i));
					_GeneratedRadiosWrapper.push(radioWrapper);
					$(_MainSelectElement.parent()).append(radioWrapper);
				}
                
			},
			GenerateRadioElements:function(index, name, values){
			  var variantWrapper = settings.OptionWrapper.clone();
			  for (var i = 0; i < values.length; i++) {
			  	var radioWrapper = settings.VariantOptionWrapper.clone();
				var radio = $('<input id="Radio_'+values[i].trim()+'" type="radio" value="'+ values[i] +'" name="'+name+'"/>');
				var label = $('<label for="Radio_'+values[i].trim()+'">'+values[i]+'</label>');
				label.bind('click', function(){
					var parent = $(this).parent();
					var input = $('input', parent);
					$('input[name="'+input.attr('name')+'"]').removeClass('checked');
					input.addClass('checked');
					Methods.UpdateMainSelectElementValueAndCallback();
				});
				radio.bind('click', function(){ 
					$('label[for="'+$(this).attr('id')+'"]').trigger('click');
				});
				radioWrapper.append(radio, label);
				variantWrapper.append(radioWrapper);
			  }
			  variantWrapper.attr({'id': _MainSelectID + '-radios-' + index, 'data-option':name});
			  return variantWrapper;
			},
			UpdateMainSelectElementValueAndCallback:function(){
				var variant = Methods.GetVariant(Methods.GetSelectedValues());
				if(variant){
					_MainSelectElement.removeAttr('disabled');
					_MainSelectElement.val(variant.id);
				}else{
					_MainSelectElement.attr('disabled','disabled');
				}
				settings.VariantSelectedCallBack(variant, Utilities);
			},
			GetSelectedValues:function(){
			  var currValues = [];
			  $(_GeneratedRadiosWrapper).each(function(){
			  	var value = $('input[name="'+$(this).attr('data-option')+'"].checked').val();
			  	currValues.push(value);
			  });
			  return currValues;
			},
			GetVariant:function(selectedValues) {
			  var found = null;
			  if (selectedValues.length != _OptionNames.length) {
				return found; 
			  }

			  $(_ProductObj.variants).each(function(index, variant){
				var satisfied = true;
				for (var j = 0; j < selectedValues.length; j++) {
				  var option_col = "option"+(j+1);
				  if (variant[option_col] != selectedValues[j]) {
					satisfied = false;
				  }
				}
				if (satisfied == true) {
				  found = variant;
				  return;
				}
			  });
			  return found;
			},
			SelectFirstAvailableVariant:function(){
                var availableFirstVariantOption = null;
                $(_ProductObj.variants).each(function(index, variant){
                    if(variant.available){
                        availableFirstVariantOption = variant.options;
                        return false;
                    }
                });
                if(availableFirstVariantOption){
                    for (var i = 0; i < _GeneratedRadiosWrapper.length; i++) {
        			    $('label', _GeneratedRadiosWrapper[i]).each(function(index){
                            var optionVal = $(this).text();
                            if(optionVal == availableFirstVariantOption[i]){
                                $(this).trigger('click');
                            }
        			    });
    			    }
                }
            },
		};

		var Helpers = {
			MapJsonObj:function(json){
				if(json != 'undefined'){
					for (property in json) {
						this[property] = json[property];
					}
				}
			},
			GetOptionNames:function(obj){
				return Object.prototype.toString.call(obj).slice(8, -1);
			},
			GetOptionValues:function(index) {
			  if (!_ProductObj.variants) { 
				return null;
			  }
			  var results = Helpers.Map(_ProductObj.variants, function(e) {
				var option_col = "option" + (index+1);
				return (e[option_col] == undefined) ? null : e[option_col];
			  });
			  return (results[0] == null ? null : Helpers.Unique(results));
			},
			Map:function(ary, callback) {
			  var result = [];
			  for (var i = 0; i < ary.length; i++) {
				result.push(callback(ary[i], i));
			  }
			  return result;
			},
			Unique:function(ary) {
			  var result = [];
			  for (var i = 0; i < ary.length; i++) {
				if (!Helpers.ArrayIncludes(result, ary[i])) { 
					result.push(ary[i]); 
				}
			  }
			  return result;
			},
			ArrayIncludes:function(ary, obj) {
			  for (var i = 0; i < ary.length; i++) {
				if (ary[i] == obj) {
				  return true;
				}
			  }
			  return false;
			}
	
		};

		var Utilities = {
			MoneyFormat:"$ {{amount}}",
			FormatMoney:function(cents, format) {
			  if (typeof cents == 'string') cents = cents.replace('.','');
			  var value = '';
			  var patt = /\{\{\s*(\w+)\s*\}\}/;
			  var formatString = (format || Utilities.MoneyFormat);

			  function addCommas(moneyString) {
				return moneyString.replace(/(\d+)(\d{3}[\.,]?)/,'$1,$2');
			  }

			  switch(formatString.match(patt)[1]) {
				  case 'amount':
					value = addCommas(this.FloatToString(cents/100.0, 2));
					break;
				  case 'amount_no_decimals':
					value = addCommas(this.FloatToString(cents/100.0, 0));
					break;
				  case 'amount_with_comma_separator':
					value = this.FloatToString(cents/100.0, 2).replace(/\./, ',');
					break;
				  case 'amount_no_decimals_with_comma_separator':
					value = addCommas(this.FloatToString(cents/100.0, 0)).replace(/\./, ',');
					break;
			  }
			  return formatString.replace(patt, value);
			},
			FloatToString:function(numeric, decimals) {  
			  var amount = numeric.toFixed(decimals).toString();  
			  if(amount.match(/^\.\d+/)) {
				return "0"+amount; 
			  }
			  else{ 
				return amount; 
			  }
			}
		};

		Initialize();

	};

	$.fn.StyledRadios = function(options){
		return new styledRadios(options,$(this));
	};

})(jQuery);