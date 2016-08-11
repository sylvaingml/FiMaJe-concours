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
 * @param {Object} model Data model from server as JSON.
 * 
 * @returns {FMJContestSubmission}
 */
function FMJContestSubmission(model)
{
    // Model Binding

    this.model = {
        pricing: model[ 'pricing' ]
    };

    // UI Outlets

    this.conditionsAcceptedChkBox = $('input[name=ackConditions]');
    this.validateBtn = $('button[name=register]');

    this.successInfo = $('#success-info');
    // We are using classes as we have both displayed values and hidden inputs
    this.registeredEmailVar = $('#registeredEmail');
    this.accessKeyVar = $('#accessKey');
    this.registeredEmailHidden = $('.registeredEmail');
    this.accessKeyHidden = $('.accessKey');

    // Related forms

    this.userInfo = new FMJContestant();
    this.userSubmission = new FMJContestantItems();
    this.newItemForm = new FMJContestItemEditor(this.userSubmission);
    this.priceRate = new FMJRegistrationPricingPicker(this.model.pricing);

    // Properties

    this.eventSource = $('body');

    // Inner listeners

    var me = this;

    this.conditionsAcceptedChkBox.on('change', function() {
        var allowed = me.isSubmissionAllowed();
        me.validateBtn.prop("disabled", ! allowed);
    });

    this.validateBtn.on('click', function() {
        me.validateBtn.prop("disabled", true); // Ensure we do not double submit
        me.sendUserSubmission();
    });

    this.eventSource.on("can-submit.fmj.contestant", function() {
        var allowed = me.isSubmissionAllowed();
        me.validateBtn.prop("disabled", ! allowed);
    });
}
;

FMJContestSubmission.prototype.isSubmissionAllowed = function()
{
    var allowed = this.conditionsAcceptedChkBox.prop('checked');
    var validUserInfo = this.userInfo.areUserInfoValid();
    var validUserItemList = this.userSubmission.areRegisteredItemsValid();

    return allowed && validUserInfo && validUserItemList;
};


FMJContestSubmission.prototype.sendUserSubmission = function() {
    var url = "/api/register";
    var me = this;

    var jsonRequest = this.toJSON();

    $.post(url, {
        'dataType': "application/json",
        'data': jsonRequest
    })
      .done(function(data) {
          console.log("Done: " + data);
          me.handleSubmissionSucceed(data);
      })
      .fail(function(error) {
          console.log("error: " + error);
      })
      .always(function() {
          console.log("complete");
      });
};



FMJContestSubmission.prototype.handleSubmissionSucceed = function(response) {
    // Hide non-relevant information
    $('.fmj-hide-on-success').hide();

    // Update information and show them
    this.registeredEmailVar.html(response[ 'userEmail' ]);
    this.accessKeyVar.html(response[ 'accessKey' ]);

    this.registeredEmailHidden.val(response[ 'userEmail' ]);
    this.accessKeyHidden.val(response[ 'accessKey' ]);

    this.successInfo.removeAttr('hidden');
};


FMJContestSubmission.prototype.toJSON = function() {
    var json = {
        "userInfo": this.userInfo.toJSON(),
        "items": this.userSubmission.toJSON(),
        "price": this.priceRate.toJSON()
    };

    return json;
};



