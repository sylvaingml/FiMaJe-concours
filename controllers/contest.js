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
var dbConnector = require('./db');


// ===== DATABASE QUERY


function getActiveContestListInDb(onSuccess) {
    var handleDbIsConnected = function(db) {
        return db.collection('Contests').find(
          {active: true},
          {_id: 0, contest: 1}
        )
          .toArray()
          .then(function(data) {
              return onSuccess(data);
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


function insertContestInDB(model, onSuccess, onError) {
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

    return dbConnector.connectAndProcess(handleDbIsConnected, onError);
}


function updateContestInDB(model, onSuccess, onError) 
{
    var objId = ObjectID.createFromHexString(model._id);
    var findQuery = {
        _id:   objId
    };
    
    var updateQuery = {
        $set: { 
            name: model.name, 
            isActive: model.isActive
        }
    };

    
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

    return dbConnector.connectAndProcess(handleDbIsConnected, onError);
}


function convertBallotToStorableForm(requestBallot)
{
    // We use a custom _id from contest and judge.
    var storable = {
        contest: requestBallot.contest,
        judge: requestBallot.judgeId,
        notes: requestBallot.notes
    };

    if ( requestBallot._id ) {
        storable._id = ObjectID.createFromHexString(requestBallot._id);
    }

    return storable;
}


function postJudgeBallot(requestBallot, onSuccess, onError)
{
    var ballot = convertBallotToStorableForm(requestBallot);

    var handleDbIsConnected = function(db) {
        var ballots = db.collection('ContestBallots');

        ballots.findOneAndUpdate(
          {
              contest: ballot.contest,
              judge:   ballot.judge
          },
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



function fetchUsers(model, continueFn)
{
    var processResults = function(results) {
        
        var map = {};
        while ( results.length > 0 ) {
            var current = results.shift();
            map[ current.login ] = current;
        }
        
        model.userList = map;
        
        return continueFn(model);
    };

    return dbConnector.getSortedCollectionAsArray("Users", {fullName: 1}, processResults);
}

function fetchCategories(model, continueFn)
{
    var processResults = function(results) {
        
        var map = {};
        while ( results.length > 0 ) {
            var current = results.shift();
            map[ current.code ] = current;
        }
        
        model.categoryList = map;
        
        return continueFn(model);
    };

    return dbConnector.getSortedCollectionAsArray("Categories", {order: 1}, processResults);
}

/** Fetch list of contests, categories and users.
 * 
 * @param {type} model
 * @param {type} continueFn
 * @returns {undefined}
 */
function fetchContests(model, continueFn)
{
    var continueAfterCategories = function(model) {
        fetchUsers(model, continueFn);
    };
    
    var continueAfterContests = function(model) {
        fetchCategories(model, continueAfterCategories);
    };
    
    var processResults = function(results) {
        model.contestList = results;
        return continueAfterContests(model);
    };

    return dbConnector.getSortedCollectionAsArray("Contests", {name: 1}, processResults);
}


function contestManager(request, response)
{
    var model = {};
    
    var renderResponse = function(model) {
        var categoryNameFn = function(code) {
            return model.categoryList[code].label;
        };
        
        var categoryGroupFn = function(code) {
            return model.categoryList[code].group;
        };
        
        var userNameFn = function(login) {
            var display = "N/A";
            if ( login && model.userList[login] ) {
                display = model.userList[login].fullName;
            }
            return display;
        };
        
        // Add some custom accessors to the root ctalogs
        
        model.helpers = {
            category_name:  categoryNameFn,
            category_group: categoryGroupFn,
            
            user_fullName: userNameFn
        };
        
        return response.render("admin/contest-list", model);
    };
    

    var onError = function(err) {
        var model = {
            "error": err
        };

        response.status(400).render("admin/contest-list", model);
    };


    return fetchContests(model, renderResponse, onError);
}

function editContest(request, response)
{
    var model = {
        'users':      null,
        'categories': null
    };

    var renderResponse = function() {
        response.render("admin/contest-edit", model);
    };
    
    var fetchUserList   = function(values) {
        model.users = values;
        
        renderResponse();
    };
    
    var fetchCategories = function(values) {
        model.categories = values;
        
        dbConnector.getCollectionAsArray("Users", fetchUserList);
    };
    
    dbConnector.getCategoriesByGroup(fetchCategories);
}


function updateContest(request, response)
{
    var renderContestsList = function(results) {
        var model = {
            contestList: results
        };
        
        response.render("admin/contest-list", model);
    };

    var handleSuccessFn = function(result) {
        var model = {
            "contest": result,
            helpers: {}
        };

        dbConnector.getSortedCollectionAsArray(
          "Contests",
          {contest: 1},
          renderContestsList
          );

    };

    var handleErrorFn = function(err) {
        console.error("Contest creation/update - Error: " + err);
        var model = {
            "error": err
        };

        response.status(400).render("admin/contest-list", model);
    };

    // Check request

    var model = {
        name:   request.body.name,
        active: false,
        
        categoryList: [],
        judgeList: [],
        
        closeDate:    null
    };
    
    if ( Array.isArray(request.body.category_list) ) {        
        while ( request.body.category_list.length > 0 ) {
            var value = request.body.category_list.shift();
            model.categoryList.push(value)
        }
    }
    else {
        model.categoryList.push(request.body.category_list);
    }

    if ( Array.isArray(request.body.user_list) ) {
        while ( request.body.user_list.length > 0 ) {
            var value = request.body.user_list.shift();
            model.judgeList.push(value);
        }
    }
    else {
        model.judgeList.push(request.body.user_list);
    }

    if ( request.body.uid && "" !== request.body.uid ) {
        // We have an identifier to update
        model._id = request.body.uid;
        
        return updateContestInDB(model, handleSuccessFn, handleErrorFn);
    }
    else {
        // No identifier provided, just create new contest
        model.creationDate = new Date();
        
        return insertContestInDB(model, handleSuccessFn, handleErrorFn);
    }
}

function getNotationSheet(request, response)
{
    var user = basicAuth(request);

    var handleSuccessFn = function(data) {
        var model = {
            contest:    request.body.contest,
            user:       request.body.user,
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

function getResultSheet(request, response) 
{
    var listOfContests = getActiveContestListInDb();
    
    var model = {
        contestList: request.body.contest
    };

    
}

function searchNotationSheet(request, response) 
{
    var user = basicAuth(request);

    var model = {
        user: user.name,
        contestList: [ "FiMaJe 2016" ] // TODO: return list from DB
    };
    
    response.render("contest/search-notation-sheet", model);
}


function getListOfContestsAPI(request, response) 
{
    var handleSuccessFn = function(data) {
        var model = {
            contestList: data
        };
        
        response.status(200).json(model);
    };

    var handleErrorFn = function(err) {
        var model = {
            "error": err
        };

        response.status(400).json(model);
    };
    
    // Check request

    var listOfContests = getActiveContestListInDb(handleSuccessFn);
    
    var model = {
        contestList: request.body.contest
    };

    return response.json(model);
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
    index:          contestManager,
    edit_contest:   editContest,
    update_contest: updateContest, 
    
    contest_api_get_list: getListOfContestsAPI,
    
    
    get_results: getResultSheet,
    
    search_notation_sheet: searchNotationSheet,
    get_notation_sheet:    getNotationSheet,
    post_notation_sheet:   postNotationSheet
};

