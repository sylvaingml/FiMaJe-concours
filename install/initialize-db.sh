#!/bin/bash

cd $(dirname $0)

# Import default categories

mongoimport --db FiMaJe --collection Categories --drop --file ./data-defaults/default-categories.json

