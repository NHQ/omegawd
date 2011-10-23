
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

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
	app.use(function(req,res,next){
		function vhost (str){
			req.card = {}
			var host = req.header.host.split(".")
			switch host.length
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
		
		req.subdomain = req.headers.host.slice(0, req.headers.host.indexOf(.))
		console.log(req.subdomain);
		next()
	})
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

app.get('/', function(req, res){
	if(Object.keys(req.card).length < 1){ // homepage
		
	}
	
  res.render('index', {
    title: 'Express'
  });
});

app.get()

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
