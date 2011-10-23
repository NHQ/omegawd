
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
				next()
				break;
			case 3: //location state
				req.card.state = host[0]
				next()
				break;
			case 4: //location city, state
				req.card.state = host[0];
				req.card.city = host[1]
				next()
				break;
			default:
				res.redirect('http://citizenmission.com')
				break;
				
		}
	}


app.get('/', vhost, function(req, res){
	console.log(req.card)
	if(Object.keys(req.card).length == 0){ // homepage
		res.render('index', {
	    title: 'Express'
	  });
	}
	else if(Object.keys(req.card).length == 1){ //state
		var state = req.card.state;
		var tags = _.map(trackmap.mapTags(state), function(k){
			return 'occupy'+k+':links';
		});
		client.zunionstore(state+':links', tags.length, tags, function(e,r){
			console.log(e||r);
			client.zrevrangebyscore(state+':links', '+inf', 3, function(e,r){
				console.log(e||r);
				res.render('links', {
			    title: 'Occupy Links:'+state,
					locals: {links: r}
			  });
			})
		})
	}
	
});

app.listen(80);
console.log("Express server listening on port %d", app.address().port);
