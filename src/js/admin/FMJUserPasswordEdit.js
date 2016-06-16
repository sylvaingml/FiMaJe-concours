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


function FMJUserPasswordEdit() {
    var me = this;

    // UI Binding
    
    this.editor = new FMJUserPasswordEditor({
        password1Input: '#password',
        password2Input: '#passwordConfirmation'
    },
    function(valid) { 
        me.updateSubmitButton(me.checkIsSubmitAllowed());
    } );
    
    this.cancelBtn = $('#passwordEditor button[name=cancel]');
    this.submitBtn = $('#passwordEditor button[type=submit]');
    
    this.alert = $('#passwordEditor .alert.alert-warning');

    // Hide all errors

    this.alert.hide().removeAttr('hidden');

    // Event listeners
    var me = this;

    this.cancelBtn.on('click', function() {
        document.location = '/admin/users';
    });

    this.submitBtn.on('click', function(event) {
        // This is a submit button, but we want our own submission model
        event.preventDefault();
        event.stopPropagation();

        me.onSubmit();
    });
    
    this.checkIsSubmitAllowed(false);
}

// ===== LISTENERS


FMJUserPasswordEdit.prototype.onSubmit = function() {
    var userProfile = {
        _id: this.uid,
        login: this.login,
        
        password: this.passwordEditor.getPassword()
    };

    // Block multiple submit, and give safe state on success.
    this.submitBtn.attr('disabled', 'disabled');

    this.submitUserCreation(userProfile);
};

// ----- User Modification

FMJUserPasswordEdit.prototype.userUpdateSuccess = function(profile) {
    // TODO: hide modal, reload the page
};

FMJUserPasswordEdit.prototype.userUpdateFailed = function() {
    this.alert.show();
    // Enable submit button again
    this.checkIsSubmitAllowed(true);
};

FMJUserPasswordEdit.prototype.submitUserUpdate = function(profile) {
    var url = "/api/admin/change-password-user";
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

FMJUserPasswordEdit.prototype.checkIsSubmitAllowed = function() {
    // Make sure that all verification functions are called before combining
    // the results.
    //
    var passwordOk = this.passwordEditor.checkPasswordValues();

    return passwordOk;
};


// ===== UI ELEMENT STATE CHANGES


FMJUserPasswordEdit.prototype.updateSubmitButton = function(valid) {
    this.submitBtn.attr('disabled', (valid) ? null : 'disabled');
};