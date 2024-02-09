#!/bin/sh
set -e
host=slayer.marioslab.io
host_dir=/home/badlogic/wowormeileistung.marioslab.io
scp $host:$host_dir/docker/data/logs/access.log access.log
goaccess --keep-last=30 -f access.log -o report.html --log-format=COMBINED
rm access.log
open report.html