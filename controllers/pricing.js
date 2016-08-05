/* 
 *  FiMaJe, gestion des tarifs
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

var dbConnector = require('./db');


module.exports = {
    index: processListCurrentPricingRequest
};



/** Returns the list of categories as JSON data.
 * 
 * @param {type} request
 * @param {type} response
 * 
 * @returns {undefined} 
 */
function processListCurrentPricingRequest(request, response) {
    var today = new Date();
    var year  = today.getFullYear();
    var model = {
        "year": year,
        "pricing": [ ]
    };
    
    var processValuesFn = function(data) {
        model.pricing = data;

        response.render('pricing_list.handlebars', model);
    };
    
    
    var query = {
        'year': year
    };
    
    var ordering = { 'year': 1, 'rateCode': 1 };
    
    dbConnector.fetchSortedCollectionAsArray("Pricing", query, ordering, processValuesFn);
}