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

// ===== Server creation

var express  = require('express');
var settings = require('config');

var configure = require('./server/configure');
var app = express();

// ===== Configuration

app.set('db_url', process.env.DB_URL || settings.get("db_url") || "mongodb://localhost:27017/FiMaJe");
app.set('port',   process.env.PORT   || settings.get("port")   || 3300);
app.set('production', 'production' === process.env.NODE_ENV );

app.set('views', __dirname + '/views');
app = configure(app);

// ===== Middleware functions

/** Simple HTTP to HTTPS forwarding middleware function.
 * 
 * @param {type} request
 * @param {type} response
 * @param {type} next
 * 
 * @returns {unresolved}
 */
function requireHTTPS(request, response, next) 
{
    if ( ! request.secure ) {
        console.log("Accessed in non-secure way. Redirecting to: " + request.headers.host + request.url);
        return response.redirect('https://' + request.headers.host + request.url);
    }

    next();
}

// ===== Redirect to secure connection

if ( app.get('production') ) {
    app.use(requireHTTPS);
}



// ===== Application Routing

app.get('/about', function(req, res) {
   res.send('FiMaJe, version 1.0.0 - 2016 Sylvain Gamel et la Compagnie des Trolls (Antibes, France)'); 
});


// ===== Start application server

app.listen(app.get('port'), function() {
    console.log('Server up: http://localhost:' + app.get('port'));
});
