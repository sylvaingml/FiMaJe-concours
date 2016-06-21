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
var ObjectID = require('mongodb').ObjectID;

var exphbs = require('express-handlebars');

var authentification = require('./authentification');


// ===== DATABASE QUERY

function findListOfItemsPerCategory(onSuccess, onError) {
    
    var filterSingleCategory = function(category, itemList) {
        var filtered = [ ];

        for ( var index = 0; index < itemList.length; ++ index ) {
            if ( category === itemList[ index ].categoryCode ) {
                filtered.push(itemList[ index ]);
            }
        }

        return filtered;
    };
    
    var filterSubmitted = function(category, submittedList) {
        var filtered = [ ];

        for ( var index = 0; index < submittedList.length; ++ index ) {
            var items = filterSingleCategory(category, submittedList[ index ].items);
            if ( items.length > 0 ) {
                submittedList[ index ].items = items;
                filtered.push(submittedList[ index ]);
            }
        }

        return filtered;
    };
    
    var filterResult = function(result) {
        var output = [];
        
        for ( var index = 0 ; index < result.length ; ++index ) {
            var resultItem = result[ index ];
            var submitted = filterSubmitted(resultItem.code, resultItem.submitted);
            
            if ( submitted.length > 0 ) {
                resultItem.submitted = submitted;
                output.push(resultItem);
            }
        }
        
        return output;
    };
    
    var handleDbIsConnected = function(db) {
        //var submissions = db.collection('ContestSubmission');
        
        var categories = db.collection('Categories');
        
        var query = [
            { 
                $lookup: { 
                    from: 'ContestSubmission', 
                    localField: 'code', 
                    foreignField: 'items.categoryCode', 
                    as: 'submitted' 
                }
            }
        ];
        
        categories.aggregate(query).toArray(function(err, result) {
            if ( err ) {
                return onError({
                    error_code: 'DB.fetch',
                    message: "Error fetching contest submissions."
                });
            }
            else {
                db.close();
                var model = filterResult(result);
                return onSuccess(model);
            }
        });
    };

    return MongoClient.connect(settings.get('db_url'), function(err, db) {
        if ( err ) {
            console.error('Unable to connect to MongoDB: ' + err);
            return onError({
                error_code: 'DB.open',
                message: "Database connection error."
            });
        }
        else {
            return handleDbIsConnected(db);
        }
    });
}


// ===== REQUEST HANDLERS

function buildListOfNotes() {
    var notes = [ ];

    for ( var note = 0; note <= 20; ++ note ) {
        notes.push(note);
    }

    return notes;
}

function getNotationSheet(request, response)
{
    var handleSuccessFn = function(data) {
        var model = {
            "categories": data,
            helpers: {}
        };

        model.notes = buildListOfNotes();

        response.render("contest/notation-sheet", model);
    };

    var handleErrorFn = function(err) {
        var model = {
            "error": err
        };

        response.render('home.handlebars', model);
    };

    return findListOfItemsPerCategory(handleSuccessFn, handleErrorFn);
}


module.exports = {
    get_notation_sheet: getNotationSheet
};
