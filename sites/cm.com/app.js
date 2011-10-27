
/**
 * Module dependencies.
 */

var express = require('express')
,  jade = require('jade')
,  redis = require('redis')
,  trackmap = require('../../makeData.js')
,  _ = require('underscore')
,  fs = require('fs')
,  async = require('async');

var client = redis.createClient();

var app = module.exports = express.createServer();

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

app.get('/', function(req,res){
	res.redirect('/occupy')
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
	var otags = ['ows:hotlinks', 'occupy:hotlinks', '99:hotlinks', '99percent:hotlinks', 'occupywallstreet:hotlinks','occupywallst:hotlinks'];
	if(Object.keys(req.card).length == 0){ // homepage
		client.zunionstore('occupy:live', otags.length, otags, function(e,r){
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
			return 'occupy'+k+':hotlinks';
		});
		console.log(tags);
		if (state.toUpperCase().replace(/-/g, " ") == 'NEW YORK' || state.toUpperCase().replace(/-/g, " ") == 'NY'){tags.push('ows:hotlinks', 'occupywallstreet:hotlinks', 'occupywallst:hotlinks')}
		client.zunionstore(state+':hotlinks', tags.length, tags, function(e,r){
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

app.listen(80);
console.log("Express server listening on port %d", app.address().port);
