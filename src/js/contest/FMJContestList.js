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


function FMJContestList()
{
    this.bindUI();
    this.bindEvents();
}


FMJContestList.prototype.bindUI = function()
{
    this.editBtns = $('button[name=edit]');
    this.resultsBtns = $('button[name=results]');
    this.activateBtns = $('button[name=activate]');
    this.deactivateBtns = $('button[name=deactivate]');

    this.actionForm = $('form[name=action-form]');
};


FMJContestList.prototype.bindEvents = function(event)
{
    var me = this;

    var editAction = function(event) {
        var uid = me.getContestUID($(this));

        if ( uid ) {
            me.submitAction("/admin/contest-edit", uid);
        }
    };


    var activateAction = function(event) {
        var uid = me.getContestUID($(this));

        if ( uid ) {
            var action = me.createActivateRequest(uid, true);
            
            var refresh = function(response) {
                if ( 'undefined' !== typeof response.updated.active ) {
                    me.updateActiveStatus(uid, response.updated.active);
                }
            };

            me.doAction(action, refresh); // TODO: refresh content
        }
    };

    var deactivateAction = function(event) {
        var uid = me.getContestUID($(this));

        if ( uid ) {
            var action = me.createActivateRequest(uid, false);
            
            var refresh = function(response) {
                if ( 'undefined' !== typeof response.updated.active ) {
                    me.updateActiveStatus(uid, response.updated.active);
                }
            };

            me.doAction(action, refresh); // TODO: refresh content
        }
    };

    this.editBtns.on('click', editAction);
    this.activateBtns.on('click', activateAction);
    this.deactivateBtns.on('click', deactivateAction);
};

FMJContestList.prototype.getContestUID = function(button)
{
    var container = button.parents('tr');
    var uid = container.data("uid");

    return uid;
};

FMJContestList.prototype.updateActiveStatus = function(uid, activeStr)
{
    var active = ( 'true' === activeStr ) ? true : false;
    
    var container = $('.fmj-contest-info[data-uid='+uid+'] .fmj-contest-state');
    
    container.toggleClass('active-on',   active);
    container.toggleClass('active-off', !active);

    return uid;
};


// ----- SYNC ACTION

FMJContestList.prototype.submitAction = function(actionURL, uid)
{
    this.actionForm.attr('action', actionURL);
    $('input[name=uid]', this.actionForm).val(uid);

    this.actionForm.submit();
};


// ----- ASYNC REQUEST SETUP


FMJContestList.prototype.createActivateRequest = function(uid, activate) {
    var action = {
        url: "/admin/contest-activation",
        request: {
            uid: uid,
            active: activate
        }
    };

    return action;
};

// ----- ASYNC ACTIONS

FMJContestList.prototype.actionSuccess = function(request, response)
{

};

FMJContestList.prototype.actionFailed = function(error)
{

};


FMJContestList.prototype.doAction = function(action, processSuccess)
{
    var url     = action.url;
    var request = action.request;

    var me = this;

    $.post(url, {
        'dataType': "application/json",
        'data': request
    })
      .done(function(data) {
          me.actionSuccess(request, data);
          if ( processSuccess ) { 
              processSuccess(data); 
          }
      })
      .fail(function(error) {
          me.actionFailed();
      });
};
