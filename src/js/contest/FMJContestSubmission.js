/* 
 *  FiMaJe, formulaire d'inscription de pièces
 * 
 *  Creative Commons 
 *  Attribution - Pas d’Utilisation Commerciale 3.0 France 
 *  http://creativecommons.org/licenses/by-nc/3.0/fr/
 * 
 *  Auteurs: Sylvain Gamel, club « La Compagnie des Trolls » Antibes, France
 * 
 */

/** Top level form object managing user's subscription.
 * 
 * @returns {FMJContestSubmission}
 */
function FMJContestSubmission()
{
  // UI Outlets

  this.conditionsAcceptedChkBox = $( 'input[name=ackConditions]' );
  this.validateBtn = $( 'button[name=register]' );

  // Related forms

  this.userInfo = new FMJContestant();
  this.userSubmission = new FMJContestantItems();
  this.newItemForm = new FMJContestItemEditor( this.userSubmission );
  
  // Inner listeners
  
  var me = this;
  
  this.conditionsAcceptedChkBox.on('change', function() {
    var allowed = me.isSubmissionAllowed();
    
    me.validateBtn.prop("disabled", ! allowed );
  });
  
  this.validateBtn.on('click', function() {
    me.validateBtn.prop("disabled", true ); // Ensure we do not double submit
    
    console.log("SUBMIT!");
    me.sendUserSubmission();
  });
}
;

FMJContestSubmission.prototype.isSubmissionAllowed = function ()
{
  var allowed = this.conditionsAcceptedChkBox.prop( 'checked' );
  var validUserInfo = this.userInfo.areUserInfoValid();
  var validUserItemList = this.userSubmission.areRegisteredItemsValid();
  
  return allowed && validUserInfo && validUserItemList;
};


FMJContestSubmission.prototype.sendUserSubmission = function() {
    var url = "/api/register";
    var me  = this;

    var jsonRequest = this.toJSON();

    $.post(url, {
      'dataType': "application/json",
      'data':     jsonRequest
    })
    .done(function(data) {
        console.log( "Done: " + data );
    })
    .fail(function(error) {
        console.log( "error: " + error );
    })
    .always(function() {
        console.log( "complete" );
    });
};



FMJContestSubmission.prototype.toJSON = function() {
    var json = {
        "userInfo": this.userInfo.toJSON(),
        "items":    this.userSubmission.toJSON()
    };
    
    return json;
};


var FMJForm;

// Create the main form
$(function() {
    FMJForm = new FMJContestSubmission();
});

