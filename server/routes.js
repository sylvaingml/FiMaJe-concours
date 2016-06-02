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
var router  = express.Router();

var categories = require('../controllers/categories');
var register   = require('../controllers/register');

module.exports = function(app)
{
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

  // Register a new person and their items
  router.get('/api/register', register.index);

  app.use(router);
};

