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

var basicAuth = require('basic-auth');



var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var exphbs = require('express-handlebars');

var authentification = require('./authentification');


// ===== DATABASE QUERY

function createContestInDB(model, onSuccess, onError) {
    var handleDbIsConnected = function(db) {
        var contests = db.collection('Contests');

        contests.insert(model, {}, function(err, result) {
            if ( err ) {
                return onError({
                    error_code: 'DB.insert',
                    message: "Error inserting contests."
                });
            }
            else {
                db.close();
                return onSuccess(result);
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


function convertBallotToStorableForm(requestBallot)
{
    // We use a custom _id from contest and judge.
    var storable = {
        _id: {
            contest: requestBallot.contest,
            judge:   requestBallot.judge
        },
        
        notes: requestBallot.notes
    };
    
    return storable;
}


function postJudgeBallot(requestBallot, onSuccess, onError)
{
    var ballot = convertBallotToStorableForm(requestBallot);

    var handleDbIsConnected = function(db) {
        var ballots = db.collection('ContestBallots');

        ballots.findOneAndUpdate(
          {_id: ballot._id},
          ballot, 
          function(err, result) {
              if ( err ) {
                  return onError({
                      error_code: 'DB.insert',
                      message: "Error inserting ballot."
                  });
              }
              else if ( null === result.value ) {
                  // No object modified, create new one
                  ballots.insert(ballot, function(error, result) {
                      db.close();
                      return onSuccess(result);
                  });
              }
              else {
                  db.close();
                  return onSuccess(result);
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


// ===== HELPERS

function buildListOfNotes() {
    var notes = [ ];

    for ( var note = 0; note <= 20; ++ note ) {
        notes.push(note);
    }

    return notes;
}


// ===== REQUEST HANDLERS


function getActiveContest(request, response)
{
    // TODO
}


function getListOfContests(request, response)
{
    // TODO
}

function createContest(request, response)
{
    var handleSuccessFn = function(result) {
        var model = {
            "contest": result,
            helpers: {}
        };

        response.status(200).json(model);
    };

    var handleErrorFn = function(err) {
        console.error("Contest creation - Error: " + err);
        var model = {
            "error": err
        };

        response.status(400).json(model);
    };

    // Check request

    var isJSON = request.body.dataType === 'application/json';

    if ( ! isJSON ) {
        return response.status(400).json({message: "Invalid request"});
    }

    var model = {
        _id: request.body.data.contest_name,
        active:       false,
        creationDate: new Date(),
        closeDate:    null
    };

    return createContestInDB(model, handleSuccessFn, handleErrorFn);
}

function getNotationSheet(request, response)
{
    var user = basicAuth(request);

    var handleSuccessFn = function(data) {
        var model = {
            contest:    "FiMaJe 2016", // BUG: this shall come from DB
            user:       user.name,
            categories: data,
            votes:      {}, // TODO: get saved notes from DB
            helpers:    {}
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



function postNotationSheet(request, response) 
{
    var handleSuccessFn = function(data) {
        var model = {
            helpers:  {}
        };
        
        if ( data.insertedIds ) {
            // Object is new and just inserted
            model.ballotId = data.insertedIds[0]._id;
        }
        else {
            // Updated object
            model.ballotId = data.value._id;
        }

        response.status(200).json(model);
    };

    var handleErrorFn = function(err) {
        var model = {
            "error": err
        };

        response.status(400).json(model);
    };
    
    
    // Check request

    var isJSON = request.body.dataType === 'application/json';

    if ( ! isJSON ) {
        return response.status(400).json({message: "Invalid request"});
    }

    // We could use the incoming request body, but want to ensure that 
    // data is limited to meaningful information.
    //
    var ballot = {
        judgeId: request.body.data.judge,
        contest: request.body.data.contest,
        notes:   request.body.data.notes
    };
    
    if ( request.body.data.ballotId ) {
        // Set an id if provided a ballot that is beeing updated
        ballot._id = request.body.data.ballotId;
    }

    return postJudgeBallot(ballot, handleSuccessFn, handleErrorFn);
}



module.exports = {
    index:          getListOfContests,
    create_contest: createContest,
    
    get_notation_sheet: getNotationSheet,
    post_notation_sheet: postNotationSheet
};
