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

function FMJDisplayNotes(displayId) {
    this.displayId = displayId;
    
    this.voteDateTime = null;
    this.note = null;
}

FMJDisplayNotes.prototype.toJSON = function() {
    var json = {
        displayId: this.displayId
    };
    
    if ( this.voteDateTime ) { 
        json.voteDateTime = this.voteDateTime;
    }
    
    if ( this.note ) { 
        json.note = this.note;
    }
    
    return json;
};


FMJDisplayNotes.prototype.hasNote = function() {
    return (null !== this.voteDateTime);
};


FMJDisplayNotes.prototype.setNote = function(note) {
    this.voteDateTime = new Date();
    this.note = note;
};

