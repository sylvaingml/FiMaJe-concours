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
var ObjectID = require('mongodb').ObjectID;

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


function updateUserInDB(userInfo, onSuccess, onError) {
    var objId = ObjectID.createFromHexString(userInfo._id);
    var userQuery = {
        _id:   objId,
        login: userInfo.login
    };
    
    var updateQuery = {
        $set: { fullName: userInfo.fullName, email: userInfo.email }
    };
    
    
    var handleDbIsConnected = function(db) {
        var dbUsers = db.collection('Users');
        
        var options = {
            fields: { password: 0 }
        };

        return dbUsers.findAndModify(userQuery, { login: 1 }, updateQuery, 
            options,
            function(error, result) {
              if ( error || 0 == result.ok ) {
                  // ERROR, not found
                  return onError({
                      error_code: 'DB.notFound',
                      message: "Error updating user. Login not found."
                  });
              }
              else {
                  db.close();
                  return onSuccess(result.value);
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


function updatePasswordInDB(profile, onSuccess, onError) {
    var userQuery = {
        login: profile.login
    };
    
    if ( profile._id && '' !== profile._id ) {
        // A user's ID was provided, this is normal update request
        var objId = ObjectID.createFromHexString(profile._id);
        
        userQuery._id = objId;
    }
    else {
        // We only have a login, so this is a init request.
        // The current password MUST be empty to be updated.
        //
        console.log("Updating password for " + profile.login);
        userQuery.password = {$eq: ''};
    }
    
    var updateQuery = {
        $set: { password: profile.password }
    };
    
    var handleDbIsConnected = function(db) {
        var dbUsers = db.collection('Users');
        
        var options = {
            fields: { password: 0 }
        };

        return dbUsers.findAndModify(userQuery, { login: 1 }, updateQuery, 
            options,
            function(error, result) {
              if ( error || 0 === result.ok ) {
                  // ERROR, not found
                  return onError({
                      error_code: 'DB.notFound',
                      error: JSON.stringify(error),
                      message: "Error updating user. Login not found."
                  });
              }
              else if ( null === result.value ) {
                  // ERROR, not authorized (user found but had a password)
                  return onError({
                      error_code: 'DB.noUpdate',
                      error: JSON.stringify(error),
                      message: "Error updating user. Login not found or password set."
                  });
              }
              else {
                  db.close();
                  return onSuccess(result.value);
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



function deleteUserInDB(userInfo, onSuccess, onError) {
    var objId = ObjectID.createFromHexString(userInfo._id);
    var userQuery = {
        _id:   objId,
        login: userInfo.login
    };

    var handleUserFound = function(db, dbUsers) {
        dbUsers.deleteOne(userQuery, {}, function(err, result) {
            if ( err ) {
                return onError({
                    error_code: 'DB.delete',
                    message: "Error deleting user."
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

        return dbUsers.find(userQuery, { login: 1 })
          .toArray()
          .then(function(existing) {
              if ( 0 === existing.length ) {
                  // ERROR, not found
                  return onError({
                      error_code: 'DB.notFound',
                      message: "Error deleting user. Login not found."
                  });
              }
              else {
                  return handleUserFound(db, dbUsers);
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
            helpers: {
                escape: function(input) {
                    return escape(input);
                }
            }
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
        fullName: request.body.data.fullName,
        email: (request.body.data.email) ? request.body.data.email : "",
        password: hashedPassword,
        groups: [ ]
    };

    return insertUserInDB(model, handleSuccessFn, handleErrorFn);
}

function deleteUser(request, response) {
    var handleSuccessFn = function(result) {
        var model = {};

        response.status(200).json(model);
    };

    var handleErrorFn = function(err) {
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

    var model = {
        login: request.body.data.login,
        _id: request.body.data._id
    };

    return deleteUserInDB(model, handleSuccessFn, handleErrorFn);
}

function updateUserInfo(request, response) {
    var handleSuccessFn = function(result) {
        var model = {
            "user": result,
            helpers: {}
        };

        response.status(200).json(model);
    };

    var handleErrorFn = function(err) {
        console.error("Update User Info - Error: " + err);
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

    var model = {
        _id: request.body.data._id,
        login: request.body.data.login,
        fullName: request.body.data.fullName,
        email: (request.body.data.email) ? request.body.data.email : ""
    };

    return updateUserInDB(model, handleSuccessFn, handleErrorFn);
}
 
 
function updateUserPassword(request, response) {
    var handleSuccessFn = function(result) {
        var model = {
            "user": result,
            helpers: {}
        };

        return response.status(200).json(model);
    };

    var handleErrorFn = function(err) {
        console.error("Update User Info - Error: ", JSON.stringify(err));
        var model = {
            "error": err
        };

        return response.status(400).json(model);
    };

    // Check request

    var isJSON = request.body.dataType === 'application/json';

    if ( ! isJSON ) {
        return response.status(400).json({message: "Requète invalide"});
    }

    // Get information from request to build user

    hashedPassword = authentification.createStorablePassword(request.body.data.password);

    var model = {
        _id: request.body.data._id,
        login: request.body.data.login,
        password: hashedPassword
    };

    return updatePasswordInDB(model, handleSuccessFn, handleErrorFn);
}


// ===== EXPORTED MODULE


module.exports = {
    index: getUserList,
    add_user: askForNewUser,
    add_user_confirmed: createUser,
    delete_user: deleteUser,
    update_user_info: updateUserInfo,
    update_user_password: updateUserPassword,
    set_user_password: updateUserPassword // Yes, same function but adapted logic
};

    