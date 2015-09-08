var Promise = require('bluebird');
var Docker = require('dockerode-bluebird');
var db = require('./mongo.js');
var pool = db.collection('pool');
var AWS_CLIENT = require('./aws_client.js');
var aws_client = new AWS_CLIENT();
var _ = require('underscore');




//config
var config = require('../config/config.js');

var DEFAULT_ORG_PER_HOST = config.get('default.max.orgs');

var CONTAINER_SHELL = config.get('default.container.shell');

function docker_client(){

}
  
docker_client.prototype.create_org = function (params) {
       var host;
       var docker_conn;
       var host_port;

    
       CONTAINER_SHELL.Image = 'dpricha89/socker:latest';
       CONTAINER_SHELL.name = params.name + '-fe';
       CONTAINER_SHELL.HostConfig.Links = [params.name + '-db:redis'];
       CONTAINER_SHELL.org_name = params.name;


       console.log(CONTAINER_SHELL);
       return find_available_host(params)
       .then(function(host_obj){
           host = host_obj;
           console.log('connection to docker api:',host.PublicDnsName);
           return find_available_port(host);
       })
       .then(function(port){
           host_port = port;

           CONTAINER_SHELL.ExposedPorts['8080/tcp'] = {}; 
           CONTAINER_SHELL.HostConfig.PortBindings['8080/tcp'] = [{ HostPort: host_port.toString()}]
           console.log('test:',CONTAINER_SHELL);

           return new Docker({host: host.PublicDnsName, port: 3000});
       })
       .then(function(docker){
           docker_conn = docker;
           return verify_host(host, docker_conn);
       })
       .then(function(docker){
           return docker_conn.createContainerAsync({Image: 'redis:latest', name: params.name + '-db'});
       })
       .then(function(container){
           return container.startAsync();
       })
       .then(function(){
           return docker_conn.createContainerAsync(CONTAINER_SHELL);
       })
       .then(function (container) {
           return container.startAsync();
       })
       .then(function () {
           CONTAINER_SHELL.target = 'http://' + host.PublicDnsName + ':' + host_port;
           CONTAINER_SHELL.port = host_port;
           return pool.update({InstanceId: host.InstanceId}, {$addToSet: {organizations: CONTAINER_SHELL}});
       });

};

module.exports = docker_client;


function find_available_host(params){

    return pool.findOne({$where: "this.organizations.length <= " + DEFAULT_ORG_PER_HOST})
    .then(function(result){
      if(!result){
        console.log('No hosts with capacity for containers. Scaling up 1 instance');
        return aws_client.scale_up()
        .delay(10000)
        .then(function(result){
             return new docker_client();
        })
        .then(function (client){
             return client.create_org(params);
        });     
      }
        return result;
    })
    .catch(function(err){
      console.log(err);
    });

}

function find_available_port(host){
    if(host.organizations.length > 0){
    var port = _.chain(host.organizations)
            .pluck('port')
            .map(function(x){
                 return x + 1;
            })
            .max().value();
    return port;
    }
    return 3030;        
}

function verify_host(host, docker){

     console.log('verifying host:', host.PublicDnsName);
     var docker_conn = docker;
     return docker_conn.pullAsync('dpricha89/socker')
     .then(function(result){
          return docker_conn.pullAsync('redis');
     })
     .then(function(result){
          return docker;
     });
}

