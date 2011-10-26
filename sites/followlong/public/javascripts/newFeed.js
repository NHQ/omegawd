$(document).ready(function(){
	var newFeedChans = []
	function add (x){
		if(_.contains(newFeedChans,x)){
			return
		}
		else {
			$('ul#sub').append('<li id='+x+'>'+x+'</li>')
			newFeedChans.push(x);
			console.log(x)
		}
	};
	$('#new').submit(function(e){
		e.preventDefault();
		add($('#channel').val())
	})
	$('.channy').click(function(e){
		add(this.id)
	})
	$('#save').click(function(){
		$.post('/followFeed', {
			feed : window.location.search.slice(6),
			channels : newFeedChans
		})
	})
})