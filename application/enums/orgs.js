'use strict'

/***
 * Export an enum with list of valid organization names on pharma network
 * and freeze it to disallow any modifications
 * 
***/
module.exports = Object.freeze(
    {       
        Manufacturer: 'Manufacturer',
        Distributor: 'Distributor',
        Retailer: 'Retailer',
        Transporter: 'Transporter',
        Consumer: 'Consumer'
    }
);