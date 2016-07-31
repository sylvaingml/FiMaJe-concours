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


function FMJUserGroupEdit(modalId, successCallback) {
    // Modal DOM objecty
    this.modal = $('#'+modalId);
    
    // To be called when action will succeed (if ever)
    this.successCallback = successCallback;
    
    var me = this;

    // UI Binding

    this.loginVar  = $('var.fmj-login');
    this.cancelBtn = $('button[name=cancel]', this.modal);
    this.submitBtn = $('button[type=submit]', this.modal);

    this.alert = $('.alert.alert-warning', this.modal);
    this.alert.hide().removeAttr('hidden');

    // Editor
    
    this.groupEditor = new FMJUserGroupEditor({
        groupInput: 'input[name=group_list][type=checkbox]'
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
FMJUserGroupEdit.prototype.showEditor = function(user) {
    this.user = user;
    
    this.groupEditor.setGroupList(user.groups);

    var me = this;
    
    var modalVisible = function() {
        me.groupEditorReady();
    };
    
    var modalHidding = function() {
        me.groupEditorDismissed();  
    };

    this.modal.one("show.bs.modal", modalVisible);
    this.modal.one("hidden.bs.modal", modalHidding);

    this.modal.modal('show');
};


/** When modal is visible, update the UI content and setup listeners.
 * 
 * @returns {undefined}
 */
FMJUserGroupEdit.prototype.groupEditorReady = function() {
    var me = this;
    
    // UI Updates and additional bindings
    
    this.alert.hide();
    
    this.loginVar.html(this.user.login);
    
    this.updateSubmitButton(false);

    this.submitBtn.on('click', function() {
        me.submitUserUpdateRequest();
    });
};


/** When modal is closed, remove listeners and cleanup data.
 * 
 * @returns {undefined}
 */
FMJUserGroupEdit.prototype.groupEditorDismissed = function() {
    this.submitBtn.off('click');
    
    this.user = {};
};


// ====== REQUEST SUBMISSION


FMJUserGroupEdit.prototype.submitUserUpdateRequest = function() {
    this.updateSubmitButton(false);
    
    var updateRequest = {
        // Identification
        _id:   this.user._id,
        login: this.user.login,
        
        // Updated values
        groups: this.groupEditor.getGroupList()
    };
    
    var url = "/api/admin/update-user-groups";
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


FMJUserGroupEdit.prototype.userInfoUpdated = function(user) {
    this.modal.modal('hide');
    this.successCallback();
};
    
FMJUserGroupEdit.prototype.userInfoUpdateFailed = function() {
    this.updateSubmitButton(false);
    this.alert.show();
};


// ===== VALIDATION


FMJUserGroupEdit.prototype.checkIsSubmitAllowed = function() {
    var valid = true;
    
    // TODO: check the list is non empty

    return valid;
};


// ===== UI ELEMENT STATE CHANGES


FMJUserGroupEdit.prototype.updateSubmitButton = function(valid) {
    this.submitBtn.attr('disabled', (valid) ? null : 'disabled');
};