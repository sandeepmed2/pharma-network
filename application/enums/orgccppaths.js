'use strict'

/***
 * Export an enum with list of relative paths where common connection profiles
 * are available for each organization on pharma network
 * and freeze it to disallow any modifications
 * 
***/
const ccpRelPath = '../ccps/'; //Relative path of parent CCP folder

module.exports = Object.freeze(
    {       
        Manufacturer: ccpRelPath + 'connection-profile-manufacturer.yaml',
        Distributor: ccpRelPath + 'connection-profile-distributor.yaml',
        Retailer: ccpRelPath + 'connection-profile-retailer.yaml',
        Transporter: ccpRelPath + 'connection-profile-transporter.yaml',
        Consumer: ccpRelPath + 'connection-profile-consumer.yaml'
    }
);