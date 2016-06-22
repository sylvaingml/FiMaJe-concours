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


FMJDisplayNotes.prototype.hasNote = function() {
    return (null !== this.voteDateTime);
};


FMJDisplayNotes.prototype.setNote = function(note) {
    this.voteDateTime = new Date();
    this.note = note;
};


// =====


function FMJCategoryNotes(category) {
    this.categoryCode = category;
    
    this.displayNotes = {};
}


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


// =====


function FMJContestVoteSheet() {
    this.bindUI();

    this.buildInitialModel();
    this.bindEvents();
}



FMJContestVoteSheet.prototype.bindUI = function() {
    // Find all note select input

    this.noteSelects = $('select.fmj-note');
};



FMJContestVoteSheet.prototype.bindEvents = function() {
    var me = this;
    
    this.noteSelects.on('change', function(event) {
        me.didSelectNote(event);
    });
};



FMJContestVoteSheet.prototype.buildInitialModel = function() {
    // The model to be stored in DB
    this.categoryVotes = {
    };

    var me = this;

    this.noteSelects.each(function() {
        var current = $(this);

        var categoryCode = current.data('category');
        var displayId = current.data('display');

        if ( ! me.categoryVotes[ categoryCode ] ) {
            // Create votes for category if none
            me.categoryVotes[ categoryCode ] = new FMJCategoryNotes(categoryCode);
        }
        
        me.categoryVotes[ categoryCode ].setDisplayNote(displayId, null);
    });
};



FMJContestVoteSheet.prototype.setNoteForDisplay = function(category, displayId, note) {
    this.categoryVotes[ category ].setDisplayNote(displayId, note);
};


FMJContestVoteSheet.prototype.findVoteStatus = function(category) {
    var status = $(".vote-status[data-category="+category+"]");
    return status;
};
    
    
FMJContestVoteSheet.prototype.didSelectNote = function(event) {
    var current = $(event.target);

    var categoryCode = current.data('category');
    var displayId = current.data('display');
    var note = current.val();

    this.setNoteForDisplay(categoryCode, displayId, note);
    
    
    var allNotesSet = this.categoryVotes[ categoryCode ].hasAllNotes();
    var status = this.findVoteStatus(categoryCode);
    
    status.toggleClass('vote-complete', allNotesSet);
};



// =====


var FMJVoteSheet;

// Create the main form
$(function() {
    FMJVoteSheet = new FMJContestVoteSheet();
});

