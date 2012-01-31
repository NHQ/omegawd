var Editor = (function(){
	var self = this
	,		winX = window.innerWidth
	,		winY = window.innerHeight
	,		setW = (winX > 1200) ? 1200 : winX // 1200 pixel width 
	;
	
	if (!document.all) document.captureEvents(Event.MOUSEUP);
	
	$('#container').height(winY).width(setW).css({margin:'0 auto', 'background-color':'orange'})
	$('.text').height(100).width(setW/2).css({position: 'absolute', bottom: winY/2, right: winX/3, margin:'0 auto', 'background-color':'pink', 'overflow':'hidden'})
	
	this.events = {}
	this.events.mouseup = function(e){
		var t = '';
		t = (document.all) ? document.selection.createRange().text : document.getSelection();
		if(t && t.toString().length > 0){
			var m = $('.text').html().slice(t.focusOffset, t.anchorOffset)
		}
	};
	this.events.keyup = function(e){
		console.log($('.text').height())
		if(e.keyCode === 16){ // SHIFT
			var t = '';
			t = (document.all) ? document.selection.createRange().text : document.getSelection();
			if(t && t.toString().length > 0){
				// held SHIFT and high-lighted text
			}
		}
	}
	
	// register event listeners
	
	$(document).mouseup(self.events.mouseup)
	$(document).keyup(self.events.keyup)

	return this
}())

