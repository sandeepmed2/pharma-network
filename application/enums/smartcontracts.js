'use strict'

/***
 * Export an enum with list of smart contracts available
 * on pharmanet chaincode of pharma network
 * and freeze it to disallow any modifications
 * 
***/
module.exports = Object.freeze(
    {
        Registration: 'org.pharma-network.pharmanet.registrationcontract',
        TransferDrug: 'org.pharma-network.pharmanet.transferdrugcontract',
        ViewLifecycle: 'org.pharma-network.pharmanet.viewlifecyclecontract'
    }
);