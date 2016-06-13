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

FMJUserAdmin.prototype.userDeleted = function(uid) {
    this.deleteConfirmModal.modal('hide');
    
    // Don't bother doing AJAX stuff, just reload...
    document.location.href = "/admin/users"
};

FMJUserAdmin.prototype.userDeletionFailed = function(uid) {
    // Show the error panel
    $('.alert.alert-warning', this.deleteConfirmModal).show();
    
    // Enable button again
    var deleteBtn = $('button[name=delete]', this.deleteConfirmModal);
    deleteBtn.prop('disabled', false);
};

FMJUserAdmin.prototype.reallyDeleteUser = function(uid, login) {
    var url = "/api/admin/delete-user";
    var me = this;

    $.post(url, {
        'dataType': "application/json",
        'data': { _id: uid, login: login }
    })
      .done(function(data) {
          me.userDeleted(data);
      })
      .fail(function(error) {
          me.userDeletionFailed();
      });
    };
    
FMJUserAdmin.prototype.deletionModalReady = function(uid, login, name) {
    var me = this;
    
    // UI Binding and updates
    $('var.fmj-login', this.deleteConfirmModal).text(login);
    $('var.fmj-name', this.deleteConfirmModal).text(name);

    // Hide error
    
    $('.alert.alert-warning', this.deleteConfirmModal).removeAttr('hidden').hide();
    
    // Unblock button if needed and send request
    
    var deleteBtn = $('button[name=delete]', this.deleteConfirmModal);
    
    deleteBtn.prop('disabled', false);
    deleteBtn.one('click', function() {
        deleteBtn.prop('disabled', true);
        me.reallyDeleteUser(uid, login);
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
