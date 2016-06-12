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

    // UI Binding

    this.loginFld = $('#login');
    this.nameFld = $('#fullName');
    this.emailFld = $('#email');
    this.passwordFld = $('#password');
    this.passwordConfirmationFld = $('#passwordConfirmation');

    this.submitBtn = $('button[type=submit]');

    // Validators

    this.loginRegEx = /^[a-zA-Z\-_0-9]+$/g;

    
    // Event listeners
    var me = this;

    this.loginFld.on('change, blur', function() {
        me.onLoginUpdate();
    });
    this.nameFld.on('change, blur', function() {
        me.onNameUpdate();
    });
    this.emailFld.on('change, blur', function() {
        me.onEmailUpdate();
    });

    this.passwordFld.on('change, blur', function() {
        me.onPasswordsUpdate($(event.currentTarget));
    });
    this.passwordConfirmationFld.on('change, blur', function(event) {
        me.onPasswordsUpdate($(event.currentTarget));
    });
}

// ===== LISTENERS

FMJUserCreation.prototype.onLoginUpdate = function() {
    var value = this.loginFld.val().trim().substr(0, 20);
    this.loginFld.val(value);

    this.updateSubmitButton(this.checkIsSubmitAllowed());
};

FMJUserCreation.prototype.onNameUpdate = function() {
    var value = this.nameFld.val().trim().substr(0, 80);
    this.nameFld.val(value);

    this.updateSubmitButton(this.checkIsSubmitAllowed());
};

FMJUserCreation.prototype.onEmailUpdate = function() {
    var value = this.emailFld.val().trim().substr(0, 120);
    this.emailFld.val(value);
};

FMJUserCreation.prototype.onPasswordsUpdate = function(inputFld) {
    var value = inputFld.val().substr(0, 200);
    inputFld.val(value);

    this.updateSubmitButton(this.checkIsSubmitAllowed());
};

// ===== VALIDATION

FMJUserCreation.prototype.checkIsSubmitAllowed = function() {
    return this.checkLoginValue()
      && this.checkNameValue()
      && this.checkPasswordValues();
};


FMJUserCreation.prototype.checkLoginValue = function() {
    var valid = (null !== this.loginFld.val().match(this.loginRegEx));

    this.updateFieldWarning(this.loginFld, valid);

    return valid;
};

FMJUserCreation.prototype.checkNameValue = function() {
    var valid = this.nameFld.val().length > 0;

    this.updateFieldWarning(this.nameFld, valid);

    return valid;
};

FMJUserCreation.prototype.checkEmailValue = function() {
    var valid = this.emailFld.val().length > 0;

    this.updateFieldWarning(this.emailFld, valid);

    return valid;
};

FMJUserCreation.prototype.checkPasswordValues = function() {
    var password1 = this.passwordFld.val();
    var password2 = this.passwordConfirmationFld.val();

    var valid = (password1 === password2) 
      && (password1.length > 0) 
      && (password1.length > 0);

    this.updateFieldWarning(this.passwordFld, valid);
    this.updateFieldWarning(this.passwordConfirmationFld, valid);

    this.updateFieldSuccess(this.passwordFld, valid);
    this.updateFieldSuccess(this.passwordConfirmationFld, valid);

    return valid;
};

// ===== UI ELEMENT STATE CHANGES

FMJUserCreation.prototype.updateFieldWarning = function(input, valid) {
    input.toggleClass('form-control-warning', ! valid);
    input.parent().toggleClass('has-warning', ! valid);
};

FMJUserCreation.prototype.updateFieldSuccess = function(input, valid) {
    input.toggleClass('form-control-success', valid);
    input.parent().toggleClass('has-success', valid);
};


FMJUserCreation.prototype.updateSubmitButton = function(valid) {
    this.submitBtn.attr('disabled', (valid) ? null : 'disabled');
};