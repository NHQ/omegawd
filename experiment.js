var fs = require('fs'), _ = require('underscore');

var states = JSON.parse(fs.readFileSync('./lib/USA.json').toString('utf8')).states;



