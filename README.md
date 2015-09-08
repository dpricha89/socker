## SOCKER

###Docker + SAAS + HTTP-Proxy

This is a very simple implementation of docker SAAS to lower infrastructure cost while segregating each customers data. Each organization gets their own front end container (Node JS) and database container (Redis) that is linked together with docker. 

####Coming Soon
+ organization migration (move containers between hosts)
+ admin console for management 
+ docker resource data returned to management system
+ more sophisticated method of allocating organizations based on resources
+ tunnel traffic instead of leaving ports open


####Proxy
http-proxy is used to make the connection to the docker containers based on the subdomain.

customer1.saasdomain.io ==> ec2-51-24-144-52.us-west-2.compute.amazonaws.com:3031
customer2.saasdomain.io ==> ec2-51-24-144-52.us-west-2.compute.amazonaws.com:3032

####Auto Scale
AWS SDK is used to launch new instances as the organizations grow on the system. The default is set to 5 organizations per instance. When there is not an instance with available space a new instance will be launched and automatically configured to allow docker api access. 

####Organization
An organization is used to represent a signup or customer in the system. Each Organization has a Node JS container and a Redis database container.