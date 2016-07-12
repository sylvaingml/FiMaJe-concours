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


function FMJUserWelcome() {
    this.bindUI();
    this.initUI();
    this.bindEvents();
}


FMJUserWelcome.prototype.bindUI = function() {
    var me = this;
    
    this.loginInput  = $('input[name=login]');
    this.editor = new FMJUserPasswordEditor({
        password1Input: '#password',
        password2Input: '#passwordConfirmation'
    },
    function(valid) { 
        me.updateSubmitButton(me.checkIsSubmitAllowed());
    });
    
    this.submitBtn = $('button[type=submit]');
    
    this.alert = $('.alert.alert-warning');
};
    
FMJUserWelcome.prototype.initUI = function() {
    // Hide all errors
    this.alert.hide().removeAttr('hidden');
    
    //this.checkIsSubmitAllowed(false);
    this.updateSubmitButton(false);
};    

FMJUserWelcome.prototype.bindEvents = function() {
    // Event listeners
    var me = this;

    this.submitBtn.on('click', function(event) {
        // This is a submit button, but we want our own submission model
        event.preventDefault();
        event.stopPropagation();

        me.prepareRequest();
    });
};


// ===== LISTENERS


FMJUserWelcome.prototype.prepareRequest = function() {
    var userProfile = {
        login:    this.loginInput.val(),
        password: this.editor.getPassword()
    };

    // Block multiple submit, and give safe state on success.
    this.submitBtn.attr('disabled', 'disabled');

    this.submitRequest(userProfile);
};


// ===== REQUEST SUBMISSION


FMJUserWelcome.prototype.userUpdateSuccess = function(profile) {
    document.location = '/';
};

FMJUserWelcome.prototype.userUpdateFailed = function() {
    this.alert.show();
    
    // Enable submit button again
    this.checkIsSubmitAllowed(true);
};

FMJUserWelcome.prototype.submitRequest = function(profile) {
    var url = "/api/admin/set-user-password";
    var me = this;

    $.post(url, {
        'dataType': "application/json",
        'data': profile
    })
      .done(function(data) {
          me.userUpdateSuccess(data);
      })
      .fail(function(error) {
          me.userUpdateFailed();
      });
};

// ===== VALIDATION

FMJUserWelcome.prototype.checkIsSubmitAllowed = function() {
    // Make sure that all verification functions are called before combining
    // the results.
    //
    var passwordOk = this.editor.checkPasswordValues();

    return passwordOk;
};


// ===== UI ELEMENT STATE CHANGES


FMJUserWelcome.prototype.updateSubmitButton = function(valid) {
    this.submitBtn.attr('disabled', (valid) ? null : 'disabled');
};