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


var moment = require('moment');

function formatDateWithPattern(aDate, context) {
    var pattern = "YYYY-MM-DD";

    if ( context && context.hash && context.hash.pattern ) {
        pattern = context.hash.pattern;
    }

    var theDate = moment(aDate);
    theDate.locale('fr-FR');

    return theDate.format(pattern);
}


function formatAmount(value, context) {
    var amount = new Number(value);
    var formatted = amount.toFixed(2);
    
    return formatted;
}

module.exports = {
    format_amount: formatAmount,
    to_json: function(object) {
        return JSON.stringify(object);
    },
    
    row_number: function(index) {
        return index + 1;
    },
    
    email_link: function(email) {
        return "<a href='mailto:" + email + "' >" + email + "</a>";
    },
    
    phone_link: function(tel) {
        return "<a href='tel:" + tel + "' >" + tel + "</a>";
    },
    
    format_date: formatDateWithPattern
};
