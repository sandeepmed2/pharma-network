'use strict';

/**
 * This is a Node.JS module to add new drugs on pharma network.
 */

const contractHelper = require('../../helpers/contractHelper.js');
const orgHelper = require('../../helpers/orgHelper.js');

//Declare ENUMS, all CAPS followed for easy identification
const SMARTCONTRACTS = require('../../enums/smartcontracts.js'); //List of smart contracts available on pharma network

/**
 * This function submits transaction to add new drug on the network
 * @param organizationName - Name of org which is submitting the transaction
 * @param drugName - Name of the drug
 * @param serialNo - Serial number of the drug
 * @param mfgDate - Manufacturing date of the drug
 * @param expDate - Expiry date of the drug
 * @param companyCRN - Company Registration Number of manufacturer
 * @returns
 */
async function main(organizationName, drugName, serialNo, mfgDate, expDate, companyCRN) {

	try {
		//Validate organization name
		const orgName = orgHelper.validateOrg(organizationName);
		
		const pharmanetContract = await contractHelper.getContractInstance(orgName, SMARTCONTRACTS.Registration);

		console.log('.....Add drug');
		const drugBuffer = await pharmanetContract.submitTransaction('addDrug', drugName, serialNo, mfgDate, expDate, companyCRN);

		// process response
		console.log('.....Processing Add Drug Transaction Response \n\n');
		let newDrug = JSON.parse(drugBuffer.toString());
		console.log(newDrug);
		console.log('\n\n.....Add Drug Transaction Complete!');
		return newDrug;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		contractHelper.disconnect();

	}
}

module.exports.execute = main;
