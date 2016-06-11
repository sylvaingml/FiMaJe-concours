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

var MongoClient = require('mongodb').MongoClient;
var exphbs = require('express-handlebars');

// ===== IMPLEMENTATION

function findListOfCategories(onSuccess, onError) {
    var handleDbIsConnected = function(db) {
        var dbUsers = db.collection('Users');

        dbUsers.find().toArray(function(err, result) {
            if (err ) {
                return onError({
                error_code: 'DB.fetch',
                message: "Error fetching users from stored collection."
                });
            }
            else {
                db.close();
                return onSuccess(result);
            }
        });
    };

    return MongoClient.connect(settings.get('db_url'), function(err, db) {
        if ( err ) {
            console.error('Unable to connect to MongoDB: ' + err);
            return onError({
                error_code: 'DB.open',
                message: "Database connection error."
            });
        }
        else {
            return handleDbIsConnected(db);
        }
    });
}

// ===== Requests handlers

function getUserList(request, response) {
    var handleSuccessFn = function(users)
        {
            var model = {
                "users": users,
                
                helpers: {}
            };
            response.render('user-list.handlebars', model);
        };

        var handleErrorFn = function(err)
        {
            console.error("Users - Error: " + err);
            var model = {
                "message": err
            };

            response.render('user-list.handlebars', model);
        };

        return findListOfCategories(handleSuccessFn, handleErrorFn);
}

// ===== EXPORTED MODULE


module.exports = {
    index: getUserList
};

    