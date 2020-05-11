'use strict';

/**
 * This is a Node.JS module to update shipments on pharma network.
 */

const contractHelper = require('../../helpers/contractHelper.js');
const orgHelper = require('../../helpers/orgHelper.js');

//Declare ENUMS, all CAPS followed for easy identification
const SMARTCONTRACTS = require('../../enums/smartcontracts.js'); //List of smart contracts available on pharma network

/**
 * This function submits transaction to update shipment on the network
 * @param organizationName - Name of org which is submitting the transaction
 * @param buyerCRN - Company Registration Number of buyer
 * @param drugName - Name of the drug
 * @param transporterCRN - Company Registration Number of transporter delivering the shipment 
 * @returns
 */
async function main(organizationName, buyerCRN, drugName, transporterCRN) {

	try {
		//Validate organization name
		const orgName = orgHelper.validateOrg(organizationName);
		
		const pharmanetContract = await contractHelper.getContractInstance(orgName, SMARTCONTRACTS.TransferDrug);

		console.log('.....Update Shipment');
		const shipmentBuffer = await pharmanetContract.submitTransaction('updateShipment', buyerCRN, drugName, transporterCRN);

		// process response
		console.log('.....Processing Update Shipment Transaction Response \n\n');
		let shipment = JSON.parse(shipmentBuffer.toString());
		console.log(shipment);
		console.log('\n\n.....Update Shipment Transaction Complete!');
		return shipment;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		contractHelper.disconnect();

	}
}

module.exports.execute = main;
