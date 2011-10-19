var http = require('http'), fs = require('fs');

tags = JSON.parse(fs.readFileSync('./lib/tracklist.json'))

tags.forEach(subscribe)

function subscribe (tag){
		var spfdr = http.createClient(80, 'tumblr.superfeedr.com/track/'+tag);
		var dataw = "hubmode=subscribe&hub.verify=async&hub.callback=http://74.207.246.247:8001/feed";
		var request = spfdr.request('POST', '/hubbub', {
			'Host':'superfeedr.com',
			"Authorization":"basic TkhROmxvb3Bob2xl",
			'Accept':'application/json',
			'Content-Length': dataw.length
		});
		request.write(dataw, encoding='utf8');
		request.on('response', function (response){
			response.on('data', function (stuff){
				console.log(stuff.toString('utf8', 0, stuff.length))
			})
		})
		request.end();
};
