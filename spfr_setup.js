var http = require('http'), fs = require('fs');

var buff = new Buffer('citizen:peapod2011').toString('base64')

var tags = JSON.parse(fs.readFileSync('./lib/tracklist.json'))
var tats = ['ows']
tats.forEach(subscribe)

function subscribe (tag){
		var spfdr = http.createClient(80, 'superfeedr.com');
		var dataw = "hub.mode=subscribe&hub.verify=async&hub.topic=http://tumblr.superfeedr.com/track/"+tag+"&hub.callback=http://74.207.246.247:8001/feed";
		var request = spfdr.request('POST', '/track/ows', {
			'Host':'tumblr.superfeedr.com',
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