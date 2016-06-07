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


module.exports = {
    /** Render the user's submission form to register to the contest.
     * 
     * @param {type} request
     * @param {type} response
     * 
     * @returns {undefined} 
     */
    index: function(request, response)
    {
        response.render("register_form", {});
    },
    
    
    get_details: function(request, response)
    {
        response.render("register_show", {});
    },

    
    /** From a JSON object, add a new person and their items in the contest.
     * 
     * @param {type} request
     * @param {type} response
     * 
     * @returns {undefined}
     */
    put: function(request, response)
    {
        // Allow cross-domain access
        response.set( {"Access-Control-Allow-Origin": "*"} );
        
        var isJSON = request.body.dataType === 'application/json';
        
        if ( !isJSON ) {
            return response.status(400).json({ message: "Requète invalide" });
            // TODO: 
            //response.render('register_error.handlebars', model);
        }
        
        var submisionDetails = createDbObjectFromRequest(request.body.data);
        
        var handleSuccessFn = function(data)
        {
            var model = {
                "submission": data
            };
            response.status(200).json(model);
            // TODO: render a response page
            //response.render('register_confirmation.handlebars', model);
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
};



function createDbObjectFromRequest(requestData) {
    var dbObject = {
        
        userInfo: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            club: "",
            
            registeredOnline: false,
            registerDate:     new Date()
        },
        
        items: []
    };
    
    // Populate person's details
    
    dbObject.userInfo.firstName = requestData.userInfo.firstName.trim();
    dbObject.userInfo.lastName  = requestData.userInfo.lastName.trim();
    dbObject.userInfo.phone     = requestData.userInfo.phone.trim();
    dbObject.userInfo.email     = requestData.userInfo.email.trim();
    dbObject.userInfo.club      = requestData.userInfo.club.trim();
    
    if ( requestData.userInfo.registeredOnline ) {
       dbObject.userInfo.registeredOnline = true;
    }
    
    // Populate item list
    
    for ( var index = 0 ; index < requestData.items.length ; index += 1 ) {
        var itemInfo = {
            name: requestData.items[index].name.trim(),
            categoryCode: requestData.items[index].categoryCode.trim()
        };
        
        dbObject.items.push(itemInfo);
    }
    
    return dbObject;
}



function registerUserSubmission(submissionDetails, onSuccessFn, onErrorFn)
{
    return MongoClient.connect(settings.get('db_url'), function(err, db)
    {
        if ( err ) {
            console.error('Unable to connect to MongoDB: ' + err);
            onErrorFn(err);
        }
        else {
            var dbTable = db.collection('ContestSubmission');
            
            dbTable.insertMany([ submissionDetails ], function(error, result) {
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
    