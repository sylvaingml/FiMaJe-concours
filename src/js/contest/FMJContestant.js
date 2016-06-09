/* 
 *  FiMaJe, formulaire d'inscription de pièces
 * 
 *  Creative Commons 
 *  Attribution - Pas d’Utilisation Commerciale 3.0 France 
 *  http://creativecommons.org/licenses/by-nc/3.0/fr/
 * 
 *  Auteurs: Sylvain Gamel, club « La Compagnie des Trolls » Antibes, France
 * 
 */

/** Form managing the person's that is registering to the contest.
 * 
 * This object also maintain the list of registered items for the award.
 * 
 * @returns {FMJContestant}
 */
function FMJContestant() {
    // UI Outlets
    
    this.lastNameFld  = $('input[name=userLastName]');
    this.firstNameFld = $('input[name=userFirstName]');
    this.emailFld     = $('input[name=userEmail]');
    this.phoneFld     = $('input[name=userPhone]');
    this.clubFld      = $('input[name=userClub]');
    
    this.changeEmitter = $('body');
    
    // Properties
    
    this.canSubmit = false;
    
    // Track changes
    
    var me = this;
    var onChangeFn = function() {
        var valid = me.areUserInfoValid();
        
        if ( valid !== this.canSubmit ) {
            me.canSubmit = valid;
            me.changeEmitter.trigger("can-submit.fmj.contestant");
        }
    };
    
    this.lastNameFld.on('change', onChangeFn);
    this.firstNameFld.on('change', onChangeFn);
    this.emailFld.on('change', onChangeFn);
    this.phoneFld.on('change', onChangeFn);
    this.clubFld.on('change', onChangeFn);
};



    
FMJContestant.prototype.areUserInfoValid = function() {
    var validName = 
            ("" !== this.lastNameFld.val().trim()) && 
            ("" !== this.firstNameFld.val().trim());
    var validContact = 
            ("" !== this.emailFld.val().trim()) && 
            ("" !== this.phoneFld.val().trim());

    return validName && validContact;
};


FMJContestant.prototype.toJSON = function() {
  var submission = {
    lastName:  this.lastNameFld.val().trim(),
    firstName: this.firstNameFld.val().trim(),
    email:     this.emailFld.val().trim(),
    phone:     this.phoneFld.val().trim(),
    club:      this.clubFld.val().trim(),
    
    // Some additional info
    registeredOnline: true
  };
  
  return submission;
};
