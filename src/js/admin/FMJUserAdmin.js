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



FMJUserAdmin.prototype.showInfoEditor = function(userIndex) {
    var user = this.model.users[ userIndex ];
    
    this.userInfoEditModal.showEditor(user);
};


FMJUserAdmin.prototype.showGroupEditor = function(userIndex) {
    var user = this.model.users[ userIndex ];
    
    this.userGroupEditModal.showEditor(user);
};


// ----- UPDATE PASSWORD UPDATE


FMJUserAdmin.prototype.showPasswordEditor = function(userIndex) {
    var user = {
        _id:   this.model.users[ userIndex ].uid, 
        login: this.model.users[ userIndex ].login
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
FMJUserAdmin.prototype.askDeletion = function(userIndex) {
    var user = this.model.users[ userIndex ];
    
    this.deleteConfirmModal.askDeletion(user.uid, user.login, user.fullName);
};
