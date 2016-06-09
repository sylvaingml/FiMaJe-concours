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


var express = require('express');
var router = express.Router();

var basicAuth = require('basic-auth');

var home = require('../controllers/home');
var categories = require('../controllers/categories');
var register = require('../controllers/register');

module.exports = function(app)
{
    // ===== Home screen

    router.get('/', home.index);

    // ===== Managing categories

    // Display the list of categories
    router.get('/categories', categories.index);

    // Get JSON model for categories
    router.get('/api/categories', categories.get);

    // Get JSON model for list of category groups
    router.get('/api/category-groups', categories.get_groups);

    // Get JSON model for list of category groups
    router.get('/api/categories-and-groups', categories.get_categories_and_groups);


    // ===== Registering to the contest

    // Display the registration form
    router.get('/register', register.index);

    // Display the registration search
    router.get('/registration-search', register.search);

    // Display the registration search
    router.post('/registration-details', register.get_details);

    // Register a new person and their items
    router.post('/api/register', register.put);


    // ===== Access restriction

    // Asynchronous Auth

    var authenticate = function(req, res, next) {
        var unauthorized = function(res) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.send(401);
        };

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
    };


    // ===== Registering to the contest

    // Display the registration search
    router.get('/admin/registration', authenticate, register.get_all);

    app.use(router);
};

