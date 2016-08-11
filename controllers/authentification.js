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

var bcrypt = require('bcrypt');

var basicAuth = require('basic-auth');
var dbConnector = require('./db');


// ===== IMPLEMENTATION

var saltRounds = 13;

function createStorablePassword(password) {
    return bcrypt.hashSync(password, saltRounds);
}


function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
}

function authenticate(role, req, res, next) {
    var user = basicAuth(req);

    if ( ! user || ! user.name || ! user.pass ) {
        return unauthorized(res);
    }

    //var proposedPassword = createStorablePassword(user.pass);

    return isAuthorizedUserAndPassword(user.name, user.pass, role, function(authorisationStatus, effectiveGroups) {
        switch ( authorisationStatus ) {
            case 'accepted':
                // Track the list of groups for this identified user
                req.params._groupList = effectiveGroups;
                return next();
                break;
                
            case 'toInitialize':
                console.log("Password reset needed for " + user.name);
                return initializePassword(user.name, req, res);
                break;
                
            case 'rejected':
            default:
                return unauthorized(res);
                break;
        }
    });
}


function isAuthorizedUserAndPassword(login, password, role, nextAction) {
    console.log("ACCESS CHECK POINT for user " + login + " ; role " + role);
    
    var handleDbIsConnected = function(db) {
        var dbUsers = db.collection('Users');

        // We are searchin in an array, so default is to expect an array
        var roleList = role;
        if ( !Array.isArray(role) ) {
            // But if value is not an array, build one to wrap this value
            roleList = [ role ];
        }

        var query = {
            login: login,
            groups: {$in: roleList }
        };

        return dbUsers.find(query)
          .toArray()
          .then(function(result) {
              var authorization = 'rejected';
                var groupList = [];

              if ( result && Array.isArray(result) && result.length > 0 ) {
                  if ( ! result[0].password || '' === result[0].password ) {
                      // User found but password is not set... Force setting password
                      console.log("No password set for " + login);
                      authorization = 'toInitialize';
                  }
                  else if ( bcrypt.compareSync(password, result[0].password) ) {
                      authorization = 'accepted';
                      groupList = result[0].groups;
                  }
                  else {
                      console.log("FAILED login for user " + login);
                  }
              }
              else {
                  console.log("Login attempt FAILED for user " + login);
              }

              return nextAction(authorization, groupList);
          });
    };

    var handleNoConnection = function() {
        return 'rejected';
    };

    return dbConnector.connectAndProcess(handleDbIsConnected, handleNoConnection);
}


function getGroupsOfLoggedUser(request) {
    var groups = [];
    
    if ( request.params._groupList ) {
        groups = request.params._groupList;
    }
    
    return groups;
};


function isLoggedElfOrBetter(request) {
    var groups = this.getGroupsOfLoggedUser(request);
    var hasRights = false;
    
    if ( groups.indexOf('god') >= 0 || groups.indexOf('elf') >= 0 ) {
        hasRights = true;
    }
    
    return hasRights;
}


// ===== REQUEST HANDLERS

function initializePassword(userLogin, request, response) {
    
    var model = {
        login: userLogin
    };
    
    return response.render("admin/user-init", model);
}

function authenticateAsGod(request, response, next) {
    return authenticate('god', request, response, next);
}


function authenticateAsElfOrBetter(request, response, next) {
    return authenticate([ 'god', 'wizard', 'elf' ], request, response, next);
}

/** End session
 * 
 * Current implementation is not working and is not used in UI.
 * We need to replace basic WWW authentication with more secure system.
 * 
 * @param {type} request
 * @param {type} response
 * @param {type} next
 * @returns {unresolved}
 * 
 */
function logout(request, response, next) {
    response.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    
    return response.status(401).redirect('/');
}



// ===== EXPORTED MODULE


module.exports = {
    authenticate: authenticate,
    initializePassword: initializePassword,
    createStorablePassword: createStorablePassword,
    
    enterAsGod: authenticateAsGod,
    enterAsElfOrBetter: authenticateAsElfOrBetter,
    
    getGroupsOfLoggedUser: getGroupsOfLoggedUser,
    isLoggedElfOrBetter: isLoggedElfOrBetter,
    
    logout: logout
};
