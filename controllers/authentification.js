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

var basicAuth = require('basic-auth');

// ===== IMPLEMENTATION

function unauthorized(res) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.send(401);
    }

function authenticate(req, res, next) {
    var user = basicAuth(req);

    if ( ! user || ! user.name || ! user.pass ) {
        return unauthorized(res);
    }
    else if ( user.name === 'admin' && user.pass === 'admin' ) {
        return next();
    }
    else {
        return unauthorized(res);
    }
}


// ===== EXPORTED MODULE


module.exports = {
    authenticate: authenticate
};

    