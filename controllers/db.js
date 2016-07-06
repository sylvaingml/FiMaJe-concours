/* 
 *  FiMaJe, gestion du concours
 * 
 *  Creative Commons 
 *  Attribution - Pas d’Utilisation Commerciale 3.0 France 
 *  http://creativecommons.org/licenses/by-nc/3.0/fr/
 * 
 *  Auteurs: Sylvain Gamel, club « La Compagnie des Trolls » Antibes, France
 * 
 */


var settings = require('config');

var basicAuth = require('basic-auth');

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;


function db_connectAndProcess(handleDbIsConnected, handleError)
{
    var dbURL = settings.get('db_url');

    var connectionHandler = function(error, db) {
        if ( error ) {
            console.error('Unable to connect to MongoDB: ' + error);

            return handleError({
                error_code: 'DB.open',
                message: "Database connection error."
            });
        }
        else {
            return handleDbIsConnected(db);
        }
    };

    MongoClient.connect(dbURL, {}, connectionHandler);
}


function db_getObjectById(collectionName, objectId, processValue)
{
    var objId = ObjectID.createFromHexString(objectId);
    var query = {
        _id: objId
    };

    var onConnected = function(db) {
        return db.collection(collectionName)
          .find(query)
          .toArray()
          .then(function(output) {
              var contest = null;
              if ( output && output.length > 0 ) {
                  contest = output[0];
              }
              return processValue(contest);
          });
    };

    var onError = function(error) {
        return processValue(null);
    };

    return db_connectAndProcess(onConnected, onError);
}


function db_fetchSortedCollectionAsArray(name, query, sorting, processValueList)
{
    var getObjects = function(db) {
        var collection = db.collection(name);
        collection.find(query, {})
          .sort(sorting)
          .toArray()
          .then(function(objectList) {
              db.close();
              processValueList(objectList);
          });
    };

    var failed = function(error) {
        console.error("ERROR fetching content of '" + name + "' collection: " + error);
        processValueList([ ]);
    };

    db_connectAndProcess(getObjects, failed);
}

function db_getSortedCollectionAsArray(name, sorting, processValueList)
{
    return db_fetchSortedCollectionAsArray(name, {}, sorting, processValueList);
}

function db_getCollectionAsArray(name, processValueList) 
{
    return db_getSortedCollectionAsArray(name, {}, processValueList);
}


function db_getCategoriesByGroup(processValueList)
{
    var getObjects = function(db) {
        db.collection('Categories').aggregate([
            {
                $sort: {'order': 1}
            },
            {
                $group: {
                    '_id': '$group',
                    'categories': {$addToSet: {'code': '$code', 'label': '$label'}}
                }
            }
        ]).toArray()
          .then(function(objectList) {
              db.close();
              processValueList(objectList);
          });
    };

    var failed = function(error) {
        console.error("ERROR fetching content of 'Categories' collection: " + error);
        processValueList([ ]);
    };

    db_connectAndProcess(getObjects, failed);
}

module.exports = {
    connectAndProcess: db_connectAndProcess,
    getObjectById: db_getObjectById,
    getCollectionAsArray: db_getCollectionAsArray,
    getSortedCollectionAsArray: db_getSortedCollectionAsArray,
    fetchSortedCollectionAsArray: db_fetchSortedCollectionAsArray,
    getCategoriesByGroup: db_getCategoriesByGroup
};

