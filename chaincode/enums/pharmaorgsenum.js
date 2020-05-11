'use strict';

//Export an enum with list of valid ORGS on pharma network and freeze it to disallow any modifications
module.exports = Object.freeze(
    {       
        MANUFACTURER: 'manufacturerMSP',
        DISTRIBUTOR: 'distributorMSP',
        RETAILER: 'retailerMSP',
        TRANSPORTER: 'transporterMSP',
        CONSUMER: 'consumerMSP'
    }
);