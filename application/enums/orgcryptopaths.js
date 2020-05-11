'use strict'

/***
 * Export an enum with list of crypto materials relative path
 * of Admin user for each organization on pharma network 
 * and freeze it to disallow any modifications
 * 
***/
module.exports = Object.freeze(
    {       
        Manufacturer: '/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp/',
        Distributor: '/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp/',
        Retailer: '/peerOrganizations/retailer.pharma-network.com/users/Admin@retailer.pharma-network.com/msp/',
        Transporter: '/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/',
        Consumer: '/peerOrganizations/consumer.pharma-network.com/users/Admin@consumer.pharma-network.com/msp/'
    }
);