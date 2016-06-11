#!/bin/bash

cd $(dirname $0)

# Import default categories

mongoimport --db FiMaJe --collection Categories --drop --file ./data-defaults/default-categories.json

mongoimport --db FiMaJe --collection Users --drop --file ./data-defaults/default-users.json

mongoimport --db FiMaJe --collection UserGroups --drop --file ./data-defaults/default-user-groups.json

