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


/** Form to add a new item to user's submission.
 * 
 * @param {FMJContestantItems} userSubmission
 * 
 * @returns {FMJContestItemEditor}
 */
function FMJContestItemEditor(userSubmission) {
    // UI Outlets

    this.$itemName = $('input[name=item_name]');
    this.$categorySelect = $('select[name=item_category]');
    this.$addBtn = $('button[name=add_item]');
    
    // Properties
    
    this.userSubmission = userSubmission;
    
    this.categories = {};
    this.sections = [];
    
    this.nameIsValid = false;
    this.categoryIsValid = false;
    
    // Local caching/fast-path
    
    // Map a code to a name
    this.categoryName  = {};
    
    // Map a code to a group name
    this.categoryGroup = {};

    // ----- Initialize
    
    this.requestListOfCategories();
    this.startListeners();
};

FMJContestItemEditor.prototype.startListeners = function() {
    var me = this;
    
    this.updateAddButtonState();
    
    this.$itemName.on('change', function(event) {
        me.nameIsValid = "" !== me.$itemName.val().trim();
        me.updateAddButtonState();
    });

    this.$categorySelect.on('change', function(event) {
        me.categoryIsValid = "" !== me.$categorySelect.val();
        me.updateAddButtonState();
    });
    
    this.$addBtn.on('click', function() {
        // TODO: add to the main model
        var categoryCode = me.$categorySelect.val();
        
        var newItem = new FMJContestItem(
                me.$itemName.val().trim(),
                categoryCode,
                me.categoryName[ categoryCode ],
                me.categoryGroup[ categoryCode ]
                );
        
        me.userSubmission.addItem(newItem);
    });
};
    
FMJContestItemEditor.prototype.updateAddButtonState = function() {
    var value = ( this.nameIsValid && this.categoryIsValid ) ? null : "disabled";
    this.$addBtn.attr('disabled', value);
};
    
    
FMJContestItemEditor.prototype.requestListOfCategories = function() {
    var url = "/api/categories-and-groups"; 
    var me  = this;

    $.ajax(url, {
        dataType: "json"
    })
    .done(function(data) {
        me.updateCategoryList(data);
    })
    .fail(function(error) {
        console.error( "error: " + error );
    })
    .always(function() {
        console.log( "complete" );
    });
};

FMJContestItemEditor.prototype.updateCategoryList = function(data) {
    this.categories = data['categories'];
    this.sections   = data['groups'];

    this.buildCategoryOptionList(this.$categorySelect);
};

FMJContestItemEditor.prototype.buildCategoryOptionList = function($select) {
    for ( var idx = 0 ; idx < this.sections.length ; ++idx ) {
        var section    = this.sections[ idx ];
        var categories = this.categories[ section ];
        
        var $section = this.buildCategorySection(section, categories);

        $select.append($section);
    }
};

FMJContestItemEditor.prototype.buildCategorySection = function(section, categories) {
    var $group = $('<optgroup>', { 'label': section });
    
    for ( var idx = 0 ; idx < categories.length ; ++idx ) {
        var category = categories[ idx ];
        var $option = this.buildCategoryOption(category.code, category.label, section);

        $group.append($option);
    }

    return $group;
};

FMJContestItemEditor.prototype.buildCategoryOption = function(value, label, category) {
    var $option = $('<option>', { 'value': value });
    $option.text(label);
    
    // Build local fast-path caching
    
    this.categoryGroup[ value ] = category;
    this.categoryName[ value ]  = label;

    return $option;
};
