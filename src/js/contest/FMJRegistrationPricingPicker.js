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

/** Simple option picker to get a price rate for registration.
 * 
 * @returns {FMJRegistrationPricingPicker}
 */
function FMJRegistrationPricingPicker(model) {
    // Model
    
    this.priceByCode = {};
    
    while ( model.pricing.length > 0 ) {
        var current = model.pricing.shift();
        this.priceByCode[ current.rateCode ] = current;
    }
    
    // UI Outlets
    
    this.rateOptionFld = $('input[name=price_rate]');
    
    // Properties
    
    this.canSubmit = false;
    
    // Track changes
    
    var me = this;
    var onChangeFn = function() {
        var code = me.getSelectedRateCode();
        
        if ( null !== code ) {
            me.canSubmit = true;
        }
    };
    
    this.rateOptionFld.on('change', onChangeFn);
};


/** Returns the code of the selected price rate.
 * 
 * @returns {FMJRegistrationPricingPicker.rateOptionFld@call;filter.value}
 */
FMJRegistrationPricingPicker.prototype.getSelectedRateCode = function() {
    var code = null;
    
    var options = this.rateOptionFld.filter(":checked");
    if ( options && options.length > 0 ) {
        code = options[0].value;
    }
    
    return code;
};


FMJRegistrationPricingPicker.prototype.toJSON = function() {
    var selectedRate = this.getSelectedRateCode();
    var pricing = this.priceByCode[ selectedRate ];
    var amount = (pricing) ? pricing.amount : undefined;

    var json = {
        rateCode: selectedRate,
        amount: amount
    };

    return json;
};
