var reg = new RegExp(/t.co/i), usr = new RegExp(/@[a-z0-9_]*/i);

function append (datum){
	var data = JSON.parse(datum);
	var text = data.txt.split(" ");
	
	var txt = _.map(arr, function(e){
			if(reg.test(e)){
				return '<a href='+e+'>'+e+'</a>'
			} 
			else if(usr.test(e)){
				return '<a href=http://twitter.com/!#'+e.slice(1)+'>'+e+'</a>'
			}
			else return e
		}).join(" ")
		
	var html = 	'<li class="post"><div class="img"><img class="thumb" src='+data.pic+'></img></div></div class="txt"><p>'+txt+'</p></div></li>';
			$('ul#post').append(html);
}

	var socket = io.connect('http://74.207.246.247:8008');
  socket.on('news', function (data) {
    console.log(data);
		append(data);
  });
