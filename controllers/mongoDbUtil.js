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


var MongoClient = require( 'mongodb' ).MongoClient;

// This is the shared DB connexion
var _db;


function connectToServer(callback) {
    MongoClient.connect("mongodb://localhost:27017/marankings", function(err, db) {
        _db = db;
        return callback(err);
    });
}


function getDb() {
    return _db;
}

module.exports = {
  connectToServer: connectToServer,
  getDb: getDb
};