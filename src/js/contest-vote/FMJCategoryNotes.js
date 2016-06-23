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


function FMJCategoryNotes(category) {
    this.categoryCode = category;
    
    this.displayNotes = {};
}

FMJCategoryNotes.prototype.toJSON = function() {
    var json = {
        categoryCode: this.categoryCode,
        displayNotes: {}
    };
    
    var displayIdList = Object.keys(this.displayNotes);
    while ( displayIdList.length > 0 ) {
        var displayId = displayIdList.shift()
        json.displayNotes[ displayId ] = this.displayNotes[ displayId ].toJSON();
    }
    
    return json;
};

FMJCategoryNotes.prototype.hasAllNotes = function() {
    var full = true;
    
    var display = Object.keys(this.displayNotes);
    for ( var index = 0 ; full && index < display.length ; ++index ) {
        var displayId = display[index];
        var note = this.displayNotes[ displayId ];
        
        full = full && (null !== note.voteDateTime);
    }
    
    return full;
};
    
    
FMJCategoryNotes.prototype.setDisplayNote = function(display, note) {
    if ( !this.displayNotes[ display ] ) {
        this.displayNotes[ display ] = new FMJDisplayNotes(display);
    }
    
    var noteRecord = this.displayNotes[ display ];
    
    if ( null !== note ) {
       noteRecord.setNote(note);
    }
};

