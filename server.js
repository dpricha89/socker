var http = require('http');
var httpProxy = require('http-proxy');
var db = require('./utls/mongo.js');
var pool = db.collection('pool');

var proxy = httpProxy.createProxy({
	ws: true
});

var server = http.createServer(function (req, res) {

	var url_prefix = req.headers.host.split('.')[0];
	console.log(url_prefix);

	return pool.findOne({'organizations.org_name': url_prefix}, {"_id": 0, 'organizations.$': 1}).then(function(result) {

		if(!result){	
			res.end('Something went wrong.');
		}
		    console.log(result.organizations[0].target);
			proxy.proxyRequest(req, res, {
				target: result.organizations[0].target
			});
		})
		.catch(function(err) {
			console.log(err);
		});

});

proxy.on('error', function (err, req, res) {
	res.writeHead(500, {
		'Content-Type': 'text/plain'
	});

	res.end('Something went wrong.');
});

console.log("proxy listening on port 8080")
server.listen(8080);


// setup api
var express = require('express');
var app = express();

require('./api/aws.js')(app);
require('./api/docker.js')(app);

app.listen(8081)

console.log('api listening on port 8081');
