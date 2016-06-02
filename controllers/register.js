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


module.exports = {
    /** Render the user's submission form to register to the contest.
     * 
     * @param {type} request
     * @param {type} response
     * 
     * @returns {undefined} 
     */
    index: function(request, response)
    {
        response.render("register_form", {});
    },
    
    
    /** From a JSON object, add a new person and their items in the contest.
     * 
     * @param {type} request
     * @param {type} response
     * 
     * @returns {undefined}
     */
    put: function(request, response)
    {
        response.status(200).json({ message: "TO BE IMPLEMENTED" });
    }
};

