'use strict'

/***
 * Export an enum with list of relative paths where wallets
 * are available for each organization on pharma network
 * and freeze it to disallow any modifications
 * 
***/
const identityRelPath = '../identity/'; //Relative path of parent identity folder

module.exports = Object.freeze(
    {       
        Manufacturer: identityRelPath + 'manufacturer',
        Distributor: identityRelPath + 'distributor',
        Retailer: identityRelPath + 'retailer',
        Transporter: identityRelPath + 'transporter',
        Consumer: identityRelPath + 'consumer'
    }
);