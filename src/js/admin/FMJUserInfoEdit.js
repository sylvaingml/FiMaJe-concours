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


function FMJUserInfoEdit(modalId, successCallback) {
    // Modal DOM objecty
    this.modal = $('#'+modalId);
    
    // To be called when action will succeed (if ever)
    this.successCallback = successCallback;
    
    var me = this;

    // UI Binding

    this.loginVar  = $('var.fmj-login');
    this.cancelBtn = $('#userInfoEditor button[name=cancel]');
    this.submitBtn = $('#userInfoEditor button[type=submit]');

    this.alert = $('#userInfoEditor .alert.alert-warning');
    this.alert.hide().removeAttr('hidden');

    // Editor
    
    this.infoEditor = new FMJUserLoginEditor({
        loginInput: '#login',
        nameInput: '#fullName',
        emailInput: '#email'
    },
    function(valid) {
        me.updateSubmitButton(me.checkIsSubmitAllowed());
    });
    
    // Event listeners

    this.submitBtn.on('click.fmj', function(event) {
        // This is a submit button, but we want our own submission model
        event.preventDefault();
        event.stopPropagation();

        me.submitUserUpdateRequest();
    });
    
    this.updateSubmitButton(false);
}



// ===== MODAL DISPLAY


/** Show the editor modal.
 * 
 * @param {type} user
 * 
 * @returns {undefined}
 */
FMJUserInfoEdit.prototype.showEditor = function(user) {
    this.user = user;
    
    this.infoEditor.setName(user.fullName);
    this.infoEditor.setEmail(user.email);

    var me = this;
    
    var modalVisible = function() {
        me.infoEditorReady();
    };
    
    var modalHidding = function() {
        me.infoEditorDismissed();  
    };

    this.modal.one("show.bs.modal", modalVisible);
    this.modal.one("hidden.bs.modal", modalHidding);

    this.modal.modal('show');
};


/** When modal is visible, update the UI content and setup listeners.
 * 
 * @returns {undefined}
 */
FMJUserInfoEdit.prototype.infoEditorReady = function() {
    var me = this;
    
    // UI Updates and additional bindings
    
    this.loginVar.text(this.user.login);
    this.alert.hide();
    
    this.updateSubmitButton(false);

    this.submitBtn.on('click', function() {
        me.submitUserUpdateRequest();
    });
};


/** When modal is closed, remove listeners and cleanup data.
 * 
 * @returns {undefined}
 */
FMJUserInfoEdit.prototype.infoEditorDismissed = function() {
    this.submitBtn.off('click');
    
    this.user = {};
};


// ====== REQUEST SUBMISSION


FMJUserInfoEdit.prototype.submitUserUpdateRequest = function() {
    this.updateSubmitButton(false);
    
    var updateRequest = {
        // Identification
        _id:   this.user._id,
        login: this.user.login,
        
        // Updated values
        fullName: this.infoEditor.getName(),
        email:    this.infoEditor.getEmail()
    };
    
    var url = "/api/admin/update-user";
    var me = this;

    $.post(url, {
        'dataType': "application/json",
        'data': updateRequest
    })
      .done(function(data) {
          me.userInfoUpdated(data);
      })
      .fail(function(error) {
          me.userInfoUpdateFailed();
      });
};


FMJUserInfoEdit.prototype.userInfoUpdated = function(user) {
    this.modal.modal('hide');
    this.successCallback();
};
    
FMJUserInfoEdit.prototype.userInfoUpdateFailed = function() {
    this.updateSubmitButton(false);
    this.alert.show();
};


// ===== VALIDATION


FMJUserInfoEdit.prototype.checkIsSubmitAllowed = function() {
    // Make sure that all verification functions are called before combining
    // the results.
    //
    var nameOk = this.infoEditor.checkNameValue();
    var mailOk = this.infoEditor.checkEmailValue();

    return nameOk && mailOk;
};


// ===== UI ELEMENT STATE CHANGES


FMJUserInfoEdit.prototype.updateSubmitButton = function(valid) {
    this.submitBtn.attr('disabled', (valid) ? null : 'disabled');
};