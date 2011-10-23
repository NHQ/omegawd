
/**
 * Module dependencies.
 */

var express = require('express')
,		Mongolian = require('mongolian')
,		mongo = new Mongolian
,		site = mongo.db('rhetoric')
,		people = mongo.db('people')
,		rhetoric = site.collection('quotes')
,		person = people.collection('people')
,		client = require('redis')
,		async = require('async')
,		request = require('request')
,		fs = require('fs')
,		formidable = require('formidable')
,		_ = require('underscore');

var states = JSON.parse(fs.readFileSync('../lib/States.json', encoding='utf8')).states.state;
console.log(states)

var app = module.exports = express.createServer();

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

app.get('/', function(req, res){
  res.render('rhetoric', {
    title: 'Express',
		locals: {states: states}
  });
});

app.post('/rhetoric', function(req, res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {

		var bogey = {};

		bogey.name = fields.name;
		bogey.quote = fields.quote;
		bogey.link = fields.link;

		if(fields.is_elected == 'on'){
			bogey.is_elected = true;
			if(fields.seat){
				bogey.seat = fields.seat;
				if(fields.e_state != "State"){
					bogey.e_state = fields.e_state
				}
				if(fields.seat == 'House of Representatives' && fields['house district'] != ''){
					bogey.e_district = fields['house district']
				}
			}
		}
		
		if(fields.is_running == 'on'){
			bogey.is_running = true;
			if(fields.body){
				bogey.body = fields.body;
				if(fields.r_state != "State"){
					bogey.r_state = fields.r_state
				}
				if(fields.body == 'House of Representatives' && fields['house_run district'] != ''){
					bogey.r_district = fields['house_run district']
				}
			}
		}
		
		if(fields.agent == 'local'){
			bogey.agent = fields.agent;
			bogey.agency = fields.local_agency
		}
		if(fields.agent == 'federal'){
			bogey.agent = fields.agent;
			bogey.agency = fields.agency			
		}
		
		rhetoric.insert(bogey)
			console.log(bogey)
	});
	res.redirect('/')
})

// AUTH
app.get('/fb', function (req, res) {
  res.redirect(fb.getAuthorizeUrl({
    client_id: '190292354344532',
    redirect_uri: 'http://74.207.246.247:3001/fb/auth',
    scope: 'user_location,user_photos'
  }));
});

// mongolian auth

app.get('/fb/auth', function (req, res) {
  fb.getAccessToken('190292354344532', 'ac9d7f273a15e91ac035871d04ef1915', req.param('code'), 'http://74.207.246.247:3001/fb/auth', function (error, access_token, refresh_token) {
  fb.apiCall('GET', '/me', {access_token: access_token, fields:'id,gender,first_name, middle_name,last_name,location,locale,friends,website'}, function (err, response, body){
		console.log(body);
    client.exists(body.id, function(err,que){
      console.log(que);
      if (que == 0){
        console.log('mak new');
        req.session._id = person._id;
        fs.mkdirSync('public/person/'+person._id, 644, function(err){console.log(err);}); //the user's image directory
				request.get('https://graph.facebook.com/'+body.id+'/picture?type=large&access_token='+access_token).pipe(fs.createWriteStream('public/person/'+person._id+'/profile.jpg'));
/*
				person.insert({
	        person.facts.fname : body.first_name,
	        person.facts.mname : body.middle_name,
	        person.facts.lname : body.last_name,
	        person.facts.gender : body.gender, 
	        person.facts.website : body.website, 
	        person.secrets.fb_access_token : access_token,
	        person.secrets.fbx : body.friends.data,
	        person.secrets.fb_id : body.id
				}, function(err, res){
					client.append(body.id, res._id, function(err){})
					person.update({_id: res._id}, {$set : {person.facts.portrait:'person/'+person._id+'/profile.jpg'}})
				})
*/
        };
      if (que == 1){
          console.log('mack old');
          client.get(body.id, function(e,r){
            var individual = mongoose.model('Person');
            req.session._id = r ;
						person.update({_id: r}, {$set :  {'secrets.fb_access_token': access_token,'secrets.fbx':body.friends.data}}, function(e,r){
							res.redirect('/init');
						})
          })            
        }
    })	
	});
  });
});



app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
