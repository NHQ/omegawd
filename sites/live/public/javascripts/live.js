
$(document).ready(function(e){
	function append (datum){
		var data = JSON.parse(datum);
		var text = data.txt.split(" ");
		var txt = _.map(text, function(e){
				if(reg.test(e)){
					return '<a href='+e+'>'+e+'</a>'
				} 
				else if(usr.test(e)){
					return '<a href=http://twitter.com/#!/'+e.slice(1)+'>'+e+'</a>'
				}
				else return e
			}).join(" ")
			var cut = data.pic.indexOf("_normal");
			var pic = data.pic.slice(0, cut)+data.pic.slice(cut+7);
		var html = 	'<li class="post"><div class="img"><a href='+data.home+'><img class="thumb" src='+pic+'></a></div></div class="txt"><p>'+txt+'</p></div></li>';
				$('ul#post').prepend(html);
	}
//	var socket = io.connect('http://127.0.0.1:8008');
	var socket = io.connect('http://74.207.246.247:8008');

  socket.on('news', function (data) {
		append(data);
  });

// initish

	var reg = new RegExp(/t.co/i), usr = new RegExp(/@[a-z0-9_]*/i);

		// local store load
	var following = {};
	following.states = store.get("states") || [];
	following.cities = store.get("cities") || []
	
	
	socket.on('connect', function(){
		selectors();
		if(following.states.length){
			following.states.forEach(function(e){
				socket.emit('subscribe', e)
				$('#'+e).selected = true;
			})
		}
		if(following.states.length){
			following.cities.forEach(function(e){
				socket.emit('subscribe', e)
				$('#'+e).selected = true;
			})
		}
	})



	function selectors (){	
			$('#states').chosen().change(function(e,r){
			var selects = _.map($('#form').serializeArray(), function(e){return e.value});
			var sub = _.compact(_.difference(_.union(selects, following), following))
			var unsub = _.compact(_.difference(_.union(selects, following), selects))
			following = selects;
			store.set("states", following)
			if(sub.length){
				socket.emit('subscribe', sub[0])
			}
			if(unsub.length){
				socket.emit('unsubscribe', unsub[0])
			}
	
		});
		$('#cities').chosen().change(function(e,r){
			var selects = _.map($('#form').serializeArray(), function(e){return e.value});
			var sub = _.compact(_.difference(_.union(selects, following), following))
			var unsub = _.compact(_.difference(_.union(selects, following), selects))
			following = selects;
			store.set("cities", following)

			if(sub.length){
				socket.emit('subscribe', sub[0])
			}
			if(unsub.length){
				socket.emit('unsubscribe', unsub[0])
			}

		});
	}selectors();
})



