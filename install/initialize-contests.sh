#!/bin/bash

cd $(dirname $0)

# Import default contests and users

mongoimport --db FiMaJe --collection Users --drop --file ./data-defaults/default-users.json

mongoimport --db FiMaJe --collection Contests --drop --file ./data-defaults/default-contests.json
