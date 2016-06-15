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


function FMJUserEditTools_updateFieldWarning(input, valid) {
    input.toggleClass('form-control-warning', ! valid);
    input.parent().toggleClass('has-warning', ! valid);
};

function FMJUserEditTools_updateFieldSuccess(input, valid) {
    input.toggleClass('form-control-success', valid);
    input.parent().toggleClass('has-success', valid);
};



// ===== EDITOR FOR LOGIN / NAME / EMAIL

function FMJUserLoginEditor(uiElementPath, onValidityUpdate, initialValues) {
    // UI Binding
    
    this.loginFld = $(uiElementPath[ 'loginInput' ]);
    this.nameFld  = $(uiElementPath[ 'nameInput' ]);
    this.emailFld = $(uiElementPath[ 'emailInput' ]);
    
    this.onValidityUpdate = onValidityUpdate;
    
    // Prefill
    
    if ( initialValues && initialValues.login ) {
        this.loginFld.val(initialValues.login);
    }
    if ( initialValues && initialValues.name ) {
        this.nameFld.val(initialValues.name);
    }
    if ( initialValues && initialValues.email ) {
        this.emailFld.val(initialValues.email);
    }
    
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
}

FMJUserLoginEditor.prototype.getLogin = function() {
    return this.loginFld.val();
};

FMJUserLoginEditor.prototype.getName = function() {
    return this.nameFld.val();
};

FMJUserLoginEditor.prototype.getEmail = function() {
    return this.emailFld.val();
};

FMJUserLoginEditor.prototype.clearForm = function() {
    this.loginFld.val('');
    this.emailFld.val('');
    this.nameFld.val('');
    
    FMJUserEditTools_updateFieldWarning(this.loginFld, true);
    FMJUserEditTools_updateFieldWarning(this.emailFld, true);
    FMJUserEditTools_updateFieldWarning(this.nameFld, true);

};

FMJUserLoginEditor.prototype.onLoginUpdate = function() {
    var value = this.loginFld.val().trim().substr(0, 20);
    this.loginFld.val(value);

    this.onValidityUpdate();
};

FMJUserLoginEditor.prototype.onNameUpdate = function() {
    var value = this.nameFld.val().trim().substr(0, 80);
    this.nameFld.val(value);

    this.onValidityUpdate();
};

FMJUserLoginEditor.prototype.onEmailUpdate = function() {
    var value = this.emailFld.val().trim().substr(0, 120);
    this.emailFld.val(value);
};

FMJUserLoginEditor.prototype.checkLoginValue = function() {
    var valid = (null !== this.loginFld.val().match(this.loginRegEx));

    FMJUserEditTools_updateFieldWarning(this.loginFld, valid);

    return valid;
};

FMJUserLoginEditor.prototype.checkNameValue = function() {
    var valid = this.nameFld.val().length > 0;

    FMJUserEditTools_updateFieldWarning(this.nameFld, valid);

    return valid;
};

FMJUserLoginEditor.prototype.checkEmailValue = function() {
    var valid = this.emailFld.val().length > 0;

    FMJUserEditTools_updateFieldWarning(this.emailFld, valid);

    return valid;
};

// ===== EDITOR FOR PASSWORDS

function FMJUserPasswordEditor(uiElementPath, onValidityUpdate) {
    // UI Binding
    
    this.passwordFld = $(uiElementPath[ 'password1Input' ]);
    this.passwordConfirmationFld = $(uiElementPath[ 'password2Input' ]);
    
    this.onValidityUpdate = onValidityUpdate;
    
    // Event listeners
    var me = this;

    this.passwordFld.on('change, blur', function(event) {
        me.onPasswordsUpdate($(event.currentTarget));
    });
    this.passwordConfirmationFld.on('change, blur', function(event) {
        me.onPasswordsUpdate($(event.currentTarget));
    });
}


FMJUserPasswordEditor.prototype.getPassword = function() {
    return this.passwordFld.val();
};
    
    
FMJUserPasswordEditor.prototype.clearForm = function() {
    this.passwordFld.val('');
    this.passwordConfirmationFld.val('');
    
    this.updateFieldWarning(this.passwordFld, true);
    this.updateFieldWarning(this.passwordConfirmationFld, true);

    this.updateFieldSuccess(this.passwordFld, false);
    this.updateFieldSuccess(this.passwordConfirmationFld, false);
};
    
    
FMJUserPasswordEditor.prototype.onPasswordsUpdate = function(inputFld) {
    var value = inputFld.val().substr(0, 200);
    inputFld.val(value);

    this.onValidityUpdate();
};


FMJUserPasswordEditor.prototype.checkPasswordValues = function() {
    var password1 = this.passwordFld.val();
    var password2 = this.passwordConfirmationFld.val();

    var valid = (password1 === password2)
      && (password1.length > 0)
      && (password1.length > 0);

    FMJUserEditTools_updateFieldWarning(this.passwordFld, valid);
    FMJUserEditTools_updateFieldWarning(this.passwordConfirmationFld, valid);

    FMJUserEditTools_updateFieldSuccess(this.passwordFld, valid);
    FMJUserEditTools_updateFieldSuccess(this.passwordConfirmationFld, valid);

    return valid;
};
