
/**
 * Module dependencies.
 */

var express = require('express')
,		_ = require('underscore');

var app = module.exports = express.createServer();
app.listen(8808);

// Configuration

app.configure(function(){
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

var connections = [];

  
  app.get('/ping', function(req, res){
		connections.push(req.socket.remoteAddress)
		console.log(connections)
		var data = JSON.stringify({connections: connections})
		res.write(data);
		res.end()
  });

