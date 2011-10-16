module.exports = function(connect){
	var server = connect();
		server.use(connect.router(function(fap){
			
		}));
		server.use(function (req,res){
			res.writeHead('200', {'Content-Type': 'text/html'});
			res.end('<h2>Boo!</h2>'+req.session.cookie.maxAge);
	});
	return server
}; 