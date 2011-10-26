$(document).ready(function(){
	var newFeedChans = []
	function add (x){
		if(_.contains(newFeedChans,x)){
			return
		}
		else {
			$('#subs').append('<li id='+x+'>'+x+'</li>')
			newFeedChans.unshift(x)
		}
	};
	$('#new').submit(function(e){
		e.preventDefault();
		console.log($('#channel').value)
		add($('#channel').value)
	})
	$('.channy').click(function(e){
		add(this.id)
	})
})