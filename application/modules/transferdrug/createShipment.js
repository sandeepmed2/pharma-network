'use strict';

/**
 * This is a Node.JS module to create shipments on pharma network.
 */

const contractHelper = require('../../helpers/contractHelper.js');
const orgHelper = require('../../helpers/orgHelper.js');

//Declare ENUMS, all CAPS followed for easy identification
const SMARTCONTRACTS = require('../../enums/smartcontracts.js'); //List of smart contracts available on pharma network

/**
 * This function submits transaction to create shipment on the network
 * @param organizationName - Name of org which is submitting the transaction
 * @param buyerCRN - Company Registration Number of buyer
 * @param drugName - Name of the drug
 * @param listOfAssets - List of serial numbers of drugs being delivered
 * @param transporterCRN - Company Registration Number of transporter delivering the shipment 
 * @returns
 */
async function main(organizationName, buyerCRN, drugName, listOfAssets, transporterCRN) {

	try {
		//Validate organization name
		const orgName = orgHelper.validateOrg(organizationName);
		
		const pharmanetContract = await contractHelper.getContractInstance(orgName, SMARTCONTRACTS.TransferDrug);

		console.log('.....Create Shipment');
		const shipmentBuffer = await pharmanetContract.submitTransaction('createShipment', buyerCRN, drugName, JSON.parse(listOfAssets), transporterCRN);

		// process response
		console.log('.....Processing Create Shipment Transaction Response \n\n');
		let newShipment = JSON.parse(shipmentBuffer.toString());
		console.log(newShipment);
		console.log('\n\n.....Create Shipment Transaction Complete!');
		return newShipment;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		contractHelper.disconnect();

	}
}

module.exports.execute = main;
