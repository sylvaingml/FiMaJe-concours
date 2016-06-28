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


function FMJContest() 
{
    this.uid  = "";
    this.name = "";
    this.active = false;
    
    this.judgeList = [];
    this.categoryList = [];
    
    this.bindUI();
    this.bindEvents();
}


FMJContest.prototype.bindUI = function()
{
    this.uidFld  = $('input[name=uid]');
    this.nameFld = $('input[name=name]');
    
    this.activeChkBox = $('input[name=is_active]');

    this.categoryChkBox = $('input[type=checkbox].fmj-category');
    this.userChkBox     = $('input[type=checkbox].fmj-user');
    
    this.submitBtn  = $('button[name=send_update]');
    this.updateForm = $('form.fmj-form');
};


FMJContest.prototype.bindEvents = function()
{
    var me = this;
    var validityCheck = function() {
        me.updateSubmitStatus();
    };
    
    this.nameFld.on('change, blur', validityCheck);
    this.categoryChkBox.on('change', validityCheck);

    this.userChkBox.on('change', function() {
        var nonEmptyUserSelection = me.isUserListNonEmpty();
        var nonEmptyCategorySelection = me.isCategoryListNonEmpty();
        
        me.updateActiveStatus(nonEmptyUserSelection && nonEmptyCategorySelection);
    });

};


// ----- 

FMJContest.prototype.isNameValid = function()
{
    var name = this.nameFld.val().trim();
    return "" !== name;
};

FMJContest.prototype.isCategoryListNonEmpty = function()
{
    var checkedCategories = this.categoryChkBox.filter(':checked');
    var valid = checkedCategories.length > 0;
    
    return valid;
};

FMJContest.prototype.isUserListNonEmpty = function()
{
    var checkedUsers = this.userChkBox.filter(':checked');
    var valid = checkedUsers.length > 0;
    
    return valid;
};

// -----

FMJContest.prototype.updateActiveStatus = function(canActivate)
{
    this.activeChkBox.prop('disabled', !canActivate);
    
    if ( !canActivate ) {
        this.activeChkBox.prop('checked', false);
    }
};


FMJContest.prototype.updateSubmitStatus = function()
{
    var validName = this.isNameValid();
    var validCategories = this.isCategoryListNonEmpty();
    var validUsers = this.isUserListNonEmpty();
    
    var valid = validName && validCategories;
    
    this.submitBtn.prop('disabled', !valid);
    
    this.updateActiveStatus(validCategories && validUsers);
};

FMJContest.prototype.submitUpdate = function()
{
    if ( !this.submitBtn.prop('disabled') ) {
        this.submitBtn.prop('disabled', true);
        
        this.updateForm[0].submit();
    }
};
