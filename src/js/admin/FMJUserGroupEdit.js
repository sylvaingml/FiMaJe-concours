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

    this.loginVar  = $('var.fmj-login', this.modal);
    this.cancelBtn = $('button[name=cancel]', this.modal);
    this.submitBtn = $('button[type=submit]', this.modal);

    this.alert = $('.alert.alert-warning', this.modal);
    this.alert.hide().removeAttr('hidden');

    // Editor
    
    var uiSelectors = {
        groupInput: 'input[name=group_list][type=checkbox]'
    };
    
    var onSubmit = function(valid) {
        me.updateSubmitButton(me.checkIsSubmitAllowed());
    };
    
    this.groupEditor = new FMJUserGroupEditor(uiSelectors, onSubmit);
    
    // Event listeners

    this.submitBtn.on('click.fmj', function(event) {
        // This is a submit button, but we want our own submission model
        event.preventDefault();
        event.stopPropagation();

        me.submitUserGroupUpdateRequest();
    });
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
    // UI Updates and additional bindings
    
    this.alert.hide();
    
    this.loginVar.html(this.user.login);
    
    //this.updateSubmitButton(false);
};


/** When modal is closed, remove listeners and cleanup data.
 * 
 * @returns {undefined}
 */
FMJUserGroupEdit.prototype.groupEditorDismissed = function() {
    this.user = {};
};


// ====== REQUEST SUBMISSION


FMJUserGroupEdit.prototype.submitUserGroupUpdateRequest = function() {
    this.updateSubmitButton(false);
    
    var groupList = this.groupEditor.getGroupList();
    
    var updateRequest = {
        // Identification
        _id:   this.user._id,
        login: this.user.login,
        
        // Updated values
        groups: JSON.stringify(groupList)
    };
    
    var url = "/api/admin/update-user-groups";
    var me = this;
    
    var postRequest = {
        'dataType': "application/json",
        'data': updateRequest
    };
    
    var onSuccess = function(data) {
          me.userInfoUpdated(data);
    };

    $.post(url, postRequest)
      .done(onSuccess)
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