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
    lastName:  JSON.stringify( this.lastNameFld.val() ),
    firstName: JSON.stringify( this.firstNameFld.val() ),
    email:     JSON.stringify( this.emailFld.val() ),
    phone:     JSON.stringify( this.phoneFld.val() ),
    club:      JSON.stringify( this.clubFld.val() )
  };
  
  return JSON.stringify(submission);
};
