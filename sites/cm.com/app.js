/*
[OF, BY, FOR] The People
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
app.listen(8101, '127.0.0.1');
client.del('syndicate', redis.print)
//console.log("Express server listening on port %d", app.address().port);
var	io = require('socket.io').listen(8102);
io.set('log level', 0);


// Configuration

app.configure(function(){
	app.use(express.profiler());
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

app.get('/', vhost, function(req,res){
	res.redirect('/links')
})
app.get('/occupy/live', vhost, function(req,res){
	res.render('live', {
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

app.get('/links', vhost, function(req, res){
	var otags = ['ows:hotlinks', 'occupy:hotlinks', '99:hotlinks', '99percent:hotlinks', 'occupywallstreet:hotlinks','occupywallst:hotlinks', 'generalstrike:hotlinks'];
	if(Object.keys(req.card).length == 0){ // homepage
		client.zunionstore(['occupy:live', otags.length].concat(otags), function(e,r){
//			console.log(e,r)
			client.zrevrangebyscore('occupy:live', '+inf', 11, function(e,r){
				res.render('links', {
			    title: 'Live Links: ',
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
		if (state.toUpperCase().replace(/-/g, " ") == 'NEW YORK' || state.toUpperCase().replace(/-/g, " ") == 'NY'){tags.push('ows:hotlinks', 'occupywallstreet:hotlinks', 'occupywallst:hotlinks')}
		client.zunionstore([state+':hotlinks', tags.length].concat(tags), function(e,r){
	//		console.log(e,r)
			client.zrevrangebyscore(state+':hotlinks', '+inf', 1, function(e,r){
				res.render('links', {
			    title: 'Occupy Links:'+state,
					locals: {links: r} // links going in as json, needs fix, use one link not array
			  });
			})
		})
	}
});


io.sockets.on('connection', function (socket) {
	var	client = redis.createClient()
	,		index = redis.createClient();
	socket.synd = redis.createClient();
	socket.subs = [];
	
	socket.on('disconnect', function(){
		_.each(socket.subs, function(e){
			this.leave(e.toLowerCase());
			index.zincrby('syndicate', -1, e, function(err,r){
				if (r == 0){	
	//				console.log('unsubbin');
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
					if (r == 1){	
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
					if (r == 1){	
						client.subscribe(e);
					}
				})
			},this)
		}
	});

	socket.on('unsubscribe', function(data){
		if(data.toLowerCase() == 'occupy'){
		
			tags = ['occupy:pub', 'ows:pub', '99percent:pub', 'occupywallst:pub', 'occupywallstreet:pub', 'generalstrike:pub']
		
			_.each(tags, function(e){
				this.subs = _.without(this.subs, e);
				this.leave(e.toLowerCase());
				index.zincrby('syndicate', -1, e, function(err,r){
					if (r == 0){	
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
					if (r == 0){	
						client.unsubscribe(e);
					}
				})
			},this)
		}

	});
	client.on('subscribe', function(channel, count){
	});
	client.on('unsubscribe', function(channel, count){
	})
	client.on('message', function (channel, message) {
//			socket.emit('news', message);
		io.sockets.in(channel).emit('news', message)
//		socket.broadcast.to(channel).emit('news', message) // can add channel to the emittance
	});
	
});


