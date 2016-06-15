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

FMJUserAdmin.prototype.refreshContent = function() {
    // Don't bother doing AJAX stuff, just reload...
    document.location.href = "/admin/users"
};


// ----- USER UPDATE

FMJUserAdmin.prototype.userInfoUpdated = function(user) {
    this.userInfoEditModal.modal('hide');
    this.refreshContent();
};
    
FMJUserAdmin.prototype.userInfoUpdateFailed = function(user) {
    var submitBtn = $('button[type=submit]', this.userInfoEditModal);
      
    submitBtn.prop('disabled', true);

    // Show the error panel
    $('.alert.alert-warning', this.userInfoEditModal).show();
};
    
FMJUserAdmin.prototype.submitUserUpdateRequest = function(user) {
    var updateRequest = {
        // Identification
        _id:   user._id,
        login: user.login,
        
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

FMJUserAdmin.prototype.infoEditorReady = function(user) {
    var me = this;
    
    // UI Updates and additional bindings
    
    $('var.fmj-login', this.userInfoEditModal).text(user.login);
    
    // Hide the error panel
    $('.alert.alert-warning', this.userInfoEditModal).removeAttr('hidden').hide();
    
    var submitBtn = $('button[type=submit]', this.userInfoEditModal);
      
    submitBtn.prop('disabled', true);
    submitBtn.on('click.fmj-admin', function(event) {
        me.submitUserUpdateRequest(user);
    });
};

FMJUserAdmin.prototype.infoEditorDismissed = function() {
    // Unlink existing listeners
    
    $('button[type=submit]', this.userInfoEditModal).off('click');
};

FMJUserAdmin.prototype.updateUpdateInfoButton = function(valid) {
    var submitBtn = $('button[type=submit]', this.userInfoEditModal);

    submitBtn.prop('disabled', !valid);
};

FMJUserAdmin.prototype.checkCanSubmitUserUpdates = function() {
    var nameOk  = this.infoEditor.checkNameValue();

    return nameOk;
};

FMJUserAdmin.prototype.showInfoEditor = function(uid, login, name, email) {
    var user = {
        _id:   uid, 
        login: unescape(login),
        
        fullName: unescape(name), 
        email:    unescape(email)
    };
    
    this.infoEditor = new FMJUserLoginEditor({
        loginInput: '#login',
        nameInput: '#fullName',
        emailInput: '#email'
    },
    function(valid) {
        me.updateUpdateInfoButton(me.checkCanSubmitUserUpdates());
    }, {
        name:  user.fullName,
        email: user.email
    });

    var me = this;
    
    var modalVisible = function() {
        me.infoEditorReady(user);
    };
    
    var modalHidding = function() {
        me.infoEditorDismissed();  
    };

    this.userInfoEditModal.one("show.bs.modal", modalVisible);
    this.userInfoEditModal.one("hidden.bs.modal", modalHidding);

    this.userInfoEditModal.modal('show');

};

// ----- UPDATE PASSWORD UPDATE

FMJUserAdmin.prototype.showPasswordEditor = function(uid) {
    this.passwordEditorModal.modal('show');

};

// ----- USER DELETION

FMJUserAdmin.prototype.userDeleted = function(uid) {
    this.deleteConfirmModal.modal('hide');
    
    // Don't bother doing AJAX stuff, just reload...
    this.refreshContent();
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
