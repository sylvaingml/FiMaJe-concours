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

var categories = require('../controllers/categories');
var authentification = require('../controllers/authentification');

var dbConnector = require('./db');
var pricing = require('./pricing');

// ===== INTERNALS


function createDbObjectFromRequest(requestData) {
    var now = new Date();
    // Generate some non-random numeric key as double identification to access registration
    var accessKey = (now.getTime() % 420000).toString();

    (new Date()).getTime() % 420024;

    var dbObject = {
        // Personnal informations
        userInfo: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            club: "",
            registeredOnline: false,
            registerDate: new Date(),
            accessKey: accessKey
        },
        
        // Registered items for contests
        items: [ ],
        
        // Payment information
        price: {
            rateCode: null,
            amount: null
        }
    };

    // Populate person's details

    dbObject.userInfo.firstName = requestData.userInfo.firstName.trim();
    dbObject.userInfo.lastName = requestData.userInfo.lastName.trim();
    dbObject.userInfo.phone = requestData.userInfo.phone.trim();
    dbObject.userInfo.email = requestData.userInfo.email.trim();
    dbObject.userInfo.club = requestData.userInfo.club.trim();

    if ( requestData.userInfo.registeredOnline ) {
        dbObject.userInfo.registeredOnline = true;
    }

    // Populate item list

    for ( var index = 0; index < requestData.items.length; index += 1 ) {
        var itemInfo = {
            name: requestData.items[index].name.trim(),
            categoryCode: requestData.items[index].categoryCode.trim()
        };

        dbObject.items.push(itemInfo);
    }
    
    // Populate pricing information
    
    if ( requestData.price ) {
        dbObject.price.rateCode = requestData.price[ 'rateCode' ];
        // Price that person expected to pay, even if we change the value in 
        // pricing collection.
        dbObject.price.amount   = Number.parseFloat( requestData.price[ 'amount' ] );
    }
    
    return dbObject;
}



function registerUserSubmission(submissionDetails, onSuccessFn, onErrorFn)
{
    var connectedToDb = function(db) {
        var dbTable = db.collection('ContestSubmission');

        dbTable.insertMany([ submissionDetails ], function(error, result) {
            if ( error ) {
                return onErrorFn(error);
            }
            else {
                return onSuccessFn(result);
            }
        });
    };

    return dbConnector.connectAndProcess(connectedToDb, onErrorFn);
}


function findUserSubmission(userEmail, accessKey, onSuccessFn, onErrorFn)
{
    var connectedToDb = function(db) {
        var dbTable = db.collection('ContestSubmission');

        var query = {
            'userInfo.email': userEmail,
            'userInfo.accessKey': accessKey
        };

        dbTable.find(query).limit(1).next(function(err, result) {
            if ( err || null === result ) {
                onErrorFn(err);
            }
            else {
                onSuccessFn(result);
            }
        });
    };

    return dbConnector.connectAndProcess(connectedToDb, onErrorFn);
}




function fetchRegistrationSummary(onSuccessFn, onErrorFn)
{
    var connectedToDb = function(db) {
        var dbTable = db.collection('ContestSubmission');

        var pipe = [
            {
                $match: {'price.amount': {'$exists': true}}
            },
            {
                $group: {
                    _id: null,
                    'total': {'$sum': '$price.amount'},
                    'count': {'$sum': 1}
                }
            }
        ];

        dbTable
          .aggregate(pipe)
          .toArray(function(error, result) {
              var summary = {
                  'total': 0.0,
                  'count': 0
              };
              
              if ( result && result[0] ) {
                  summary = {
                      'total': result[0][ 'total' ],
                      'count': result[0][ 'count' ]
                  };   
              }

              if ( error || null === result ) {
                  onErrorFn(error);
              }
              else {
                  onSuccessFn(summary);
              }
          });
    };

    return dbConnector.connectAndProcess(connectedToDb, onErrorFn);
}


function findAllUserSubmission(onSuccessFn, onErrorFn)
{
    var connectedToDb = function(db) {
        var dbTable = db.collection('ContestSubmission');
        var sorting = [
            [ 'userInfo.lastName', 1 ],
            [ 'userInfo.firstName', 1 ]
        ];

        dbTable.find().sort(sorting).toArray(function(error, result) {
            if ( error || null === result ) {
                onErrorFn(error);
            }
            else {
                onSuccessFn(result);
            }
        });
    };
    
    return dbConnector.connectAndProcess(connectedToDb, onErrorFn);
}


function createItemListPerCategory(itemList) {
    var categoryItems = {};

    for ( var index = 0; index < itemList.length; ++ index ) {
        var category = itemList[ index ].categoryCode;
        var name = itemList[ index ].name;

        if ( ! categoryItems[ category ] ) {
            categoryItems[ category ] = [ ];
        }

        categoryItems[ category ].push(name);
    }

    return categoryItems;
}



// ===== PUBLIC API IMPLEMENTATION

/** Render the user's submission form to register to the contest.
 * 
 * @param {type} request
 * @param {type} response
 * 
 * @returns {undefined} 
 */
function registerForm(request, response) {
    
    var model = {
        'pricing': {},
        
        // YES, 10 is always the "pre-order" rate, 20 the normal
        'defaultRate': 10, 
        
        // Is user allowed to pick alternate pricing?
        'canPickRate': false,
        
        'helpers': {
            selected_attr: function(rate) {
                var attr = '';
                
                if ( rate == model.defaultRate ) {
                    attr= 'checked="checked"';
                }
                
                return attr;
            },
            
            disabled_attr: function() {
                var attr = '';
                
                if ( !model.canPickRate ) {
                    attr= 'disabled="disabled"';
                }
                
                return attr;
            }
            
        }
    };
    
    var pricePromise = pricing.fetchCurrentPricing();
    
    // Check if user is able to change price rate
    var hasAuthority = authentification.isLoggedElfOrBetter(request);
    model.canPickRate = hasAuthority;
    
    return pricePromise.then(function(priceModel) {
        model.pricing = priceModel;
        
        return response.render("register_form", model);
    });
}



function getRegistrationReport(request, response)
{
    response.render("register_report", {});
}



function searchRegistration(request, response)
{
    response.render("registration_search", {
        helpers: {
            has_error_not_found: function() {
                return false;
            }
        }
    });
}



function getRegistrationDetails(request, response)
{
    var handleSuccessFn = function(model)
    {
        var displayDate = model.userInfo.registerDate.toLocaleString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minutes: '2-digit', hour12: false
        });

        model.userInfo.registerDateDisplay = displayDate;

        model.categoryItems = createItemListPerCategory(model.items);



        // Add some helpers

        model.helpers = {
            category_name: function(code) {
                var fullName = "--";

                if ( model.categories
                  && model.categories[ code ]
                  && model.categories[ code ].label ) {
                    fullName = model.categories[ code ].label;
                }

                return fullName;
            },
            category_group: function(code) {
                var fullName = "--";

                if ( model.categories
                  && model.categories[ code ]
                  && model.categories[ code ].group ) {
                    fullName = model.categories[ code ].group;
                }

                return fullName;
            }
        };


        var handleGotCategories = function(categories) {
            model.categories = categories;

            return response.render('registration_details', model);
        };

        return categories.get_categories_by_code(handleGotCategories);
    };


    var handleErrorFn = function(err)
    {
        var model = {
            error: 404,
            helpers: {
                has_error_not_found: function() {
                    return true;
                }
            }
        };

        return response.render('registration_search', model);
    };

    var email = request.body.email;
    var accessKey = request.body.accessKey;

    return findUserSubmission(email, accessKey, handleSuccessFn, handleErrorFn);
}



function getAllRegistrations(request, response)
{
    var today = new Date();
    var displayDate = today.toLocaleString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minutes: '2-digit', hour12: false
    });

    var returnedModel = {
        reportDate: today,
        reportDisplayDate: displayDate,
        registration: [],
        summary: {},
        helpers: {}
    };


    var processSummary = function(summary) {
        returnedModel.summary = summary;
        
        return findAllUserSubmission(processRegistrationList, handleErrorFn);
    };


    var processRegistrationList = function(model)
    {
        returnedModel.registration = model;

        return response.render('registration_list', returnedModel);
    };


    var handleErrorFn = function(err)
    {
        var model = {
            error: 500,
            helpers: {
                has_error_backend_issue: function() {
                    return true;
                }
            }
        };

        return response.render('home', model);
    };

    
    return fetchRegistrationSummary(processSummary, handleErrorFn);
}



/** From a JSON object, add a new person and their items in the contest.
 * 
 * @param {type} request
 * @param {type} response
 * 
 * @returns {undefined}
 */
function createRegistration(request, response)
{
    // Allow cross-domain access
    response.set({"Access-Control-Allow-Origin": "*"});

    var isJSON = request.body.dataType === 'application/json';

    if ( ! isJSON ) {
        return response.status(400).json({message: "Requète invalide"});
    }

    var submisionDetails = createDbObjectFromRequest(request.body.data);

    var handleSuccessFn = function(data)
    {
        var model = {
            "submission": data,
            "userEmail": data.ops[0].userInfo.email,
            "accessKey": data.ops[0].userInfo.accessKey,
            "registerDate": data.ops[0].userInfo.registerDate
        };

        model.categoryItems = createItemListPerCategory(data.ops[0].items);

        response.status(200).json(model);
    };

    var handleErrorFn = function(err)
    {
        console.error("Categories - Error: " + err);
        var model = {
            "message": err
        };

        response.status(400).json(model);

        // TODO:
        //response.render('register_error.handlebars', model);

    };

    return registerUserSubmission(submisionDetails, handleSuccessFn, handleErrorFn);
}



// ===== EXPORTED API

module.exports = {
    index: registerForm,
    get_report: getRegistrationReport,
    search: searchRegistration,
    get_details: getRegistrationDetails,
    get_all: getAllRegistrations,
    put: createRegistration
};


