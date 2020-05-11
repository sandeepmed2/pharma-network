'use strict'

/***
 * Export an enum with list of membership provider ID
 * for each organization on pharma network
 * and freeze it to disallow any modifications
 * 
***/
module.exports = Object.freeze(
    {       
        Manufacturer: 'manufacturerMSP',
        Distributor: 'distributorMSP',
        Retailer: 'retailerMSP',
        Transporter: 'transporterMSP',
        Consumer: 'consumerMSP'
    }
);