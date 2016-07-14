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
var exphbs = require('express-handlebars');

var dbConnector = require('./db');


function findListOfCategories(onSuccessFn, onErrorFn)
{
    var handleDbIsConnected = function(db) {
        var dbCategories = db.collection('Categories');
        return dbCategories.find({}, {_id: false, order: false})
          .sort({order: 1})
          .toArray(function(err, result)
          {
              if ( err ) {
                  onErrorFn(err);
              }
              else {
                  onSuccessFn(result);
              }
          });
    };


    return dbConnector.connectAndProcess(handleDbIsConnected, onErrorFn);
}
    

function findListOfCategoriesAndGroups(onSuccessFn, onErrorFn)
{
    var categoriesAndGroups = {
      categories: {},
      groups:     []
    };
    
    var onGroupSuccess = function(data) {
        categoriesAndGroups.groups = data;
    };
    
    var onCategoriesSuccess = function(data) {
        for ( var index = 0 ; index < categoriesAndGroups.groups.length ; ++index ) {
            var group = categoriesAndGroups.groups[ index ];
            categoriesAndGroups.categories[ group ] = [];
        }
        
        for ( var index = 0 ; index < data.length ; ++index ) {
            var category = data[ index ];
            var group = category.group;
            
            categoriesAndGroups.categories[group].push(category);
        }
    };
    
    var handleDbIsConnected = function(db) {
        var dbCategories = db.collection('Categories');

        dbCategories.distinct('group', function(err, result) {
            if ( err ) {
                return onErrorFn(err);
            }
            else {
                onGroupSuccess(result);
            }
        });

        return dbCategories.find({}, {_id: false, order: false})
          .sort({order: 1})
          .toArray(function(err, result)
          {
              if ( err ) {
                  onErrorFn(err);
              }
              else {
                  onCategoriesSuccess(result);
                  return onSuccessFn(categoriesAndGroups);
              }
          });
    };
    
    return dbConnector.connectAndProcess(handleDbIsConnected, onErrorFn);
}

module.exports = {
    get_categories_by_code: function(onSuccessCallback) { 
        var onError = function(error) {
            return onSuccessCallback({});
        };
        
        var onSuccess = function(list) {
            var categoryMap = {};

            for ( var idx = 0 ; list && idx < list.length ; ++idx ) {
                var category = list[idx];
                
                categoryMap[ category.code ] = {
                    label: category.label,
                    group: category.group
                };
            }
            
            return onSuccessCallback(categoryMap);
        };
        
        return findListOfCategories(onSuccess, onError);
    },
    
    // -----
    
    /** Returns the list of categories as JSON data.
     * 
     * @param {type} request
     * @param {type} response
     * 
     * @returns {undefined} 
     */
    index: function(request, response)
    {
        var handleSuccessFn = function(data)
        {
            var model = {
                "categories": data
            };
            response.render('category-list.handlebars', model);
        };

        var handleErrorFn = function(err)
        {
            console.error("Categories - Error: " + err);
            var model = {
                "message": err
            };

            response.render('category-list.handlebars', model);
        };

        findListOfCategories(handleSuccessFn, handleErrorFn);
    },
    
    
    get: function(request, response)
    {
        var handleSuccessFn = function(data)
        {
            response.status(200).json(data);
        };

        var handleErrorFn = function(err)
        {
            console.error("Categories - Error: " + err);
            response.status(400).json( { 'message': err } );
        };
        
        findListOfCategories(handleSuccessFn, handleErrorFn);
    },
    
    
    get_groups: function(request, response)
    {
        return MongoClient.connect(settings.get('db_url'), function(err, db)
        {
            if ( err ) {
                console.error('Unable to connect to MongoDB: ' + err);
                response.status(400).json({'error': err});
            }
            else {
                db.collection('Categories').distinct('group', function(err, result)
                {
                    response.status(200).json(result);
                    db.close();
                });
            }
        });
    },

    get_categories_and_groups: function(request, response)
    {
        var handleSuccessFn = function(data)
        {
            response.status(200).json(data);
        };

        var handleErrorFn = function(err)
        {
            console.error("Categories and groups - Error: " + err);
            response.status(400).json( { 'message': err } );
        };
        
        findListOfCategoriesAndGroups(handleSuccessFn, handleErrorFn);
    }
    
};

