module.exports = function vhost(hostname, subs, _, server){
  if (!hostname) throw new Error('vhost hostname required');
  if (!server) throw new Error('vhost server required');
  var regexp = new RegExp('^' + hostname.replace(/[*]/g, '(.*?)') + '$', 'i');
  if (server.onvhost) server.onvhost(hostname);
  return function vhost(req, res, next){
    if (!req.headers.host) return next();
    var host = req.headers.host.split(':')[0], sub;
		if (host == hostname){
			req.subdomains = false;
			server.emit('request', req, res, next);
		}
		else if((sub = host.substr(0, host.indexOf('.'+hostname)))&&(_.contains(subs, sub))){
			//it's a registered subomain
			req.subdomain = sub;
			server.emit('request', req, res, next);
		}
		else {
      next();
    }
  };
};