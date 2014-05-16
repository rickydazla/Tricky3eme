/**
 * jQuery-retinaDisplay
 * Dual licensed under MIT and GPL.
 * Date: 03/09/2012
 * @author Gabriel Bull
 * @version 0.2
 *
 * https://github.com/gavroche/jquery-retinadisplay
 */
(function(e){var t={init:function(t){return this.each(function(){var t=!!navigator.userAgent.match(/Macintosh|Mac|iPhone|iPad/i)&&window.devicePixelRatio==2;var n=e(this).attr("data-retina-src");var r=false;var i=e(this);var s=function(e,t){var n=new XMLHttpRequest;n.open("HEAD",e,true);n.onreadystatechange=function(){if(n.readyState==4){if(n.status===200){r=true}else{r=false}t.call()}};n.send(null)};if(t){s(n,function(){if(r){i.attr("src",n)}})}})}};e.fn.retinaDisplay=function(n){if(t[n]){return t[n].apply(this,Array.prototype.slice.call(arguments,1))}else if(typeof n==="object"||!n){return t.init.apply(this,arguments)}else{e.error("Method "+n+" does not exist on jQuery.uploader")}}})(jQuery)
