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


function FMJUserAdmin(model) {
    // Setup up initial data model
    
    this.model = model;
    
    // Global listener for editor closed
    
    var me = this;
    var genericSuccessCallback = function() {
        me.refreshContent();
    };
    
    // UI Bindings

    this.userInfoEditModal   = new FMJUserInfoEdit('userInfoEditor', genericSuccessCallback);
    this.userGroupEditModal  = new FMJUserGroupEdit('userGroupEditor', genericSuccessCallback);
    this.passwordEditorModal = new FMJUserPasswordEdit('passwordEditor', genericSuccessCallback);
    this.deleteConfirmModal  = new FMJUserDelete('deleteConfirm', genericSuccessCallback);
}

FMJUserAdmin.prototype.refreshContent = function() {
    // Don't bother doing AJAX stuff, just reload...
    document.location.href = "/admin/users";
};


// ----- USER UPDATE



FMJUserAdmin.prototype.showInfoEditor = function(uid, login, name, email) {
    var user = {
        _id:   uid, 
        login: unescape(login),
        
        fullName: unescape(name), 
        email:    unescape(email)
    };
    
    this.userInfoEditModal.showEditor(user);
};

FMJUserAdmin.prototype.showGroupEditor = function(userIndex) {
    
    var user = this.model.users[ userIndex ];
    /*
    var user = {
        _id:   uid, 
        login: unescape(login),
        
        fullName: unescape(name), 
        email:    unescape(email)
    };
    */
    this.userGroupEditModal.showEditor(user);
};

// ----- UPDATE PASSWORD UPDATE

FMJUserAdmin.prototype.showPasswordEditor = function(uid, login) {
    var user = {
        _id:   uid, 
        login: unescape(login)
    };
    
    this.passwordEditorModal.showEditor(user);
};

/** Public API to call to delete a user.
 * 
 * @param {type} uid
 * @param {type} login
 * @param {type} name
 * 
 * @returns {undefined}
 */
FMJUserAdmin.prototype.askDeletion = function(uid, login, name) {
    this.deleteConfirmModal.askDeletion(uid, login, name);
};
