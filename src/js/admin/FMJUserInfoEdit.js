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


function FMJUserInfoEdit() {
    var me = this;

    // UI Binding
    
    this.infoEditor = new FMJUserLoginEditor({
        nameInput:  '#fullName',
        emailInput: '#email'
    },
    function(valid) { 
        me.updateSubmitButton(me.checkIsSubmitAllowed());
    } );
    
    this.cancelBtn = $('button[name=cancel]');
    this.submitBtn = $('#userInfoEditor button[type=submit]');

    // Hide all errors

    $('.alert.alert-warning').hide().removeAttr('hidden');

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


FMJUserInfoEdit.prototype.onSubmit = function() {
    var userProfile = {
        _id: this.uid,
        login: this.login,
        name: this.infoEditor.getName(),
        email: this.infoEditor.getEmail(),
        
        password: this.passwordEditor.getPassword()
    };

    // Block multiple submit, and give safe state on success.
    this.submitBtn.attr('disabled', 'disabled');

    this.submitUserCreation(userProfile);
};

// ----- User Modification

FMJUserInfoEdit.prototype.userUpdateSuccess = function(profile) {
    // TODO: hide modal, reload the page
};

FMJUserInfoEdit.prototype.userUpdateFailed = function() {
    $('.alert.alert-warning').show();
    // Enable submit button again
    this.checkIsSubmitAllowed(true);
};

FMJUserInfoEdit.prototype.submitUserUpdate = function(profile) {
    var url = "/api/admin/update-user";
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

FMJUserInfoEdit.prototype.checkIsSubmitAllowed = function() {
    // Make sure that all verification functions are called before combining
    // the results.
    //
    var nameOk = this.infoEditor.checkNameValue();
    var passwordOk = this.passwordEditor.checkPasswordValues();

    return nameOk && passwordOk;
};


// ===== UI ELEMENT STATE CHANGES


FMJUserInfoEdit.prototype.updateSubmitButton = function(valid) {
    this.submitBtn.attr('disabled', (valid) ? null : 'disabled');
};