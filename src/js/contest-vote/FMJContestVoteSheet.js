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


function FMJContestVoteSheet(contest, user) {
    this.bindUI();

    this.buildInitialModel(contest, user);
    this.bindEvents();
}



FMJContestVoteSheet.prototype.bindUI = function() {
    // Find all note select input
    this.noteSelects = $('select.fmj-note');

    // Manually submit vote to server
    this.submitBtn = $('#submitVote');

    // Hide alerts
    $('.alert.alert-success').hide().removeAttr('hidden');
    $('.alert.alert-warning').hide().removeAttr('hidden');

};



FMJContestVoteSheet.prototype.bindEvents = function() {
    var me = this;
    
    this.noteSelects.on('change', function(event) {
        me.didSelectNote(event);
    });
    
    this.submitBtn.on('click', function() {
        me.submitAllVotes();
    });
};



FMJContestVoteSheet.prototype.buildInitialModel = function(contest, user) {
    // The model to be stored in DB
    this.categoryVotes = {};
    this.contest = contest;
    this.judge   = user;

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



FMJContestVoteSheet.prototype.submitAllVotes = function() {
    this.submitBtn.prop('disabled', true);
    
    var url = "/api/contest/post-ballot";
    var me = this;

    var voteRecord = this.buildBallot();

    console.log("MODEL", voteRecord);
    
    $.post(url, {
        'dataType': "application/json",
        'data': voteRecord
    })
      .done(function(data) {
          me.ballotSaved(data);
      })
      .fail(function(error) {
          me.ballotFailed();
      })
      .always(function() {
          me.ballotProcessed();
      });
};


FMJContestVoteSheet.prototype.buildBallot = function() {
    var notes = {};
    
    var categoryList = Object.keys(this.categoryVotes);
    while ( categoryList.length > 0 ) {
        var categoryCode = categoryList.shift();
        notes[ categoryCode ] = this.categoryVotes[ categoryCode ].toJSON();
    }

    var voteRecord = {
        contest: this.contest,
        judge:   this.judge,
        notes:   notes
    };
    
    return voteRecord;
};


FMJContestVoteSheet.prototype.ballotSaved = function(response) {
    $('.alert.alert-success').show();
    $('.alert.alert-warning').hide();
};

FMJContestVoteSheet.prototype.ballotFailed = function() {
    $('.alert.alert-success').hide();
    $('.alert.alert-warning').show();
};

FMJContestVoteSheet.prototype.ballotProcessed = function() {
    this.submitBtn.prop('disabled', false);
};

