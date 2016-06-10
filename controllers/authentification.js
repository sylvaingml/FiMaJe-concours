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

var saltRounds = 10;

function createStorablePassword(password) {
    return bcrypt.hashSync(password, saltRounds);
}


function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
}

function authenticate(req, res, next) {
    var user = basicAuth(req);

    if ( ! user || ! user.name || ! user.pass ) {
        return unauthorized(res);
    }

    var proposedPassword = createStorablePassword(user.pass);
    var existingPassword = createStorablePassword('admin');
    
    var isMatching = bcrypt.compareSync(user.pass, existingPassword);

    if ( user.name === 'admin' && isMatching ) {
        return next();
    }
    else {
        return unauthorized(res);
    }
}


// ===== EXPORTED MODULE


module.exports = {
    authenticate: authenticate,
    createStorablePassword: createStorablePassword
};

    