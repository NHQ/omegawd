denote = null;

client = {
  init: function(){
    this.dnode = DNode({
      check:function(num, cb){
        cb(num*5)
      },
      title:function(arr){
         $('a#'+arr[0]).html(arr[1]).attr('href', arr[1])
         //$('.links').find($('a')).html(arr[1])
      },
      err:function(err){
       $('#terminal').append($('<li>'+err+'</li>'))
      } 
    });
    this.dnode.connect(function (remote, cnx) {
      remote.json(function(json){
        client.globo = json;
      })
      client.remote = remote;
    });
    $('form').submit(client.caller)
    $('a.option').live('click', client.handler)
  },
  handler:function(e){
    e.preventDefault();
    var action = this.id,
        command = 'zrevrangebyscore '+client.src+'.'+$(this).parent().attr('id')+'.'+action+' +inf 0 withscores';
        console.log($(this).parent().attr('id'), command)
    client.caller(null, command)
  },
  caller:function(ev, cmd){ // how to use this for analytics upgrade, takes cms arg from other event
    if(ev)ev.preventDefault();
    var reg = /withscores/g;
    var command = cmd || $('#cmd').val();
    client.remote.redis(command, reg.test(command), function (src, subject, pred, bool, index) {
      // subject can be tag or host, tags or hosts
      // predicate can be tag, host or permalink
      // subject === tag options = rank hosts || rank permalinks (links)
      // subject === host option = rank tags || rank permalinks
      
      client.subject = subject,
      client.predicate = pred,
      client.src = src,
      client.withscore = bool,
      client.lastIndex = index;
      
      $('#terminal').empty();
      
      if(Array.isArray(index)){
        index.forEach(function(e,i){
          if(client.withscore && i % 2){$('span#score_'+(i-1)).html('score: '+e);return}
          switch (pred){
            case 'all':
              switch (subject){
                case 'tags':
                var j = '<span>'+e+'</span>'; // add its score?
                var h = '<div id='+e+' class=options><a class=option id=hosts href=#>hosts </a><a class=option id=links href=#>Show links </a><span id=score_'+i+'>score: </span></div>' // tag options: see hosts, see links              
                break;
                case 'hosts':
                var j = '<span>'+e+'</span>'; // add its score?
                var h = '<div id='+e+' class=options><a class=option id=tags href=#>tags </a><a class=option id=links href=#>Show Links </a><span id=score_'+i+'>score: </span></div>' // tag options: see hosts, see links              
                break;
              }
            break;
            case 'tags':
              var j = '<a id='+i+' href=# target=_blank>'+e+'</a>' // add its score?
              var h = '<div id='+e+' class=options><a class=option id=hosts href=#>Show Hosts </a><a class=option id=links href=#></a>links <span id=score_'+i+'>score: </span></div>' // tag options: see hosts, see links
            break;
            case 'hosts':
              var j = '<a id='+i+' href=# target=_blank>'+e+'</a>'
              var h = '<div id='+e+' class=options><a id=spam href=#>spam </a><a id=subscribe href=#>subscribe </a><a class=option id=tags href=#>Tags </a><a class=option id=links href=#>links </a><span id=score_'+i+'>score: </span></div>' // host options: spam, subscribe, see tags, see links
            break;
            case 'links':
              var j = '<a id='+i+' href='+e+' target=_blank>'+e+'</a>';
              var h = '<div id='+e+' class=options><a id=spam href=#>spam </a><a id=subscribe href=#>subscribe </a><a class=option id=tags href=#>Tags </a><a class=option id=hosts href=#>Host Stats </a><span id=score_'+i+'>score: </span></div>' // link options: subscribe, re-publish, spam, demote, see host stats
            break;
          }
          $('#terminal').append($('<li class=links>'+j+'<br/>'+h+'</li>'))
        })
       }
      else
        $('#terminal').append($('<li><pre>'+index+'</pre></li>'))
    })
  }
};
client.init();

/*
DNode({
  check:function(num, cb){
    cb(num*5)
  },
  err:function(err){
    console.log(err)
  }
})        
  .connect(function (remote, cnx) {
      console.log(remote, cnx);
      remote.cat(function (says) {
          console.log(says);
      });
    });
*/