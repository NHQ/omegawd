
/**
 * Module dependencies.
 */

var express = require('express')
,		_ = require('underscore');

var app = module.exports = express.createServer();
app.listen(8808);
console.log('http://localhost:8008');
var	io = require('socket.io').listen(app);
io.set('log level', 0);
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
		var data = JSON.stringigy({connections: connections})
		res.write(data);
  });

  io.sockets.on('connection', function (socket) {	
		
		socket.on('inform', function(meta){
			var meta = meta
			,		buff = new Buffer(meta.size) // alt = use blockcount * blocksize
			,		recd = 0
			,		expecting = meta.blockCount
			,		blockSize = meta.blockSize
			;
			console.log(meta)
			this.on(meta.name, function(data){
				++recd;
				var boofer = new Buffer(data[2])
				var uInt8Array = new Uint32Array(data[2])
				var data = new DataView(event.target.result);
				boofer.copy(buff, data[0])
				if(recd === expecting)
				console.log(recd, expecting, buff.toString('utf8'));
			})
			
			this.emit('copy:'+meta.name)
		});
		
  	socket.on('blob', function(i, data){
  		if(typeof data === 'object'){
  		}
  		if(Array.isArray(data)){
  			var buff = new Buffer(data[1]);
  			console.log(buff.toString('utf8'))

  	//		buff.writeUInt8(data, xeon - 1);
  	//		console.log(buff.toString('utf8', xeon, xeon + 1 ))
  		}
  		this.emit('conf', 'aye aye!')
  	});

  });

