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

/** Modal form used to delete a user.
 * 
 * @param {type} modalId
 * @param {type} successCallback
 * 
 * @returns {FMJUserDelete}
 */
function FMJUserDelete(modalId, successCallback) {
    // Modal DOM objecty
    this.modal = $('#'+modalId);
    
    // To be called when action will succeed (if ever)
    this.successCallback = successCallback;

    // UI element bindings
    
    this.loginVar = $('var.fmj-login', this.modal);
    this.nameVar  = $('var.fmj-name',  this.modal);
    
    this.alert = $('.alert.alert-warning', this.modal);
    this.alert.removeAttr('hidden').hide();
    
    this.deleteActionBtn = $('button[name=delete]', this.modal);
}

/** Display the modal and setup basic liseners.
 * 
 * @param {type} uid
 * @param {type} login
 * @param {type} name
 * 
 * @returns {undefined}
 */
FMJUserDelete.prototype.askDeletion = function(uid, login, name) {
    var me = this;
    
    var modalVisible = function() {
        me.deletionModalReady(uid, login, name);
    };
    
    var modalHidding = function() {
      me.deletionModalDismissed();  
    };

    this.modal.one("show.bs.modal", modalVisible);
    this.modal.one("hidden.bs.modal", modalHidding);

    this.modal.modal('show');
};


/** The modal was hidden.
 * 
 * @returns {undefined}
 */
FMJUserDelete.prototype.deletionModalDismissed = function() {
    this.deleteActionBtn.off('.fmj');
};


/** The modal was shown.
 * 
 * @param {type} uid
 * @param {type} login
 * @param {type} name
 * 
 * @returns {undefined}
 */
FMJUserDelete.prototype.deletionModalReady = function(uid, login, name) {
    var me = this;
    
    // UI Binding and updates
    
    this.loginVar.text(login);
    this.nameVar.text(name);

    this.alert.hide();
    
    // Unblock button if needed and send request
    
    var deleteBtn = this.deleteActionBtn;
    this.deleteActionBtn.prop('disabled', false);
    this.deleteActionBtn.one('click.fmj', function() {
        deleteBtn.prop('disabled', true);
        me.reallyDeleteUser(uid, login);
    });
};

// ===== IMPLEMENTATION OF THE DELETE REQUEST


FMJUserDelete.prototype.reallyDeleteUser = function(uid, login) {
    var url = "/api/admin/delete-user";
    var me = this;

    $.post(url, {
        'dataType': "application/json",
        'data': {_id: uid, login: login}
    })
      .done(function(data) {
          me.userDeleted(data);
      })
      .fail(function(error) {
          me.userDeletionFailed();
      });
};

FMJUserDelete.prototype.userDeleted = function(uid) {
    this.modal.modal('hide');

    // Don't bother doing AJAX stuff, just reload...
    this.successCallback();
};

FMJUserDelete.prototype.userDeletionFailed = function(uid) {
    // Show the error panel
    this.alert.show();
    
    // Enable button again
    this.deleteActionBtn.prop('disabled', false);
};
   