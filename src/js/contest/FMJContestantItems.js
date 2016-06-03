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
 * @returns {FMJContestantItems}
 */
function FMJContestantItems() {
    // UI Outlets
    
    this.registeredItemListGroup = $('#registeredItems');
    
    this.registeredItems = [];
    this.registeredItemsCount = 0;
    
    // Placeholder and template for model view
    this.itemTemplate = this.registeredItemListGroup.find("[data-trigger=template]").detach();
    
    // UI Listeners
    var me = this;
    
    this.registeredItemListGroup.on('click', 'button[value=del]', function(event) {
      var uid = $(this).data('item-uid');
      var row = me.getIndexForItemWithUID(uid);
      
      me.removeItemAtRow(row);
    });
};


FMJContestantItems.prototype.getIndexForItemWithUID = function (uid)
{
  var found = -1;
  
  for ( var index = 0 ; index < this.registeredItems.length ; ++index ) {
    var item = this.registeredItems[ index ];
    if ( item.uid === uid ) {
      found = index;
      break;
    }
  }
  
  return found;
};


/** Add a new item to user's list.
 * 
 * @param {FMJUserItem} newItem
 * 
 * @returns {void}
 */
FMJContestantItems.prototype.addItem = function (newItem)
{
  // Compute a temporary uid to identify objects
  this.registeredItemsCount += 1;
  newItem.uid = this.registeredItemsCount;
  
  // Store new item in model
  this.registeredItems.push( newItem );

  // and create a view for item
  var lastIndex = this.registeredItems.length - 1;

  var $view = this.createItemView( lastIndex, newItem );

  this.registeredItemListGroup.append( $view );
};


FMJContestantItems.prototype.removeItemAtRow = function (row)
{
  // Remove the model
  this.registeredItems.splice(row, 1);
  
  // Remove the view
  this.registeredItemListGroup.children()[ row ].remove();
};


FMJContestantItems.prototype.createItemView = function(itemIndex, item) {
    // Create view from template
    var $view = this.itemTemplate.clone();
    
    // Get subviews to update
    
    var $name     = $view.find('var.fmj-item-name');
    var $category = $view.find('var.fmj-item-category');
    var $group    = $view.find('var.fmj-item-group');
    
    var $delBtn = $view.find('button[value=del]');
    
    // Update values in the view from item model
    
    $name.text(item.name);
    
    $category.text(item.categoryName);
    $category.attr('data-value', item.categoryCode);
    
    $group.text(item.group);
    
    $delBtn.data("item-uid", item.uid);
    
    return $view;
};
    
    


FMJContestantItems.prototype.areRegisteredItemsValid = function() {
    var nonEmptyList = this.registeredItems.length > 0;

    return nonEmptyList;
};


FMJContestantItems.prototype.toJSON = function() {
  return JSON.stringify(this.registeredItems);
};
