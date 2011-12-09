/*
[OF, BY, FOR] The People
mysql root@localhost:sqlcity2020
*/


/**
 * Module dependencies.
 */

var express = require('express')
,  jade = require('jade')
,  redis = require('redis')
,  trackmap = require('../../makeData.js')
,  _ = require('underscore')
,  fs = require('fs')
,  async = require('async')
,	 live = require('../live/app')
,	 RedisStore = require('connect-redis')(express)
;

var client = redis.createClient();

var app = module.exports = express.createServer();
app.listen(80);
client.del('syndicate', redis.print)
console.log("Express server listening on port %d", app.address().port);
//console.log(Object.keys(Object)); // intro spection
var	io = require('socket.io').listen(app);
io.set('log level', 3);


// Configuration

app.configure(function(){
//	app.use(express.profiler());
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

	function vhost (req,res,next){
		req.card = {};
		var host = req.headers.host.split(".")
		switch (host.length)
		{
			case 2:
				if(host[0] != 'citizenmission'){
					res.redirect('http://nationalheadquarter.org')
				}
				else
				next()
				break;
			case 3: //location state
				req.card.state = host[0].replace(/-/g, " ");
				next()
				break;
			case 4: //location city, state
				req.card.state = host[1].replace(/-/g, " ");
				req.card.city = host[0].replace(/-/g, " ");
				next()
				break;
			default:
				res.redirect('http://citizenmission.com')
				break;
				
		}
	}
app.get('/post', vhost, function(req,res){
  res.render('post', {
    layout:false,
    title: 'Posit'
  })
})
app.get('/', vhost, function(req,res){
	res.redirect('/occupy')
})
app.get('/occupy/live', vhost, function(req,res){
	res.render('live', {
		layout: false,
    title: 'Express',
		states: Object.keys(trackmap.states),
		cities: Object.keys(trackmap.tagCity).sort()
  });
})
app.get('/superfeedr', vhost, function(req,res){
  res.render('spfdr', {
		layout: false,
    title: 'Express',
		states: Object.keys(trackmap.states),
		cities: Object.keys(trackmap.tagCity).sort()
  });
})

app.get('/superfeedr/:tag', function(req,res){
	client.zrevrangebyscore(req.params.tag+':superlinks', '+inf', 0, function(e,r){
		res.render('links', {
			title: 'Results for superfeedr.com/track/'+req.params.tag+'&tumblr&-twitter.com&-twitter&-t.co&-wikipedia.org',
			locals: {
				links:r
			}
		})
	})
})

app.get('/occupy', vhost, function(req, res){
	console.log(req.card)
	var otags = ['ows:hotlinks', 'occupy:hotlinks', '99:hotlinks', '99percent:hotlinks', 'occupywallstreet:hotlinks','occupywallst:hotlinks', 'generalstrike:hotlinks'];
	if(Object.keys(req.card).length == 0){ // homepage
		client.zunionstore(['occupy:live', otags.length].concat(otags), function(e,r){
			console.log(e,r)
			client.zrevrangebyscore('occupy:live', '+inf', 11, function(e,r){
				res.render('links', {
			    title: 'Occupy Links:',
					locals: {links: r}
			  });
			})
		})
	}
	else if(Object.keys(req.card).length == 1){ //state or city
		var state = req.card.state;
		var tags = _.map(trackmap.mapTags(state), function(k){
			return k+':hotlinks';
		});
		console.log(tags);
		if (state.toUpperCase().replace(/-/g, " ") == 'NEW YORK' || state.toUpperCase().replace(/-/g, " ") == 'NY'){tags.push('ows:hotlinks', 'occupywallstreet:hotlinks', 'occupywallst:hotlinks')}
		client.zunionstore([state+':hotlinks', tags.length].concat(tags), function(e,r){
			console.log(e,r)
			client.zrevrangebyscore(state+':hotlinks', '+inf', 1, function(e,r){
				res.render('links', {
			    title: 'Occupy Links:'+state,
					locals: {links: r} // links going in as json, needs fix, use one link not array
			  });
			})
		})
	}
});



var spfdr = io.of('/spfdr').
  on('connection', function(socket){
    var	index = redis.createClient();
    var socket = socket;
    console.log('connected', socket.id || socket._id);
    spfdr.emit('data', {txt:'connected'});
    socket.emit('data', {txt:'connected'});
    socket.on('data', function(data){  
      console.log(data);
//    zcard(key), zrevrangebyscore(max, min, withscores), zrank(member), zscore(member)
//    data = {command:[key,[values]]}
    var target = data.target || null;
    index[data.command](data.$et, function(err, data){
      spfdr.emit('data', [err, data, target])
    })
    

    })
  });

var occupy = io.of('/theoccupation').on('connection', function (socket) {
	var	client = redis.createClient()
	,		index = redis.createClient();
	socket.synd = redis.createClient();
	socket.subs = [];
//	console.log(socket);
	
	socket.on('disconnect', function(data){
    console.log(data, 'disconnected');
		_.each(socket.subs, function(e){
			this.leave(e.toLowerCase());
			index.zincrby('syndicate', -1, e, function(err,r){
				console.log(r);
				if (r == 0){	
					console.log('unsubbin');
					client.unsubscribe(e);
				}
			})
		}, this)
	})
	socket.on('post', function(post){
		var tags = _.map(trackmap.mapTags(post.state), function(k){
			return k+':pub';
		});
	})
	
	socket.on('subscribe', function(data){
		if(data.toLowerCase() == 'occupy'){
			
			tags = ['occupy:pub', 'ows:pub', '99percent:pub', 'occupywallst:pub', 'occupywallstreet:pub', 'generalstrike:pub'];
	
			_.each(tags, function(e){
				this.subs.push[e];
				this.join(e.toLowerCase());
				index.zincrby('syndicate', 1, e, function(err,r){
					console.log(r);
					if (r == 1){	
						console.log('subbin');
						client.subscribe(e);
					}
				})
			},this)
		}
		else {
			
			var tags = _.map(trackmap.mapTags(data), function(k){
				return k+':pub';
			});	
			
			_.each(tags, function(e){
				this.subs.push[e];
				this.join(e.toLowerCase());
				index.zincrby('syndicate', 1, e, function(err,r){
					console.log(r);
					if (r == 1){	
						console.log('subbin');
						client.subscribe(e);
					}
				})
			},this)
		}
	});

	socket.on('unsubscribe', function(data){
		console.log(data);
		if(data.toLowerCase() == 'occupy'){
		
			tags = ['occupy:pub', 'ows:pub', '99percent:pub', 'occupywallst:pub', 'occupywallstreet:pub', 'generalstrike:pub']
		
			_.each(tags, function(e){
				this.subs = _.without(this.subs, e);
				this.leave(e.toLowerCase());
				index.zincrby('syndicate', -1, e, function(err,r){
					console.log(r);
					if (r == 0){	
						console.log('unsubbin');
						client.unsubscribe(e);
					}
				})
			},this)
		}
		
		else {
			
			var tags = _.map(trackmap.mapTags(data), function(k){
				return k+':pub';
			});

			_.each(tags, function(e){
				this.subs = _.without(this.subs, e);
				this.leave(e.toLowerCase());
				index.zincrby('syndicate', -1, e, function(err,r){
					console.log(r);
					if (r == 0){	
						console.log('unsubbin');
						client.unsubscribe(e);
					}
				})
			},this)
		}

	});
	client.on('subscribe', function(channel, count){
		console.log('sub', channel, count)
	});
	client.on('unsubscribe', function(channel, count){
		console.log('unsub', channel, count)
	})
	client.on('message', function (channel, message) {
		console.log(channel, message.slice(0,100))
//			socket.emit('news', message);
		io.sockets.in(channel).emit('news', message)
//		socket.broadcast.to(channel).emit('news', message) // can add channel to the emittance
	});
	
});


