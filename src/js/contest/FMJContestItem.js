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


/** Registered item
 * 
 * @param {type} name
 * @param {type} categoryCode
 * @param {type} categoryName
 * @param {type} categoryGroup
 * 
 * @returns {FMJUserItem}
 */
function FMJUserItem(name, categoryCode, categoryName, categoryGroup) {
    this.name = name;
    this.categoryCode = categoryCode;
    this.categoryName = categoryName;
    this.group        = categoryGroup;
    
    this.uid = 0;
};

