#!/bin/bash

# Способ 1: через ls и grep
echo "Способ 1 через ls и grep:"
ls -l | grep "file.txt"

# Способ 2: через readlink
echo "Способ 2: через readlink:"
find ~ -type l -exec bash -c 'if [ "$(readlink -f "{}")" == "$(realpath file.txt)" ]; then echo "{}"; fi' \;
