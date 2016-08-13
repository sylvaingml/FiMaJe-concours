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


function getActiveContestListInDb(onSuccess, handleNoConnection) {
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

    return dbConnector.connectAndProcess(handleDbIsConnected, handleNoConnection);
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
                      return onSuccess(result);
                  });
              }
              else {
                  return onSuccess(result);
              }
          });
    };

    return dbConnector.connectAndProcess(handleDbIsConnected, onError);
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
                var model = filterResult(result);
                return onSuccess(model);
            }
        });
    };

    return dbConnector.connectAndProcess(handleDbIsConnected, onError);
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
        return fetchUsers(model, continueFn);
    };
    
    var continueAfterContests = function(model) {
        return fetchCategories(model, continueAfterCategories);
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

        return response.status(400).render("admin/contest-list", model);
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

function getNotationSheet(request, response) {
    var user = basicAuth(request);
    
    var contestName = request.body.contest;
    var judgeLogin  = request.body.user;

    console.log("getNotationSheet: contestName=" +contestName + " ; judgeLogin=" + judgeLogin);
    
    var existingNote = function(category, display) {
        var note = null;
        console.log("existingNote: " + category + ", " + category);
        
        if ( model.judgeNotes && model.judgeNotes[ category ] ) {
            var categoryNotes = model.judgeNotes[ category ];
            
            if ( categoryNotes.displayNotes 
              && categoryNotes.displayNotes[ display ]
              && categoryNotes.displayNotes[ display ].note ) {
                note = categoryNotes.displayNotes[ display ].note;
            }
        }
        
        return note;
    };
    
    
    var isSelected = function(category, display, noteToCheck) {
        console.log("isSelected: " + category + ", " + display + ", " + noteToCheck);
        
        var existing = existingNote(category, display);

        // Important to keep == as one value is string, the other a number
        var selected = existing && (noteToCheck == existing);

        return selected;
    };
    
    var selectedAttrForPlaceholder = function(category, display) {
        var attr = "";
        console.log("selectedAttrForPlaceholder: " + category + ", " + display);
        
        var currentNote = existingNote(category, display);
        if ( null === currentNote ) {
            attr="selected=\"selected\"";
        }
        
        return attr;
    };
    
    var selectedAttr = function(category, display, noteToCheck) {
        console.log("selectedAttr: " + category + ", " + display + ", " + noteToCheck);
        var attr = "";
        
        if ( isSelected(category, display, noteToCheck) ) {
            attr="selected=\"selected\"";
        }
        
        return attr;
    };

    // Core model for ballot: judge and contest name.
    var model = {
        name:       contestName,
        user:       judgeLogin,
        categories:  [], // Will be set in fetchContestCategories
        submissions: [], // Will be set in fetchContestSubmission
        judgeNotes:       {}, // 
        helpers:     {
            existing_note: existingNote,
            selected_attr: selectedAttr,
            placeholder_selected_attr: selectedAttrForPlaceholder
        }
    };

    // Model provide a list of possible notes
    model.notes = buildListOfNotes();

    var handleErrorFn = function(err) {
        var model = {
            "error": err
        };

        response.render('home.handlebars', model);
    };
    
    // Get each value from model.submission and insert it in corresponding model.categories
    //
    var injectSubmissionInCategories = function() {
        console.log("injectSubmissionInCategories:");
        // Build a list of items and store it in a category-specific map 
        // where key is the display code.
        for ( var index = 0; index < model.submissions.length; ++ index ) {
            var submission = model.submissions[ index ];
            var categoryIndex = model.categoryIndex[ submission._id.categoryCode ];
            var category = model.categories[ categoryIndex ];

            if ( ! category.submitted ) {
                // No list of submission yet, create one
                category.submitted = {};
            }

            for ( var itemIdx = 0; itemIdx < submission.submitted.length; ++ itemIdx ) {
                var item = submission.submitted[ itemIdx ];

                if ( ! category.submitted[ item.accessKey ] ) {
                    category.submitted[ item.accessKey ] = [ ];
                }

                category.submitted[ item.accessKey ].push(item.itemName);
            }
        }

        // Now that we have a map, we need to convert to a display-friendly list
        // of items per display.

        for ( var categoryIndex = 0; categoryIndex < model.categories.length; ++ categoryIndex ) {
            var category = model.categories[ categoryIndex ];
            var displayMap = category.submitted;
            var displayList = [ ];

            if ( displayMap ) {
                // Got a map, convert to list
                var displayKeys = Object.keys(displayMap);
                while ( displayKeys.length > 0 ) {
                    var accessKey = displayKeys.shift();

                    var displayEntry = {
                        accessKey: accessKey,
                        entries: displayMap[ accessKey ]
                    };

                    displayList.push(displayEntry);
                }
            }
            
            category.submitted = displayList;
        }
    };

    // Post-process data and render the final page.
    var handleSuccessFn = function() {  
        injectSubmissionInCategories();
        console.log("handleSuccessFn:");
        
        return response.render("contest/notation-sheet", model);
    };


    // Build a predicate to search a categoryCode value
    // To be used as 'or' condition in '$filter' action of fetchContestSubmission()
    //
    var createItemSubfilter = function(path, valueList) {
      var conditions = [];
      
      for ( var idx = 0 ; idx < valueList.length ; ++idx ) {
          var currentValue = valueList[ idx ];
          var testValue = { '$eq': [path, currentValue] };
          
          conditions.push(testValue);
      }
      
      return conditions;
    };

    var fetchContestSubmission = function(db, codeList) {
        var pipeline = [
            {
                // Only people submission containing any category from this contest
                $match: {
                    'items.categoryCode': { $in: codeList }
                }
            },
            {
                // Remove submission that are not part of current contest
                $project: {
                    userAccessKey: '$userInfo.accessKey',
                    itemsContest: {
                        $filter: {
                            input: '$items',
                            as: 'items',
                            cond: {
                                $or: createItemSubfilter('$$items.categoryCode', codeList)
                            }
                        }
                    }
                }
            },
            {
                // Flatten submissions list in the result
                $unwind: {
                    path: '$itemsContest',
                    includeArrayIndex: 'itemIndex',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                // Flatten itemsContest object in the result
                $project: {
                    userAccessKey: 1,
                    itemName: '$itemsContest.name',
                    itemCategory: '$itemsContest.categoryCode'
                }
            },
            {
                // Group by category code
                $group: {
                    _id: { categoryCode: '$itemCategory' },
                    count: { $sum: 1 },
                    submitted: {
                        // Each submission is an entry in the result element
                        $push: {
                            accessKey: '$userAccessKey',
                            itemName: '$itemName',
                            categoryCode: '$itemCategory'
                        }
                    }
                }
            }
        ];

        console.log("Fetching ContestSubmission: pipeline=" + JSON.stringify(pipeline));
              
        var aggregatePromise = null;
        var returned = null;
        
        try {
            db.collection('ContestSubmission').aggregate(pipeline)
              .toArray()
              .then(function(result) {
                  if ( result && result.length > 0 ) {
                      model.submissions = result;
                  }
                  else {
                      console.log("Accessing voting ballot when no submission was registered.");
                  }
                  console.log("model.submissions" + JSON.stringify(model.submissions));

                  return handleSuccessFn();
              });
        }
        catch ( error ) {
            console.error("ERROR on aggregate: " + error);
            returned = handleSuccessFn();
        }
        
        return returned;
    };

    // Build a mapping from category code to index in the list
    var createCodeToIndexMap = function(categoryList) {
        var map = {};
        
        for ( var index = 0 ; index < categoryList.length ; ++index ) {
            var code = categoryList[ index ].code;
            map[ code ] = index;
        }
        
        return map;
    };

    // Build list of category objets for this contest
    var fetchContestCategories = function(db, codeList) {
        var query = {
            code: { $in: codeList }
        };

        console.log("fetchContestCategories: query=" + JSON.stringify(query));

        return db.collection('Categories')
          .find(query)
          .toArray()
          .then(function(categoryList) {
              model.categories = categoryList;
              model.categoryIndex = createCodeToIndexMap(categoryList);

              console.log("model.categories=" + JSON.stringify(model.categories));
              console.log("model.categoryIndex=" + JSON.stringify(model.categoryIndex));
              
              return fetchContestSubmission(db, codeList);
          });
    };

    var fetchContestCategoriesCodes = function(db) {
        var query = {
            'name': contestName
        };
        var mapping = {
            _id: 0,
            categoryList: 1
        };
        
        console.log("fetchContestCategoriesCodes: query=" + JSON.stringify(query));


        db.collection('Contests')
          .find(query, mapping)
          .toArray()
          .then(function(result) {
              if ( result && (result.length > 0) ) {
                var categoryCodeList = result[ 0 ].categoryList;
              }
              console.log("categoryCodeList=" + JSON.stringify(categoryCodeList));
              return fetchContestCategories(db, categoryCodeList);
          });
    };
    
    var fetchCurrentBallot = function(db) {
        var query = {
            'contest': contestName,
            'judge': judgeLogin
        };

        console.log("fetchCurrentBallot:");

        db.collection('ContestBallots')
          .find(query)
          .toArray()
          .then(function(result) {
              if ( result && (result.length > 0) ) {
                  model.judgeNotes = result[ 0 ].notes;
                  console.log("model.judgeNotes=" + JSON.stringify(model.judgeNotes));
              }
              return fetchContestCategoriesCodes(db);
          });
    };
    
    return dbConnector.connectAndProcess(fetchCurrentBallot, handleErrorFn);
}



function average(valueList) 
{
    var sum = 0;
    var count = 0;

    valueList.forEach(function(value) {
        if ( value >= 0 ) {
            sum += value;
            count += 1;
        }
    });

    var avg = null;
    if ( count > 0 ) {
        avg = Math.round((sum / count) * 100) / 100;
    }

    return avg;
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
    
    // And now compute the average note for each disply in given category
    var keys = Object.keys(displayResults);
    while ( keys.length > 0 ) {
        var resultKey = keys.shift();
        var result = displayResults[ resultKey ];
        
        result.averageNote = average(result.notes);
        
        // And take the time to sort the list of notes
        result.notes = result.notes.sort(function(a, b) { return a < b; });
    }
    
    return displayResults;
}



function buildCategoryResults(displayResults)
{
    var categoryResults = {};
    
    var keys = Object.keys(displayResults);
    
    // 1. Build the results for each categories
    while ( keys.length > 0 ) {
        var resultKey = keys.shift();
        var result = displayResults[ resultKey ];
        
        // Create entry in final output if none
        if ( ! categoryResults[ result.categoryCode ] ) {
            categoryResults[ result.categoryCode ] = {
                categoryCode: result.categoryCode,
                notes: []
            };
        }
        
        // Create object to store display and its average note
        var displayNote = {
            displayCode: result.displayCode,
            note: result.averageNote
        };
        
        // Add this note entry to the list
        categoryResults[ result.categoryCode ].notes.push(displayNote);
    }
    
    // 2. Properly sort results in each category
    
    var compareDisplayNotes = function(a, b) {
        var comparison = 0;
                
        if ( a.note > b.note ) {
            comparison = -1;
        }
        else if ( a.note < b.note ) {
            comparison = 1;
        }
        
        return comparison;
    };
    
    var categoryCodeList = Object.keys(categoryResults);
    while ( categoryCodeList.length > 0 ) {
        var categoryCode = categoryCodeList.shift();
        var result = categoryResults[ categoryCode ];
        
        var sortedNotes = result.notes.sort(compareDisplayNotes);
        
        result.notes = sortedNotes;
    }
    
    return categoryResults;
}


function dispathCategoryResults(model)
{
    for ( var groupIdx = 0 ; groupIdx < model.categoryByGroup.length ; ++groupIdx ) {
        // For each group of category...
        var group = model.categoryByGroup[ groupIdx ];
        
        for ( var categoryIdx = 0 ; categoryIdx < group.categories.length ; ++categoryIdx ) {
            // For each category in this group...            
            var category = group.categories[ categoryIdx ];
            
            category.group = group._id;
            
            var categoryCode = category.code;
            var results = model.categoryResults[ categoryCode ];
            
            if ( results ) {
                var notes = results.notes;
                category.notes = notes;
            }
        }
    }
}


function getResultSheet(request, response) 
{
    var contestName = request.body.contest;
    
    var numberFormatter = Intl.NumberFormat('FR-fr', {
        minimumIntegerDigits:  1,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    var model = {
        contest: {
            name: contestName
        },
        
        helpers: {
            format_note: function(note) {
                var value = Number(note);
                return numberFormatter.format(value);
            }
        }
    };
    
    // Send model to the template to return proper rendering
    //
    var renderFinalModel = function(model) {
        return response.render("admin/contest-results", model);
    };
    
    // Fetch basic users info
    //
    var fetchPeople = function() {
      var process = function(people) {
          
          var peopleMap = {};
          
          while ( people.length > 0 ) {
              var current = people.shift();
              peopleMap[ current.userInfo.accessKey ] = current;
          }
          
          model.people = peopleMap;
          
          model.helpers.people_firstName = function(accessKey) {
            return model.people[ accessKey ].userInfo.firstName;
          };
          
          model.helpers.people_lastName = function(accessKey) {
            return model.people[ accessKey ].userInfo.lastName;
          };
          
          model.helpers.people_club = function(accessKey) {
            return model.people[ accessKey ].userInfo.club;
          };
          
          return renderFinalModel(model);
      };
      
      return dbConnector.getCollectionAsArray('ContestSubmission', process);
    };
    

    // Fetch categories and groups to add them to the model
    //
    var fetchCategoriesByGroup = function() {
        
        var process = function(categories) {
            model.categoryByGroup = categories;
            
            dispathCategoryResults(model);
            
            return fetchPeople();
        };
        
        return dbConnector.getCategoriesByGroup(process);
    };
    
    
    // Fetch category dictionnary
    //
    var fetchCategories = function() {
        
        var process = function(categories) {
            
            var categoryMap = {};
            
            while ( categories.length > 0 ) {
                var current = categories.shift();
                categoryMap[ current.code ] = current;
            }
            
            model.categories = categoryMap;

            return fetchCategoriesByGroup();
        };
        
        return dbConnector.getCollectionAsArray("Categories", process);
    };
    
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
              model.displayResults = buildDisplayNotes(result);
              model.categoryResults = buildCategoryResults(model.displayResults);

              return fetchCategoriesByGroup();
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

    return dbConnector
      .getCollectionAsArray('Contests', function(contestList) {
          
        var contestNameList = [];
        while ( contestList.length > 0 ) {
            var current = contestList.shift();
            contestNameList.push(current.name);
        }
        
        contestNameList.sort();
          
          var model = {
              user: user.name,
              contestList: contestNameList
          };

          return response.render("contest/search-notation-sheet", model);
      });
}


function getListOfContestsAPI(request, response) 
{
    var handleSuccessFn = function(data) {
        var model = {
            contestList: data
        };
        
        return response.status(200).json(model);
    };

    var handleErrorFn = function(err) {
        var model = {
            "error": err
        };

        return response.status(400).json(model);
    };
    
    // Check request

    return getActiveContestListInDb(handleSuccessFn, handleErrorFn);
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

