$(document).ready(function(){
	var Editor = (function(){
		

		var self = this
		,		winX = window.innerWidth
		,		winY = window.innerHeight
		,		setW = (winX > 1200) ? 1200 : winX // 1200 pixel width 
		,		last_height = 0
		,  	write_height = function(){ return $('.writer').height()}
		;
	
		if (!document.all) document.captureEvents(Event.MOUSEUP);
	
	//	$('#container').height(winY).width(setW)
	//	$('#text_box').height(winY/2).width(setW/2).css({right: winX/3, margin:'0 auto', 'background-color':'#eee'});
			var	jspAPI = jsp.data('jsp')
	//	$('.writer').css({position:'absolute', top: (winY/2)-150}).focus()
	//	$('.writer').focus()
		this.events = {}
	
	
		// helpers

		function fixScroll(){
//			console.log(write_height() - last_height)
			if(write_height() === last_height) return;
			if(write_height() > last_height){
				jspAPI.scrollToY(write_height() - last_height, false)
				jspAPI.reinitialise();

			}
			if(write_height() < last_height){
				jspAPI.scrollToY(write_height() - last_height, false)
				jspAPI.reinitialise();

			}
		}

		// jQ plug for paste events, courtesy http://www.mattbenton.net/2012/01/jquery-plugin-paste-events/

		$.fn.pasteEvents = function( delay ) {
		    if (delay == undefined) delay = 20;
		    return $(this).each(function() {
		        var $el = $(this);
		        $el.on("paste", function(e) {
		            $el.trigger("prepaste");
		            setTimeout(function() { $el.trigger("postpaste"); }, delay);
		        });
		    });
		};
	
	
	
		// EVENT HANDLERS
	
		this.events.mouseup = function(e){
			var t = '';
			t = (document.all) ? document.selection.createRange().text : document.getSelection();
			if(t && t.toString().length > 0){
				var m = $('.text').html().slice(t.focusOffset, t.anchorOffset)
			}
		};
		this.events.keydown = function(e){
			last_height = $('.writer').height();
//			console.log(e.keyCode)
			if(e.keyCode === 91) { // Mac COMMAND KEY
				
			}
		}
		this.events.keyup = function(e){
			function getSelectionStart(o) {
	    	if (o.createTextRange) {
	    		var r = document.selection.createRange().duplicate()
	    		r.moveEnd('character', o.value.length)
	    		if (r.text == '') return o.value.length
	    		return o.value.lastIndexOf(r.text)
	    	} else return o.selectionStart
	    }
	    var o = getSelectionStart(e.target)
//	    console.log('start', e.target.childNodes)
			// fix scroll re-init
			
			fixScroll()

			if(e.keyCode === 16){ // SHIFT
				var t = '';
				t = (document.all) ? document.selection.createRange().text : document.getSelection();
				if(t && t.toString().length > 0){
					// held SHIFT and high-lighted text
				}
			}
		};
		
		this.events.paste = function(e){
			
			// hack to remove copied styles
			//console.log('what')
			$('.writer').find('span, b, u, i').remove()
			$('.writer').find('p').attr('style','')
			fixScroll()
			
		};
		this.events.paste = function(e){
			last_height = last_height = $('.writer').height();
		}
		this.events.getDelta = function(e){
		
					var evt=window.event || e;
					var delta=evt.detail? evt.detail*(-120) : evt.wheelDelta
				
//					console.log(delta, $('.writer').height(), $('.writer').css('translateY'))
				
					if($('.writer').css('top') <= 0 && delta < 0 ) {$('.writer').css('translateY', '0'); return}
					if($('.writer').css('translateY') >=  ($('.writer').height() - $('#text_box').height()) && delta > 0 ) {$('.writer').css('translateY', $('.writer').height() - $('#text_box').height() ); return}

					else {
						if(delta < 0)
						$('.writer').css({
							translateY:'-='+Math.abs(delta)
						})
						if(delta > 0)
						$('.writer').css({
							translateY:'+='+delta / 2
						})					
					}

		}

		// register event listeners
	
		$(document).mouseup(self.events.mouseup)
		$(document).keyup(self.events.keyup)
		$(document).keydown(self.events.keydown)
//		$('.writer').bind('postpaste',self.events.paste).pasteEvents()
		var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
	//	document.addEventListener(mousewheelevt, self.events.getDelta, false)
	
	
		return this
	}())	
})

