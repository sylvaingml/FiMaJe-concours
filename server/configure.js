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


var path = require('path');
var routes = require('./routes');
// templating engine
var exphbs = require('express-handlebars');
// Framework
var express = require('express');
// Parsing incoming forms
var bodyParser = require('body-parser');
// Manage cookies
var cookieParser = require('cookie-parser');
// Log module
var morgan = require('morgan');
// Bring support for REST-specific methods to old browsers
var methodOverride = require('method-override');
// Obviously allow to customize error management
var errorHandler = require('errorhandler');

module.exports = function(app)
{
  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({'extended': true}));
  app.use(bodyParser.json());
  app.use(methodOverride());
  //app.use(cookieParser('some-secret-value-here'));
  
  routes(app);//moving the routes to routes folder.

  app.use('/public/', express.static(path.join(__dirname, '../public')));

  if ( 'development' === app.get('env') ) {
    app.use(errorHandler());
  }

  app.engine('handlebars', exphbs.create({
    defaultLayout: 'default',
    layoutsDir: app.get('views') + '/layouts',
    partialsDir: [ app.get('views') + '/partials' ]
  }).engine);
  app.set('view engine', 'handlebars');

  return app;
};
