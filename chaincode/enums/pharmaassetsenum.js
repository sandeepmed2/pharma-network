'use strict'

//Export an enum with list of asset types on pharma network and freeze it to disallow any modifications
module.exports = Object.freeze(
    {       
        Company: 'Company',
        Drug: 'Drug',
        PurchaseOrder: 'PurchaseOrder',
		Shipment: 'Shipment'
    }
);