module.exports = function(glob){	
	var server = glob.connect();
		server.use(function (req,res){
			res.writeHead('200', {'Content-Type': 'text/html'});
			res.end('<h2>Boo!</h2>'+req.session.cookie.maxAge);
			delete glob;
			console.log(glob);
	});
	return server
};