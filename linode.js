var my_api_key = 'IzwRqAwyqaSAb16IYCHSjX2HvH1eOvqIKvuijy0u2GtIfyw0Oxl6qvE7LL6rEUwD';
var client = new(require('linode-api').LinodeClient)(my_api_key);
var dId = '241528';
var data = require('./makeData.js'),
		_ = require('underscore');


_.each(data.states, function(v,state){
	var st = data.states[state];
	var name = state.toLowerCase().replace(/\s/g, "-");
	
	if(Object.keys(st.cities).length) {
		_.each(st.cities, function(val, city){
			client.call('domain.resource.create', {domainID: dId, type: 'A', name: city.toLowerCase().replace(/\s/g,"_")+'.'+name+'.citizenmission.com', target: '74.207.246.247'}, function (err, res) {
			  if (err) throw err;
			  console.log(err, res);
			});
		})
	}
	
})
	

/*
client.call('domain.resource.create', {domainID: dId, type: 'A', name:'rhetoric-report.citizen.mission.com', target: '74.207.246.247'}, function (err, res) {
  if (err) throw err;
  console.log(err, res);
});

/*
	MX	10 ASPMX.L.GOOGLE.COM.
MX	20 ALT1.ASPMX.L.GOOGLE.COM.
MX	20 ALT2.ASPMX.L.GOOGLE.COM.
MX	30 ASPMX2.GOOGLEMAIL.COM.
MX	30 ASPMX3.GOOGLEMAIL.COM.
MX	30 ASPMX4.GOOGLEMAIL.COM.
MX	30 ASPMX5.GOOGLEMAIL.COM.
NS	ns1.dreamhost.com.
NS	ns2.dreamhost.com.
NS	ns3.dreamhost.com.
mail	CNAME	ghs.google.com.
*/	