'use strict';

/**
 * This is a Node.JS module to view current state of drugs on pharma network.
 */

const contractHelper = require('../../helpers/contractHelper.js');
const orgHelper = require('../../helpers/orgHelper.js');

//Declare ENUMS, all CAPS followed for easy identification
const SMARTCONTRACTS = require('../../enums/smartcontracts.js'); //List of smart contracts available on pharma network

/**
 * This function submits transaction to view current state of drug on the network
 * @param organizationName - Name of org which is submitting the transaction
 * @param drugName - Name of the drug
 * @param serialNo - Serial number of the drug 
 * @returns
 */
async function main(organizationName, drugName, serialNo) {

	try {
		//Validate organization name
		const orgName = orgHelper.validateOrg(organizationName);
		
		const pharmanetContract = await contractHelper.getContractInstance(orgName, SMARTCONTRACTS.ViewLifecycle);

		console.log('.....View Drug');
		const drugBuffer = await pharmanetContract.submitTransaction('viewDrugCurrentState', drugName, serialNo);

		// process response
		console.log('.....Processing View Drug Transaction Response \n\n');
		let drug = JSON.parse(drugBuffer.toString());
		console.log(drug);
		console.log('\n\n.....View Drug Transaction Complete!');
		return drug;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		contractHelper.disconnect();

	}
}

module.exports.execute = main;
