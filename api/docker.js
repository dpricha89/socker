var Promise = require('bluebird');
var Docker = require('dockerode-bluebird');
var DOCKER_CLIENT = require('../utls/docker_client.js');
var docker_client = new DOCKER_CLIENT();


module.exports = function(app){

   app.post('/api/create_org/:name', function (req, res) {
    
      return docker_client.create_org(req.params)
      .then(function (result){
           res.status(200).json('success');
      })
      .catch(function (err) {
           console.log(err);
           res.status(500).json(err);
      })

   });

}
