var request = require('request')
var uid = new Buffer('astromanies:michaeljackson2009', encoding='utf8').toString('base64');

console.log(uid);


request.get({
	url: 'https://stream.twitter.com/1/statuses/filter.json?track=nodejs',
	headers: {
		Authorization: 'Basic '+uid+'=='
	},
	onResponse: function(e,r,b){
		console.log(e,b)
	}
}, function(e,r,b){
	console.log(e,b)
})
