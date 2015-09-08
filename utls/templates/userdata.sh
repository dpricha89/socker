#!/bin/bash -ex

cat > /etc/sysconfig/docker << EOL
# Additional startup options for the Docker daemon, for example:
# OPTIONS="--ip-forward=true --iptables=true"
OPTIONS=
other_args="-H tcp://0.0.0.0:3000 -H unix:///var/run/docker.sock"
EOL

yum install -y docker

usermod -a -G docker ec2-user

service docker restart