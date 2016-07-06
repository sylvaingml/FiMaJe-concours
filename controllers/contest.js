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
            active: model.active,
            
            categoryList: model.categoryList,
            judgeList: model.judgeList
        }
    };

    
    var handleDbIsConnected = function(db) {
        var contests = db.collection('Contests');

        contests.findAndModify(
          findQuery,
          {},
          updateQuery,
          { new: true },
          function(err, result) {
              if ( err ) {
                  return onError({
                      error_code: 'DB.update',
                      message: "Error updating contests."
                  });
              }
              else {
                  db.close();
                  return onSuccess(result.value);
              }
          });
    };

    return dbConnector.connectAndProcess(handleDbIsConnected, onError);
}


function updateContestActivationInDB(model, onSuccess, onError) 
{
    var objId = ObjectID.createFromHexString(model._id);
    var findQuery = {
        _id:   objId
    };
    
    var updateQuery = {
        $set: { 
            active: model.active
        }
    };

    
    var handleDbIsConnected = function(db) {
        var contests = db.collection('Contests');

        contests.findAndModify(
          findQuery,
          {},
          updateQuery,
          {},
          function(err, result) {
              if ( err ) {
                  return onError({
                      error_code: 'DB.update',
                      message: "Error updating contests."
                  });
              }
              else {
                  db.close();
                  return onSuccess(result.value);
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
            current.password = null;
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


function renderListOfContests(model, response)
{
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
    
    var activeClassFn = function(active) {
        return (active) ? "active-on" : "active-off";
    };

    // Add some custom accessors to the root ctalogs

    model.helpers = {
        category_name: categoryNameFn,
        category_group: categoryGroupFn,
        user_fullName: userNameFn,
        active_class: activeClassFn
    };

    return response.render("admin/contest-list", model);
}

function contestManager(request, response)
{
    var model = {};
    
    var renderResponse = function(model) {
        return renderListOfContests(model, response);
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
        'categories': null,
        'contest': {},
        
        helpers: {
            to_json: function(obj) {
                return JSON.stringify(obj);
            }
        }
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
    
    if ( request.body && request.body.uid && '' !== request.body.uid ) {
        // Existing ID was specified, this is an update
        // fetch the existing 
        var fetchedExisting = function(contest) {
            model.contest = contest;
            
            dbConnector.getCategoriesByGroup(fetchCategories);
        };
        
        dbConnector.getObjectById('Contests', request.body.uid, fetchedExisting);
    }
    else {
        dbConnector.getCategoriesByGroup(fetchCategories);
    }
};


function updateContest(request, response)
{
    // Check request and build model for DB update

    var model = {
        name:   request.body.name,
        active: ( 'true' === request.body.is_active ) ? true : false,
        
        categoryList: [],
        judgeList: [],
        
        closeDate: null
    };
    
    if ( Array.isArray(request.body.category_list) ) {        
        while ( request.body.category_list.length > 0 ) {
            var value = request.body.category_list.shift();
            model.categoryList.push(value);
        }
    }
    else if ( request.body.category_list ) {
        model.categoryList.push(request.body.category_list);
    }

    if ( Array.isArray(request.body.user_list) ) {
        while ( request.body.user_list.length > 0 ) {
            var value = request.body.user_list.shift();
            model.judgeList.push(value);
        }
    }
    else if ( request.body.user_list ) {
        model.judgeList.push(request.body.user_list);
    }

    // Perform request and return to list manager
    
    var handleSuccessFn = function(result) {
        return contestManager(request, response);
    };

    var handleErrorFn = function(error) {
        console.error("Failed to insert/update contest: ", error);
        return contestManager(request, response);
    };

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


/** Process incoming JSON request to change 'active' property of a contest.
 * 
 * @param {type} request 
 *  Incoming request.
 *  The following parametersa re expected:
 *      - name: string, the name of the contest to update
 *      - active: boolean, the new value for active property.
 *      
 * @param {type} response 
 *  Outgoing response will be in JSON format.
 *  
 * @returns {unresolved}
 */
function contestActivation(request, response) 
{
    var handleUpdateSuccess = function(updatedModel) {
        var model = {
            'updated': updatedModel
        };
        
        return response.json(model);
    };
    
    var handleError = function(error) {
        var model = {
            'error': error
        };
        return response.status(400).json(model);
    };
    
    // Check request

    var isJSON = request.body.dataType === 'application/json';

    if ( ! isJSON ) {
        return response.status(400).json({message: "Invalid request"});
    }

    // Process request
   
    var contestId     = request.body.data.uid;
    var activateState = request.body.data.active;
    
    if ( contestId && ('' !== contestId) && ('undefined' !== typeof activateState) ) {
        // Valid input, go on...
        model = {
            _id: contestId,
            active: activateState
        };
        updateContestActivationInDB(model, handleUpdateSuccess, handleError);
    }
    else {
        // Invalid or incomplete input. Return an error
        return handleError("Invalid incoming request");
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

/** Convert the list of ballots to a per-display result.
 * 
 * Returned value is an object:
 * {
 *   displayNotes: {
 *     DISPLAY_ID: {
 *       categoryCode: CODE,
 *       notes: [ NOTE, ... ],
 *       averageNote: avg($.notes)
 *     }
 *   }
 * }
 * 
 * 
 * @param {type} ballotList
 * @returns {undefined}
 * 
 */
function buildDisplayNotes(ballotList) 
{
    var displayResults = {};
    
    // For each ballot...
    for ( var ballotIdx = 0 ; ballotIdx < ballotList.length ; ++ballotIdx ) {
        var notes = ballotList[ ballotIdx ].notes;
        var categoryCodeList = Object.keys(notes);
        
        // For each category
        for ( var categoryIdx = 0 ; categoryIdx < categoryCodeList.length ; ++categoryIdx ) {
            var categoryCode = categoryCodeList[ categoryIdx ];
            
            var displayNotes = notes[ categoryCode ].displayNotes;
            var displayIdList = Object.keys(displayNotes);
            
            // For each display with a note...
            for ( var displayIdx = 0 ; displayIdx < displayIdList.length ; ++ displayIdx ) {
                var displayId = displayIdList[ displayIdx ];
                var currentNote = displayNotes[ displayId ];
                
                var displayKey = categoryCode + ':' + displayId;
                
                // Add this note as global results.
                var results = displayResults[ displayKey ];
                if ( ! results ) {
                    // No results yet, create structure
                    results = {
                        displayCode: displayId,
                        categoryCode: categoryCode,
                        notes: [],
                        averageNote: -1
                    };
                    
                    displayResults[ displayKey ] = results;
                }
                
                results.notes.push(Number(currentNote.note));
            }
        }
    }
    
    return displayResults;
}


function getResultSheet(request, response) 
{
    var contestName = request.body.contest;
    
    // 1. Get all the voting ballots.
    // 2. Extract notes for each display
    
    var handleConnected = function(db) {

        var ballots = db.collection('ContestBallots');

        var query = {
            'contest': contestName
        };

        return ballots
          .find(query)
          .toArray()
          .then(function(result) {
              db.close();
              var model = {
                  contest: {
                      name: contestName
                  },
                  
                  helpers: {
                      note_list: function(notes) {
                          return notes
                            .sort(function(a, b) { return a > b; })
                            .join(', ');
                      },
                      
                      average: function(notes) {
                          var sum = 0;
                          var count = 0;
                          
                          notes.forEach(function(value) {
                              if ( value >= 0 ) {
                                  sum += value;
                                  count += 1;
                              }
                          });
                          
                          var avg = "--";
                          if ( count > 0 ) {
                              avg = Math.round((sum / count) * 100) / 100;
                          }
                          
                          return avg;
                      }
                  }
              };

              model.displayResults = buildDisplayNotes(result);

              return response.render("admin/contest-results", model);
          });
    };

    var handleError = function(err) {
        var model = {
            "error": err
        };

        return response.render('admin/contest-list.handlebars', model);
    };

    return dbConnector.connectAndProcess(handleConnected, handleError);
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
    contest_activation: contestActivation, 
    
    contest_api_get_list: getListOfContestsAPI,
    
    
    get_results: getResultSheet,
    
    search_notation_sheet: searchNotationSheet,
    get_notation_sheet:    getNotationSheet,
    post_notation_sheet:   postNotationSheet
};

