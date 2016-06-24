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

var home = require('../controllers/home');
var admin = require('../controllers/admin');
var adminUsers = require('../controllers/users');
var categories = require('../controllers/categories');
var register = require('../controllers/register');
var contest = require('../controllers/contest');

var authentification = require('../controllers/authentification');

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

    // ===== ADMINISTRATION
    
    var enterAsGod = function(req, res, next) {
        return authentification.authenticate('god', req, res, next);
    };
    
    var enterAsElfOrBetter = function(req, res, next) {
        return authentification.authenticate(['god', 'wizard', 'elf'], req, res, next);
    };
    
    // Display the administration console
    router.get('/admin', enterAsGod, admin.index);

    // ===== Manage Users
    
    // Display the list of users
    router.get('/admin/users', enterAsGod, adminUsers.index);
    
    // Display the user creation form
    router.get('/admin/add-user', enterAsGod, adminUsers.add_user);
    
    // Validate a user's creation
    router.post('/api/admin/add-user', enterAsGod, adminUsers.add_user_confirmed);
    
    // Validate a user's deletion
    router.post('/api/admin/delete-user', enterAsGod, adminUsers.delete_user);
    
    // Validate a user's info update (name and email only)
    router.post('/api/admin/update-user', enterAsGod, adminUsers.update_user_info);
    
    // Validate a user's password update
    router.post('/api/admin/update-user-password', enterAsGod, adminUsers.update_user_password);
    
    
    // ===== Manage Contest

    // Display the registration search
    router.get('/admin/registration', enterAsGod, register.get_all);

    // ===== Contest 

    // Display the list of contests, each provide link to result sheet and activation
    router.get('/contest', enterAsGod, contest.index);

    // Display the registration search
    router.get('/contest/results', enterAsGod, contest.get_results);

    // Display the registration search
    router.get('/contest/search-vote', enterAsElfOrBetter, contest.search_notation_sheet);
    
    // Display the registration search
    router.post('/contest/vote', enterAsElfOrBetter, contest.get_notation_sheet);

    // Submit a judge vote sheet
    router.post('/api/contest/post-ballot', enterAsElfOrBetter, contest.post_notation_sheet);

    app.use(router);
};

