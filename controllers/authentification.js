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

// ===== IMPLEMENTATION

var saltRounds = 13;

function createStorablePassword(password) {
    return bcrypt.hashSync(password, saltRounds);
}


function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
}

function authenticate(role, req, res, next) {
    var user = basicAuth(req);

    if ( ! user || ! user.name || ! user.pass ) {
        return unauthorized(res);
    }

    var proposedPassword = createStorablePassword(user.pass);

    return isAuthorizedUserAndPassword(user.name, user.pass, role, function(authorisationStatus) {
        switch ( authorisationStatus ) {
            case 'accepted':
                return next();
                break;
                
            case 'toInitialize':
                console.warn("Password reset needed for " + user.name);
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
    var handleDbIsConnected = function(db) {
        var dbUsers = db.collection('Users');

        var query = {
            login: login,
            groups: {$elemMatch: {$eq: role}}
        };
        
        dbUsers.find(query)
          .toArray()
          .then(function(result) {
              var authorization = 'rejected';
            
              if ( result && Array.isArray(result) && result.length > 0) {
                  if ( !result[0].password || '' === result[0].password ) {
                      // User found but password is not set... Force setting password
                      authorization = 'toInitialize';
                  }
                  else if ( bcrypt.compareSync(password, result[0].password) ) {
                      authorization = 'accepted';
                  }
              }
              
              return nextAction(authorization);
            });
    };

    return MongoClient.connect(settings.get('db_url'), function(err, db) {
        if ( err ) {
            console.error('Unable to connect to MongoDB: ' + err);
            return false;
        }
        else {
            return handleDbIsConnected(db);
        }
    });
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
    
    logout: logout
};
