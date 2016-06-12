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

var authentification = require('./authentification');

// ===== IMPLEMENTATION

function findListOfCategories(onSuccess, onError) {
    var handleDbIsConnected = function(db) {
        var dbUsers = db.collection('Users');

        dbUsers.find().toArray(function(err, result) {
            if ( err ) {
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

function insertUserInDB(profile, onSuccess, onError) {
    var handleNoDuplicateFound = function(db, dbUsers) {
        dbUsers.insert(profile, {}, function(err, result) {
            if ( err ) {
                return onError({
                    error_code: 'DB.insert',
                    message: "Error inserting user."
                });
            }
            else {
                db.close();
                return onSuccess(result);
            }
        });
    };

    var handleDbIsConnected = function(db) {
        var dbUsers = db.collection('Users');

        return dbUsers.find(
          {login: profile.login},
          {login: 1, fullName: 1, email: 1}
        )
          .toArray()
          .then(function(existing) {
              if ( existing.length > 0 ) {
                  // ERROR, duplicate identifier
                  return onError({
                      error_code: 'DB.duplicate',
                      message: "Error inserting user. Login already exists."
                  });
              }
              else {
                  return handleNoDuplicateFound(db, dbUsers);
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
    var handleSuccessFn = function(users) {
        var model = {
            "users": users,
            helpers: {}
        };
        response.render('admin/user-list.handlebars', model);
    };

    var handleErrorFn = function(err) {
        console.error("Users - Error: " + err);
        var model = {
            "error": err
        };

        response.render('admin/user-list.handlebars', model);
    };

    return findListOfCategories(handleSuccessFn, handleErrorFn);
}


// ----- Requests Handlers


function askForNewUser(request, response) {
    return response.render('admin/user-create.handlebars', {});
}

function createUser(request, response) {
    var handleSuccessFn = function(result) {
        var model = {
            "user": result.ops[0],
            helpers: {}
        };
        model.user.password = null; // Do not send back the password field...

        response.status(200).json(model);
    };

    var handleErrorFn = function(err) {
        console.error("Create User - Error: " + err);
        var model = {
            "error": err
        };

        response.status(400).json(model);
    };

    // Check request

    var isJSON = request.body.dataType === 'application/json';

    if ( ! isJSON ) {
        return response.status(400).json({message: "Requète invalide"});
    }

    // Get information from request to build user

    hashedPassword = authentification.createStorablePassword(request.body.data.password);

    var model = {
        login: request.body.data.login,
        name: request.body.data.name,
        email: (request.body.data.email) ? request.body.data.email : "",
        password: hashedPassword,
        groups: [ ]
    };

    return insertUserInDB(model, handleSuccessFn, handleErrorFn);
}

function deleteUser(request, response) {

}

// ===== EXPORTED MODULE


module.exports = {
    index: getUserList,
    add_user: askForNewUser,
    add_user_confirmed: createUser,
    delete_user: deleteUser
};

    