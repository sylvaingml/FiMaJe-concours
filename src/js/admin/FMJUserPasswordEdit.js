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


function FMJUserPasswordEdit(modalId, successCallback) {
    // Modal DOM objecty
    this.modal = $('#'+modalId);
    
    // To be called when action will succeed (if ever)
    this.successCallback = successCallback;

    var me = this;

    // UI Binding
    
    this.editor = new FMJUserPasswordEditor({
        password1Input: '#password',
        password2Input: '#passwordConfirmation'
    },
    function(valid) { 
        me.updateSubmitButton(me.checkIsSubmitAllowed());
    } );
    
    this.loginVar  = $('var.fmj-login');
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

        me.prepareRequest();
    });
    
    this.checkIsSubmitAllowed(false);
}


// ===== MODAL MANAGEMENT


FMJUserPasswordEdit.prototype.showEditor = function(user) {
    this.user = user;
    
    var me = this;
    
    var modalVisible = function() {
        me.editorReady();
    };
    
    var modalHidding = function() {
        me.editorDismissed();  
    };

    this.modal.one("show.bs.modal", modalVisible);
    this.modal.one("hidden.bs.modal", modalHidding);

    this.modal.modal('show');
};


/** When modal is visible, update the UI content and setup listeners.
 * 
 * @returns {undefined}
 */
FMJUserPasswordEdit.prototype.editorReady = function() {
    var me = this;
    
    // UI Updates and additional bindings
    
    this.loginVar.text(this.user.login);
    this.alert.hide();
    
    this.updateSubmitButton(false);
};


/** When modal is closed, remove listeners and cleanup data.
 * 
 * @returns {undefined}
 */
FMJUserPasswordEdit.prototype.editorDismissed = function() {
    this.submitBtn.off('click');
    
    this.user = {};
};


// ===== LISTENERS


FMJUserPasswordEdit.prototype.prepareRequest = function() {
    var userProfile = {
        _id:   this.user._id,
        login: this.user.login,
        
        password: this.editor.getPassword()
    };

    // Block multiple submit, and give safe state on success.
    this.submitBtn.attr('disabled', 'disabled');

    this.submitRequest(userProfile);
};


// ===== REQUEST SUBMISSION


FMJUserPasswordEdit.prototype.userUpdateSuccess = function(profile) {
    this.modal.modal('hide');
    this.successCallback();
};

FMJUserPasswordEdit.prototype.userUpdateFailed = function() {
    this.alert.show();
    // Enable submit button again
    this.checkIsSubmitAllowed(true);
};

FMJUserPasswordEdit.prototype.submitRequest = function(profile) {
    var url = "/api/admin/update-user-password";
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
    var passwordOk = this.editor.checkPasswordValues();

    return passwordOk;
};


// ===== UI ELEMENT STATE CHANGES


FMJUserPasswordEdit.prototype.updateSubmitButton = function(valid) {
    this.submitBtn.attr('disabled', (valid) ? null : 'disabled');
};