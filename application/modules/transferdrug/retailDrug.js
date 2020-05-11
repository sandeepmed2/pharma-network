'use strict';

/**
 * This is a Node.JS module to retail drugs on pharma network.
 */

const contractHelper = require('../../helpers/contractHelper.js');
const orgHelper = require('../../helpers/orgHelper.js');

//Declare ENUMS, all CAPS followed for easy identification
const SMARTCONTRACTS = require('../../enums/smartcontracts.js'); //List of smart contracts available on pharma network

/**
 * This function submits transaction to retail drug on the network
 * @param organizationName - Name of org which is submitting the transaction
 * @param drugName - Name of the drug being sold
 * @param serialNo - Serial number of the drug being sold
 * @param retailerCRN - Company Registration Number of retailer
 * @param customerAadhar - Aadhar number of the customer buying drug 
 * @returns
 */
async function main(organizationName, drugName, serialNo, retailerCRN, customerAadhar) {

	try {
		//Validate organization name
		const orgName = orgHelper.validateOrg(organizationName);
		
		const pharmanetContract = await contractHelper.getContractInstance(orgName, SMARTCONTRACTS.TransferDrug);

		console.log('.....Retail Drug');
		const drugBuffer = await pharmanetContract.submitTransaction('retailDrug', drugName, serialNo, retailerCRN, customerAadhar);

		// process response
		console.log('.....Processing Retail Drug Transaction Response \n\n');
		let drug = JSON.parse(drugBuffer.toString());
		console.log(drug);
		console.log('\n\n.....Retail Drug Transaction Complete!');
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
