$(window).load(function(e){
	var winx = window.innerWidth
	,		winy = window.innerHeight;
	var $container = $('#post');
	
	
	$('#sidebar').css({
		'right': ((winx-$('body').width())/2)
	})
	$('#post').css({
		'left': ((winx-$('body').width())/2)
	})
	tuner.init();
})
var tuner = Object.create(null);
tuner = {
	init: function(){
		this.reg = new RegExp(/t.co/i);
		this.usr = new RegExp(/^@[a-z0-9_]*/i);
		this.following = [];
		this.select();
		this.socket = io.connect('http://74.207.246.247:8008');
		this.socket.on('connect');
		this.socket.on('news', function(data){this.scrub(data)});
	},
	select: function(){
			$('#states').chosen().change(function(e,r){
				var selects = _.map($('#form').serializeArray(), function(e){return e.value});
				var sub = _.compact(_.difference(_.union(selects, tuner.following), tuner.following))
				var unsub = _.compact(_.difference(_.union(selects, tuner.following), tuner.selects))
				following = selects;
				// store.set("states", following) broken
				if(sub.length){
					tuner.socket.emit('subscribe', sub[0])
				}
				if(unsub.length){
					tuner.socket.emit('unsubscribe', unsub[0])
				}
			});
		$('#cities').chosen().change(function(e,r){
			var selects = _.map($('#form').serializeArray(), function(e){return e.value});
			var sub = _.compact(_.difference(_.union(selects, tuner.following), tuner.following))
			var unsub = _.compact(_.difference(_.union(selects, tuner.following), tuner.selects))
			following = selects;
			// store.set("cities", following) broken

			if(sub.length){
				tuner.socket.emit('subscribe', sub[0])
			}
			if(unsub.length){
				tuner.socket.emit('unsubscribe', unsub[0])
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
	},
	spfrd: function(data){
		var txt = data.summary ? data.summary : data.content;
		var pic = data.pic;
		var link = function(){if (data.link.length < 110){return data.link} else return data.link.slice(0,110)+' ...'};
		var source = link.slice(0,link.indexOf())
		var html = 	'<li class="post"><h3 class="title">'+data.title+'</h3>Link: <a href='+link+' target="_blank" class="link">'+link.slice(0,51)+' ...'+'</a></li>';
		this.corral(html)
		//$('ul#post').prepend(html);
	},
	twtr: function(data){
		var text = data.txt.split(" ");
		var txt = _.map(text, function(e){
				if(this.reg.test(e)){
					return '<a href='+e+' target="_blank">'+e+'</a>'
				} 
				else if(this.usr.test(e)){
					return '<a href=http://twitter.com/#!/'+e.slice(1)+' target="_blank">'+e+'</a>'
				}
				else return e
			}).join(" ")
			var cut = data.pic.indexOf("_normal");
			var pic = data.pic.slice(0, cut)+data.pic.slice(cut+7);
			var html = 	'<li class="post"><div class="img"><a href='+data.home+' target="_blank">';
					html += '<img class="thumb" src='+pic+'></a></div></div class="txt"><p>'+txt+'</p></div></li>';
			this.corral(html)
			//$('ul#post').prepend(html);
	},
	scrub: function(datum){
		
		var data = JSON.parse(datum);
		if(data.source === 'twtr'){
			this.twtr(data.body)
		}
		else if(data.source === 'spfdr'){
			this.spfdr(data.body)
		}
	},
	pen: [],
	display: function(count){
		var display = this.pen.splice(this.pen.length-count, this.pen.length);
		display.forEach(function(html){
			$('ul#post').prepend(html);
		})
	},
	corral: function(html){
		this.pen.unshift(html);
		if(this.pen.length > 4){
			$('#next5').css('visibility', 'visible').click(function(){tuner.display(5);this.style.visibility = 'hidden'})
		}
		if(this.pen.length > 4){
			$('#count').html('Display All '+this.pen.length+'New').css('visibility', 'visible').click(function(){tuner.display(this.pen.length);this.style.visibility = 'hidden'})
		}
	}
}
