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

    this.editBtns.on('click', editAction);
};

FMJContestList.prototype.getContestUID = function(button)
{
    var container = button.parents('tr');
    var uid = container.data("uid");

    return uid;
};


// ----- SYNC ACTION

FMJContestList.prototype.submitAction = function(actionURL, uid)
{
    this.actionForm.attr('action', actionURL);
    $('input[name=uid]', this.actionForm).val(uid);

    this.actionForm.submit();
};

// ----- ASYNC ACTIONS

FMJContestList.prototype.actionSuccess = function(uid, response)
{

};

FMJContestList.prototype.actionFailed = function(uid)
{

};


FMJContestList.prototype.doAction = function(actionURL, uid, processSuccess)
{
    var url = actionURL;
    var contest = {
        uid: uid
    };

    var me = this;

    $.post(url, {
        'dataType': "application/json",
        'data': contest
    })
      .done(function(data) {
          me.actionSuccess(uid, data);
          processSuccess();
      })
      .fail(function(error) {
          me.actionFailed();
      });
};
