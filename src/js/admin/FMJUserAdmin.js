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
    
    this.userInfoEditModal   = $('#userInfoEditor');
    this.passwordEditorModal = $('#passwordEditor');
    this.deleteConfirmModal  = $('#deleteConfirm');
    
}


FMJUserAdmin.prototype.showInfoEditor = function(uid) {
    this.userInfoEditModal.modal('show');
    
};

FMJUserAdmin.prototype.showPasswordEditor = function(uid) {
    this.passwordEditorModal.modal('show');
    
};

FMJUserAdmin.prototype.askDeletion = function(uid) {
    this.deleteConfirmModal.modal('show');
    
};

var userAdmin;

// Create the main form
$(function() {
    userAdmin = new FMJUserAdmin();
});

