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

    // TODO: this shall be removed as magic password do not exists...
    var existingPassword = createStorablePassword('ami');
    var proposedPassword = createStorablePassword(user.pass);
    var isMatching = bcrypt.compareSync(user.pass, existingPassword);

    return isAuthorizedUserAndPassword(user.name, proposedPassword, role, function(isAuthorized) {
        if ( isAuthorized || isMatching ) {
            return next();
        }
        else {
            return unauthorized(res);
        }
    });
}


function isAuthorizedUserAndPassword(login, password, role, nextAction) {
    var handleDbIsConnected = function(db) {
        var dbUsers = db.collection('Users');

        dbUsers.find({
            login: login,
            password: password,
            role: { $elemMatch: { $eq: role } }
        }).toArray(function(err, result) {
            var authorized = result && ! ! ! err && result.length > 0;
            if ( ! err ) {
                db.close();
            }

            return nextAction(authorized);
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


// ===== EXPORTED MODULE


module.exports = {
    authenticate: authenticate,
    createStorablePassword: createStorablePassword
};

    