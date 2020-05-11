'use strict'

//Export an enum with list of valid company roles on pharma network and freeze it to disallow any modifications
module.exports = Object.freeze(
    {       
        Manufacturer: 1,
        Distributor: 2,
        Retailer: 3,
        Transporter: null //No hierarchy key for transporters
    }
);