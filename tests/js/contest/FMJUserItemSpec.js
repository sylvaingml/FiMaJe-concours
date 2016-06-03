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

describe( "Basic object to store an artwork description.", function ()
{
  var name     = "Troll";
  var catCode  = "AM";
  var catName  = "Amateur";
  var catGroup = "peinture";
  
  var item = new FMJUserItem(name, catCode, catName, catGroup);
  
  it( "Expecting a valid instance from constructor.", function () {
    expect( item ).toBeDefined();
  } );
  
  it( "Initialized object has core properties initialized.", function () {
    expect( item.name ).toBeDefined();
    expect( item.categoryCode ).toBeDefined();
    expect( item.categoryName ).toBeDefined();
    expect( item.group ).toBeDefined();
  } );

  it( "Initialized object matches input values.", function () {
    expect( item.name ).toEqual(name);
    expect( item.categoryCode ).toEqual(catCode);
    expect( item.categoryName ).toEqual(catName);
    expect( item.group ).toEqual(catGroup);
  } );
} );