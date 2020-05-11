'use strict';

/**
 * This is a Node.JS application to register new companies on pharma network.
 */

const contractHelper = require('../../helpers/contractHelper.js');
const orgHelper = require('../../helpers/orgHelper.js');

//Declare ENUMS, all CAPS followed for easy identification
const SMARTCONTRACTS = require('../../enums/smartcontracts.js'); //List of smart contracts available on pharma network

/**
 * This function submits transaction to register a new company on the network
 * @param organizationName - Name of org which is submitting the transaction
 * @param companyCRN - Company Registration Number
 * @param companyName - Name of the company
 * @param location - Location of the company
 * @param organisationRole - Role of the company
 * @returns
 */
async function main(organizationName, companyCRN, companyName, location, organisationRole) {

	try {
		//Validate organization name
		const orgName = orgHelper.validateOrg(organizationName);
		
		const pharmanetContract = await contractHelper.getContractInstance(orgName, SMARTCONTRACTS.Registration);

		console.log('.....Register company');
		const companyBuffer = await pharmanetContract.submitTransaction('registerCompany', companyCRN, companyName, location, organisationRole);

		// process response
		console.log('.....Processing Register Company Transaction Response \n\n');
		let newCompany = JSON.parse(companyBuffer.toString());
		console.log(newCompany);
		console.log('\n\n.....Register Company Transaction Complete!');
		return newCompany;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		contractHelper.disconnect();

	}
}

module.exports.execute = main;
