
/**
 * Module dependencies.
 */

var express = require('express')
,   dnode = require('dnode')
,   r = require('redis')
,   redis = r.createClient()
,   RedisStore = require('connect-redis')
,   request = require('request')
,   auth = require('everyauth')
,   json = require('../../makeData.js');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'superSecret!'}));
  app.use(app.router);
  app.use(auth.middleware())
  app.use(express.static(__dirname + '/public'));
});
auth.helpExpress(app);
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

function getSesh(req, res, next){
  next();
}

// Routes

app.get('/', getSesh, function(req, res){
  res.render('index', {
    title: 'Express'
  });
});
app.get('/json', function(req, res){
  res.render('json', {
    title: 'Express',
    locals: {json: json}
  });  
})
app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

d = {
  init:function(){
    var self = this;
    d.node = dnode(function (client, conn) {
      this.json = function(cb){
        cb(json)
      };
      this.redis = function(str, bool, cb){
        var line = str.split(/\s/)
        ,   cmd = line.splice(0,1)
        ,   key = line[0]
        ,   semantic = key.split(/[:]|[.]/)
        ,   subject = semantic[1]
        ,   predicate = semantic[2]
        ,   src = semantic[0]
        ,   score = bool;
        console.log(semantic, subject, predicate);
        redis[cmd](line, function(er,re){
          if(er){d.node.remote.err(er)}
          cb(src, subject, predicate, bool, re);
          if(predicate === 'links' && re){
            re.forEach(function(e,i){ 
              if(score && (i % 2 != 0)){console.log('odd?', i);return}
              console.log('even?', i)
              var url = e, index = i;
              if(e != 'null'){
                request({uri: e, onResponse: function(e,r,b){
                  if(r){
                    console.log(r.request.uri);
                    var uri = r.request.uri;   
                     d.node.remote.title([index,uri.href])
                  }              
                 }
                })
              }
            })
          }
        })
      }       
      conn.on('ready', function(){console.log('event')})
      conn.on('reconnect', function(){console.log('event')})
      conn.on('remote', function(remote){
        d.node.remote = remote;
        d.node.remote.check(5, function(num){
          console.log(num)          
        })          
      })
    })
    d.node.listen(app, {io : {'log level':3}});
  }
};
d.init();

/*
dnode(function (client, conn) {
    conn.on('ready', function(){console.log('event')})
    conn.on('reconnect', function(){console.log('event')})
    conn.on('remote', function(remote){this.remote = remote; remote.check(5, function(num){console.log(num)})})
    this.data = function(data, cb){  
      var target = data.target || null;
      redis[data.command](data.$et, function(err, data){
        spfdr.emit('data', [err, data, target])
      })
    },
    this.redis = function(str, bool, cb){
      var line = str.split(/\s/)
      ,   cmd = line.splice(0,1)
      redis[cmd](line, function(er,re){
        if(er){this.remote.err(er)}
        cb(bool, re);
      })
    }
}).listen(app, {io : {'log level':3}});
*/