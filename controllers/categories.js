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


function findListOfCategories(onSuccessFn, onErrorFn)
{
    return MongoClient.connect(settings.get('db_url'), function(err, db)
    {
        if ( err ) {
            console.error('Unable to connect to MongoDB: ' + err);
            onErrorFn(err);
        }
        else {
            var dbCategories = db.collection('Categories');
            dbCategories.find({}, {_id: false, order: false})
              .sort({order: 1})
              .toArray(function(err, result)
              {
                  if ( err ) {
                      onErrorFn(err);
                  }
                  else {
                      onSuccessFn(result);
                      db.close();
                  }
              });
        }
    });
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
    
    return MongoClient.connect(settings.get('db_url'), function(err, db)
    {
        if ( err ) {
            console.error('Unable to connect to MongoDB: ' + err);
            onErrorFn(err);
        }
        else {
            var dbCategories = db.collection('Categories');
            
            dbCategories.distinct('group', function(err, result) {
                  if ( err ) {
                      onErrorFn(err);
                  }
                  else {
                      onGroupSuccess(result);
                  }
            });
            
            dbCategories.find({}, {_id: false, order: false})
              .sort({order: 1})
              .toArray(function(err, result)
              {
                  if ( err ) {
                      onErrorFn(err);
                  }
                  else {
                      onCategoriesSuccess(result);
                      onSuccessFn(categoriesAndGroups);
                  }
              });
        }
    });
}

module.exports = {
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

