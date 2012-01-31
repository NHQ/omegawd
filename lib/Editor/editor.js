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
	
		// EVENT HANDLERS
	
		this.events.mouseup = function(e){
			var t = '';
			t = (document.all) ? document.selection.createRange().text : document.getSelection();
			if(t && t.toString().length > 0){
				var m = $('.text').html().slice(t.focusOffset, t.anchorOffset)
			}
		};
		
		this.events.keyup = function(e){
			console.log(write_height())
			jspAPI.reinitialise()
	//		var t = $('#text_box').css('right');
	//		console.log(t)
	//		$('#text_box').css({translateX:'+=13'})
			if(e.keyCode === 16){ // SHIFT
				var t = '';
				t = (document.all) ? document.selection.createRange().text : document.getSelection();
				if(t && t.toString().length > 0){
					// held SHIFT and high-lighted text
				}
			}
		};
		
		this.events.getDelta = function(e){
		
					var evt=window.event || e;
					var delta=evt.detail? evt.detail*(-120) : evt.wheelDelta
				
					console.log(delta, $('.writer').height(), $('.writer').css('translateY'))
				
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
		var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
	//	document.addEventListener(mousewheelevt, self.events.getDelta, false)
	
		return this
	}())	
})

