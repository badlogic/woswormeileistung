#!/bin/bash
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
pushd $dir/.. > /dev/null

if [ -z "$DEV" ]; then
echo "Starting server in prod mode"
	node --max-old-space-size=8192 --enable-source-maps build/server.js
else
    echo "Starting server in dev mode"
	node --max-old-space-size=8192 --watch --enable-source-maps --inspect-brk=0.0.0.0:9230 build/server.js
fi