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


function FMJUserAdmin() {
    // UI Bindings

    this.userInfoEditModal = $('#userInfoEditor');
    this.passwordEditorModal = $('#passwordEditor');
    this.deleteConfirmModal = $('#deleteConfirm');

}


FMJUserAdmin.prototype.showInfoEditor = function(uid) {
    this.userInfoEditModal.modal('show');

};

FMJUserAdmin.prototype.showPasswordEditor = function(uid) {
    this.passwordEditorModal.modal('show');

};

// ----- USER DELETION

FMJUserAdmin.prototype.reallyDeleteUser = function(uid) {
    };
    
FMJUserAdmin.prototype.deletionModalReady = function(uid, login, name) {
    var me = this;
    
    // UI Binding and updates
    $('var.fmj-login', this.deleteConfirmModal).text(login);
    $('var.fmj-name', this.deleteConfirmModal).text(name);

    $('button[name=delete]', this.deleteConfirmModal).one('click', function() {
        me.reallyDeleteUser(uid);
    });
};

FMJUserAdmin.prototype.deletionModalDismissed = function() {
    $('button[name=delete]', this.deleteConfirmModal).off('.fmj');
};


FMJUserAdmin.prototype.askDeletion = function(uid, login, name) {
    var me = this;
    
    var modalVisible = function() {
        me.deletionModalReady(uid, login, name);
    };
    
    var modalHidding = function() {
      me.deletionModalDismissed();  
    };

    this.deleteConfirmModal.one("show.bs.modal", modalVisible);
    this.deleteConfirmModal.one("hidden.bs.modal", modalHidding);

    this.deleteConfirmModal.modal('show');
};
