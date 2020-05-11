'use strict';

/**
 * This is a Node.JS module to create purchase orders on pharma network.
 */

const contractHelper = require('../../helpers/contractHelper.js');
const orgHelper = require('../../helpers/orgHelper.js');

//Declare ENUMS, all CAPS followed for easy identification
const SMARTCONTRACTS = require('../../enums/smartcontracts.js'); //List of smart contracts available on pharma network

/**
 * This function submits transaction to create purchase order on the network
 * @param organizationName - Name of org which is submitting the transaction
 * @param buyerCRN - Company Registration Number of buyer
 * @param sellerCRN - Company Registration Number of seller
 * @param drugName - Name of the drug
 * @param quantity - Quantity of the drug requested 
 * @returns
 */
async function main(organizationName, buyerCRN, sellerCRN, drugName, quantity) {

	try {
		//Validate organization name
		const orgName = orgHelper.validateOrg(organizationName);
		
		const pharmanetContract = await contractHelper.getContractInstance(orgName, SMARTCONTRACTS.TransferDrug);

		console.log('.....Create Purchase Order');
		const poBuffer = await pharmanetContract.submitTransaction('createPO', buyerCRN, sellerCRN, drugName, quantity);

		// process response
		console.log('.....Processing Create Purchase Order Transaction Response \n\n');
		let newPO = JSON.parse(poBuffer.toString());
		console.log(newPO);
		console.log('\n\n.....Create Purchase Order Transaction Complete!');
		return newPO;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		contractHelper.disconnect();

	}
}

module.exports.execute = main;
