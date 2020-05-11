'use strict'

/* This is a helper class which verifies that a valid organization name is used while submitting transactions */

//Declare ENUMS, all CAPS followed for easy identification
const ORGS = require('../enums/orgs.js'); //List of valid organizations on pharma network

/**
 * This function verifies that input string is a valid organization name on pharma netowrk
 * Throws error if org name is invalid
 * @param organizationName - Organization name to be verified
 * @returns
 */
function validateOrg(organizationName){
    //Validate organization name
    if(!(organizationName in ORGS)){
        throw new Error(`${organizationName} is an invalid organization name to submit transactions on pharma network!!!`);
    }

    //Return organization name string from ENUM if it is valid
    return ORGS[organizationName];
}

module.exports.validateOrg = validateOrg;