var AWS = require('aws-sdk');
var Promise = require('bluebird');
var retry = require('bluebird-retry');
var _ = require('underscore');
var fs = require('fs');
var AWS_CLIENT = require('../utls/aws_client.js');
var aws_client = new AWS_CLIENT();


module.exports = function(app) {

   app.post('/api/scale_up', function(req, res) {
       return aws_client.scale_up()
       .then(function(){
           res.status(200).json('success');
       })
       .catch(function(err){
           console.log(err);
           res.status(500).json('failure');
       });
   });

};


