if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) {
var viewportmeta = document.querySelectorAll('meta[name="viewport"]')[0];
if (viewportmeta) {
viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0';
document.body.addEventListener('gesturestart', function() {
viewportmeta.content = 'width=device-width, minimum-scale=0.25, maximum-scale=1.6';
}, false);
}
}

// Caroline Schnapp - current nav
$(function() {
  $('nav a').each(function() {
    if ($(this).attr('href')  ===  window.location.pathname) {
      $(this).addClass('current');
    }
  });
});

// Paul Irish - even box heights https://gist.github.com/917493
$(window).load(function() {
  $('div.unevenHeights').setAllToMaxHeight();
});

// Initiate jQuery tabs on product.liquid
$(function() {
	$( "#tabs" ).tabs();
});

// Custom checkboxes on product.liquid
$(function(){
	$('input').customInput();
	
	$('.toggle').each(function(){
		$('div:first',this).addClass('first');
		$('div:last',this).addClass('last');	
	}); 
	
});

// Custom checkboxes on product.liquid (this needs some work)
jQuery(document).ready(function($) {
	$('#buy-button').attr('disabled','disabled').addClass('disabled');
	$('.check').click(function(){
	    if (this.checked) {
	        $('#buy-button').removeAttr('disabled').removeClass('disabled')
	    }
	});
	$('.custom-checkbox > label').hover(
	  function () {
		$(this).siblings('span').appendTo('#variants ol').css("display","block");
	  },
	function () {
		$('ol > span.size-availability').insertAfter(this).css("display","none");
	  }
	);
});