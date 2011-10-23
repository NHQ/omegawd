var fs = require('fs'), _ = require('underscore');

var states = JSON.parse(fs.readFileSync('./lib/USA.json').toString('utf8')).states;

_.map(states, function(val,key){
	states[key].keywords = [];
	states[key].keywords.push(key.toLowerCase().replace(/\s/g, ""))
})

var mew = {"states":states}

console.log(mew)

fs.writeFileSync('./lib/poo.json', JSON.stringify(mew))

