
$(window).load(function(e){
	var reg = new RegExp(/t.co/i), usr = new RegExp(/^@[a-z0-9_]*/i);
	var following = [];
	var winx = window.innerWidth
	,		winy = window.innerHeight;
	var $container = $('#post');
	
	
	$('#sidebar').css({
		'right': ((winx-$('body').width())/2)
	})
	$('#post').css({
		'left': ((winx-$('body').width())/2)
	})
	following.states = store.get("states") || [];
	following.cities = store.get("cities") || []
/*	
	$container.isotope({
		getSortData:{
      type : function ( $elem ) {
    return parseInt( $elem.attr('data-type'));
  },
	  layoutMode : 'cellsByColumn',
	  cellsByRow : {
	    columnWidth : 600,
	    rowHeight : 150
	  },
		animationOptions: {
	     duration: 333,
	     easing: 'linear',
	     queue: false
	   }
	});
*/	
	function selectors (){	
			$('#states').chosen().change(function(e,r){
			var selects = _.map($('#form').serializeArray(), function(e){return e.value});
			var sub = _.compact(_.difference(_.union(selects, following), following))
			var unsub = _.compact(_.difference(_.union(selects, following), selects))
			following = selects;
			// store.set("states", following) broken
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
			// store.set("cities", following) broken

			if(sub.length){
				socket.emit('subscribe', sub[0])
			}
			if(unsub.length){
				socket.emit('unsubscribe', unsub[0])
			}

		});
		$('#occupy').change(function(e,r){
			var selects = _.map($('#form').serializeArray(), function(e){return e.value});
			var sub = _.compact(_.difference(_.union(selects, following), following))
			var unsub = _.compact(_.difference(_.union(selects, following), selects))
			following = selects;
			// store.set("occupy", following) broken

			if(sub.length){
				socket.emit('subscribe', sub[0])
			}
			if(unsub.length){
				socket.emit('unsubscribe', unsub[0])
			}

		});
	}selectors();
	function scrub (datum){
		var data = JSON.parse(datum);
		if(data.source == 'twtr'){
			twtr(data.body)
		}
		if(data.souce == 'spfdr'){
			spfdr(data.body)
		}
	}
	function spfdr (data){
		var txt = data.summary ? data.summary : data.content;
		var pic = data.pic;
		var link = data.link;
		var html = 	'<li class="post"><div class="img"><a href='+link+'><img class="thumb" src='+pic+'></a></div></div class="txt"><p>'+txt+'</p></div><br /><a href='+link+' class="linkTitle">'+data.title+'</a></li>';
		$('ul#post').prepend(html);
	}
	function twtr (data){
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
		scrub(data);
  });

// initish

	socket.on('connect', function(){
		/*
		if(following.states.length){
			following.states.forEach(function(e){
				socket.emit('subscribe', e)
				$('#'+e.toUpperCase()).select;
				console.log(e)
			})
		}
		if(following.cities.length){
			following.cities.forEach(function(e){
				socket.emit('subscribe', e)
				$('#'+e.toUpperCase()).select;
				$('#'+e).selected = true;
				console.log(e)
				
			})
		}
		*/
	})
})



