$('#sidebar').hide();
$('#posts').hide();
$(window).load(function(e){
	var winx = window.innerWidth
	,		winy = window.innerHeight;
	$('#sidebar').css({
		'right': ((winx-$('body').width())/2)
	}).show(200)
	$('#posts').css({
		'left': ((winx-$('body').width())/2)
	}).show(200)
	tuner.init();
})
var tuner = Object.create(null);
tuner = {
	init: function(){		
		this.select();
		this.reg = new RegExp(/t.co/i);
		this.usr = new RegExp(/^@[a-z0-9_]*/i);
		this.regtag = new RegExp(/^#[a-z0-9]*/i)
		this.following = [];
		this.noRepeat = [];
		this.socket = io.connect('http://74.207.246.247:8008');
		this.socket.on('reconnect', function(){
			_.each(tuner.following, function(e){
				tuner.socket.emit('subscribe', e)
			})
		})
		this.socket.on('connect');
		this.socket.on('news', function(data){tuner.scrub(data)});
	},
	select: function(){
		$('#posts').isotope({
			itemSelector : '.post',
			layoutMode : 'straightDown',
			cellsByRow : {
				rowWidth: 600,
			},
			animationEngine: 'css',
			animationOptions: {
			     duration: 0,
			     queue: false
			   }
		});
		$('#links').change(function(){
			if(this.checked){
				$('#posts').isotope({ filter: '.links' });
			}
			else $('#posts').isotope({ filter: '' });
		});
			$('#next5').click(function(){
				$('#posts').scrollTop();
				tuner.display(5);
				this.style.visibility = 'hidden';  
				tuner.corral();
			});
			$('#count').click(function(){
				tuner.display(tuner.pen.length);
				this.style.visibility = 'hidden';
				$('#next5').css('visibility', 'hidden')
				tuner.corral();
			});
			$('#states').chosen().change(function(e,r){
				var selects = _.map($('#form').serializeArray(), function(e){return e.value});
				var sub = _.compact(_.difference(_.union(selects, tuner.following), tuner.following))
				var unsub = _.compact(_.difference(_.union(selects, tuner.following), selects))
				tuner.following = selects;
				console.log(selects, sub, unsub)
				// store.set("states", following) broken
				if(sub.length){
					tuner.socket.emit('subscribe', sub[0])
				}
				if(unsub.length){
					console.log(unsub);
					tuner.socket.emit('unsubscribe', unsub[0])
				}
			});
		$('#cities').chosen().change(function(e,r){
			var selects = _.map($('#form').serializeArray(), function(e){return e.value});
			var sub = _.compact(_.difference(_.union(selects, tuner.following), tuner.following))
			var unsub = _.compact(_.difference(_.union(selects, tuner.following), selects))
			tuner.following = selects;
			// store.set("cities", following) broken
			console.log(selects, sub, unsub)

			if(sub.length){
				tuner.socket.emit('subscribe', sub[0])
			}
			if(unsub.length){
				console.log(unsub);
				tuner.socket.emit('unsubscribe', unsub[0])
			}
		});
		$('#occupy').change(function(e,r){
			var selects = _.map($('#form').serializeArray(), function(e){return e.value});
			var sub = _.compact(_.difference(_.union(selects, tuner.following), tuner.following))
			var unsub = _.compact(_.difference(_.union(selects, tuner.following), selects))
			tuner.following = selects;
			// store.set("occupy", following) broken

			if(sub.length){
				tuner.socket.emit('subscribe', sub[0])
			}
			if(unsub.length){
				tuner.socket.emit('unsubscribe', unsub[0])
			}
		});
	},
	spfrd: function(data){
		var txt = data.summary ? data.summary : data.content;
		var pic = data.pic;
		var link = function(){if (data.link.length < 110){return data.link} else return data.link.slice(0,110)+' ...'};
		var source = link.slice(0,link.indexOf())
		var html = 	'<li class="post links"><h3 class="title">'+data.title+'</h3>Link: <a href='+link+' target="_blank" class="link">'+link.slice(0,51)+' ...'+'</a></li>';
		this.corral(html)
		//$('ul#post').prepend(html);
	},
	twtr: function(data){
		var links = data.links.length ? 'links' : '';
		var text = data.txt.split(" ");
		var txt = _.map(text, function(e){
				if(this.reg.test(e)){
					return '<a class="link" href='+e+' target="_blank">'+e+'</a>'
				} 
				else if(this.usr.test(e)){
					e = e.slice(0,e.indexOf(':'))
					return '<a class="user" href=http://twitter.com/#!/'+e.slice(1)+' target="_blank">'+e+'</a>'
				}
				else if(this.regtag.test(e.toLowerCase())) {
					return '<span class="redness"><i>'+e.toUpperCase()+'</i></span>'
				}
				else return e
			}, this).join(" ")
			var cut = data.pic.indexOf("_normal");
			var pic = data.pic.slice(0, cut)+data.pic.slice(cut+7);
			var html = 	'<div class="post '+links+'"><div class="picFrame"><a href='+data.home+' target="_blank">';
					html += '<img class="thumb" src='+pic+'></a></div><div class="txt"><p>'+txt+'</p></div></div>';
			this.corral(html)
			//$('ul#post').prepend(html);
	},
	scrub: function(datum){
		var data = JSON.parse(datum);
		if(_.include(this.noRepeat, data.body._id)){
			return
		}
		else {
			if(data.source === 'twtr'){
				this.twtr(data.body)
			}
			else if(data.source === 'spfdr'){
				this.spfdr(data.body)
			}
			this.noRepeat.unshift(data.body._id);
			this.noRepeat.splice(500, this.noRepeat.length+1)
		}
	},
	pen: [],
	display: function(count){
		var display = this.pen.splice(this.pen.length - count, this.pen.length);
		console.log(display.length)
		display.forEach(function(html){
			$('#posts').prepend($(html))
			.isotope( 'reloadItems' ).isotope({ sortBy: 'original-order' });			
		})
		$('body').scrollTop(0)
	},
	corral: function(html){
		if(html){
			this.pen.unshift(html);			
		}
		if(this.pen.length > 4){
			$('#next5').css('visibility', 'visible')
		}
		if(this.pen.length){
			$('#count').html('Display '+this.pen.length+' New').css('visibility', 'visible');
		}
	}
}
