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
var pricing = require('../controllers/pricing');

var authentification = require('../controllers/authentification');


function requireHTTPS(request, response, next) {
    if ( 'https' === request.headers[ 'x-forwarded-proto' ] ) { 
        return next(); 
    } else {
        console.log("REDIRECT to secure...");
        response.redirect('https://' + request.headers.host + request.path);
    }
}


// ===== Routing Configuration

module.exports = function(app)
{
    // ===== Home screen

    router.get('/', home.index);
    
    // ===== Pricing Information

    // Display the list of categories
    router.get('/pricing', pricing.index);

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

    // Display the registration form for administration 
    router.get('/admin/register', authentification.enterAsWizardOrBetter, register.index);

    // Display the registration search
    router.get('/registration-search', register.search);

    // Display the registration search
    router.post('/registration-details', register.get_details);

    // Register a new person and their items
    router.post('/api/register', register.put);

    // ===== ADMINISTRATION
    
    // Display the administration console
    router.get('/admin', authentification.enterAsWizardOrBetter, admin.index);

    // Clear authentication
    router.get('/user-welcome', authentification.initializePassword);

    // Clear authentication
    //router.get('/logout', authentification.logout, home.index);


    // ===== Manage Users
    
    // Display the list of users
    router.get('/admin/users', authentification.enterAsWizardOrBetter, adminUsers.index);
    
    // Display the user creation form
    router.get('/admin/add-user', authentification.enterAsWizardOrBetter, adminUsers.add_user);
    
    // Validate a user's creation
    router.post('/api/admin/add-user', authentification.enterAsWizardOrBetter, adminUsers.add_user_confirmed);
    
    // Validate a user's deletion
    router.post('/api/admin/delete-user', authentification.enterAsGod, adminUsers.delete_user);
    
    // Validate a user's info update (name and email only)
    router.post('/api/admin/update-user', authentification.enterAsWizardOrBetter, adminUsers.update_user_info);
    
    // Validate a user's group update
    router.post('/api/admin/update-user-groups', authentification.enterAsWizardOrBetter, adminUsers.update_user_groups);
    
    // Validate a user's password update
    router.post('/api/admin/update-user-password', authentification.enterAsWizardOrBetter, adminUsers.update_user_password);
    
    // Initial set of a user's password...
    router.post('/api/admin/set-user-password', adminUsers.set_user_password);
    
    // ===== Manage Contest

    // Display the registration search
    router.get('/admin/registration', authentification.enterAsWizardOrBetter, register.get_all);

    // ===== Contest 

    // Display the list of contests, each provide link to result sheet and activation
    router.get('/admin/contest', authentification.enterAsWizardOrBetter, contest.index);
    
    // Display contest editor to create or update a contest
    //
    // - GET is mostly for creation,
    // - POST is for update and requires an "uid" parameter.
    // 
    router.get('/admin/contest-edit', authentification.enterAsWizardOrBetter, contest.edit_contest);
    router.post('/admin/contest-edit', authentification.enterAsWizardOrBetter, contest.edit_contest);
    
    // Process a contest create/update request.
    router.post('/admin/contest-update', authentification.enterAsWizardOrBetter, contest.update_contest);
    
    // Set the activation state of the contest
    // 
    // PARAM:
    // - name: contest name
    // - active: boolean the activation state
    //
    router.post('/api/admin/contest-activation', authentification.enterAsWizardOrBetter, contest.contest_activation);


    // Display the registration search
    router.get('/contest/search-vote', authentification.enterAsElfOrBetter, contest.search_notation_sheet);
    
    // Display the registration search
    router.post('/contest/vote', authentification.enterAsElfOrBetter, contest.get_notation_sheet);


    // Display the registration search
    router.post('/admin/contest-results', authentification.enterAsWizardOrBetter, contest.get_results);

    // An API to get the list of active contests
    router.get('/api/list-contests', contest.contest_api_get_list);

    // Submit a judge vote sheet
    router.post('/api/contest/post-ballot', authentification.enterAsElfOrBetter, contest.post_notation_sheet);

    if ( "production" === process.env.NODE_ENV ) {
        console.log("PRODUCTION ENV detected, will force https...");
        app.use(requireHTTPS);
    }
    
    app.use(router);
};

