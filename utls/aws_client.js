var AWS = require('aws-sdk');
var Promise = require('bluebird');
var retry = require('bluebird-retry');
var _ = require('underscore');
var fs = require('fs');
var db = require('./mongo.js');
var pool = db.collection('pool');

var USER_DATA = fs.readFileSync('./utls/templates/userdata.sh', 'utf8');

var ec2 = Promise.promisifyAll(new AWS.EC2({
  region: 'us-west-2'
}));

var default_params = {
  ImageId: 'ami-d5c5d1e5',
  MaxCount: 1,
  MinCount: 1,
  InstanceType: 't2.micro',
  KeyName: 'dog',
  SecurityGroupIds: [
    'sg-440bb020'
  ],
  UserData: new Buffer(USER_DATA).toString('base64')
};

function aws_client() {

}

aws_client.prototype.scale_up = function() {

  return ec2.runInstancesAsync(default_params)
    .then(function(response) {
      var instance = _.first(response.Instances);
      instance.organizations = [];
      return wait_for_instance(instance.InstanceId);
    })
    .then(function(result) {
      result.organizations = [];
      return pool.update({
        InstanceId: result.InstanceId
      }, result, {
        upsert: true
      });

    })
    .catch(function(err) {
      throw new Error(err);
    });

};

module.exports = aws_client;


function wait_for_instance(instanceId) {

  return retry(function() {
    return ec2.describeInstancesAsync({
        InstanceIds: [instanceId]
      })
      .then(function(result) {
        console.log(result);
        var state = _.chain(result.Reservations)
          .map(function(x) {
            return x.Instances;
          })
          .flatten()
          .pluck('State')
          .value()[0].Name;
        console.log('state:', state);
        if (state !== 'running') {
          throw new Error('Instance is still booting');
        } else if (state === 'running') {
          return _.chain(result.Reservations)
            .map(function(x) {
              return x.Instances;
            }).first().value()[0];
        }
      });
  }, {
    max_tries: 1000,
    interval: 1000 * 10
  });

}