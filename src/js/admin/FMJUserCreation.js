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


function FMJUserCreation() {
    var me = this;

    // UI Binding
    
    this.infoEditor = new FMJUserLoginEditor({
        loginInput: '#login',
        nameInput:  '#fullName',
        emailInput: '#email'
    },
    function(valid) { 
        me.updateSubmitButton(me.checkIsSubmitAllowed());
    } );
    
    this.passwordEditor = new FMJUserPasswordEditor({
        password1Input: '#password',
        password2Input: '#passwordConfirmation'
    },
    function(valid) { 
        me.updateSubmitButton(me.checkIsSubmitAllowed());
    } );

    this.cancelBtn = $('button[name=cancel]');
    this.resetBtn  = $('button[name=reset]');
    this.submitBtn = $('button[type=submit]');

    // Hide all errors

    $('.alert.alert-success').hide().removeAttr('hidden');
    $('.alert.alert-warning').hide().removeAttr('hidden');

    // Event listeners
    var me = this;

    this.cancelBtn.on('click', function() {
        document.location = '/admin/users';
    });

    this.resetBtn.on('click', function() {
        me.onReset();
    });

    this.submitBtn.on('click', function(event) {
        // This is a submit button, but we want our own submission model
        event.preventDefault();
        event.stopPropagation();

        me.onSubmit();
    });
}

// ===== LISTENERS


FMJUserCreation.prototype.onSubmit = function() {
    var userProfile = {
        login:    this.infoEditor.getLogin(),
        fullName: this.infoEditor.getName(),
        email:    this.infoEditor.getEmail(),
        
        password: this.passwordEditor.getPassword()
    };

    // Block multiple submit, and give safe state on success.
    this.submitBtn.attr('disabled', 'disabled');

    this.submitUserCreation(userProfile);
};

FMJUserCreation.prototype.onReset = function() {
    this.clearForm();
};

// ----- Clear the form

FMJUserCreation.prototype.clearForm = function() {
    this.infoEditor.clearForm();
    this.passwordEditor.clearForm();
};

// ----- User Creation

FMJUserCreation.prototype.userCreationSuccess = function(profile) {
    $('.alert.alert-success').show();
    $('.alert.alert-warning').hide();

    this.clearForm();
};

FMJUserCreation.prototype.userCreationFailed = function() {
    $('.alert.alert-success').hide();
    $('.alert.alert-warning').show();
};

FMJUserCreation.prototype.submitUserCreation = function(profile) {
    var url = "/api/admin/add-user";
    var me = this;

    $.post(url, {
        'dataType': "application/json",
        'data': profile
    })
      .done(function(data) {
          me.userCreationSuccess(data);
      })
      .fail(function(error) {
          me.userCreationFailed();
      });
};

// ===== VALIDATION

FMJUserCreation.prototype.checkIsSubmitAllowed = function() {
    // Make sure that all verification functions are called before combining
    // the results.
    //
    var loginOk = this.infoEditor.checkLoginValue();
    var nameOk = this.infoEditor.checkNameValue();
    var passwordOk = this.passwordEditor.checkPasswordValues();

    return loginOk && nameOk && passwordOk;
};


// ===== UI ELEMENT STATE CHANGES


FMJUserCreation.prototype.updateSubmitButton = function(valid) {
    this.submitBtn.attr('disabled', (valid) ? null : 'disabled');
};