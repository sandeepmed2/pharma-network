'use strict'

/***
 * Export an enum with list of identity labels for each organization on
 * pharma network which will be used to create respective wallets
 * and freeze it to disallow any modifications
 * 
***/
module.exports = Object.freeze(
    {       
        Manufacturer: 'MANUFACTURER_ADMIN',
        Distributor: 'DISTRIBUTOR_ADMIN',
        Retailer: 'RETAILER_ADMIN',
        Transporter: 'TRANSPORTER_ADMIN',
        Consumer: 'CONSUMER_ADMIN'
    }
);