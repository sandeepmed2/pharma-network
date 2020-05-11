'use strict';

/* This contract has all the business logic for Company and Drug registrations on Pharma network */

const {Contract} = require('fabric-contract-api');
const PharmanetHelper = require('../utils/utils.js');

//Declare ENUMS, all CAPS followed for easy identification
const PHARMANETORGS = require('../enums/pharmaorgsenum.js');
const PHARMANETROLES = require('../enums/pharmarolesenum.js');
const PHARMANETASSETS = require('../enums/pharmaassetsenum.js');

class RegistrationContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.pharma-network.pharmanet.registrationcontract');
	}

	/* ****** All custom functions are defined below ***** */

	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Pharmanet Smart Contract Instantiated');
	}

	/**
	 * Register a new company on the network
	 * @param ctx - The transaction context object
	 * @param companyCRN - Company Registration Number
	 * @param companyName - Name of the company
	 * @param location - Location of the company
	 * @param organisationRole - Role of the company
	 * @returns
	 */
	async registerCompany(ctx, companyCRN, companyName, location, organisationRole) {
        //Disallow consumers from registering companies
		if(PharmanetHelper.getRequestorOrg(ctx) === PHARMANETORGS.CONSUMER){
			throw new Error("Sorry, consumers are not allowed to register companies on pharma network!!!");
        }
        
        //Company composite key is a combination of company CRN and name
        //However since CRN is a unique registration number issued to each company
        //check if the CRN is already registered with pharma network
        //To accomplish this use the helper method which checks for asset existence
        //based on partial composite key - companyCRN in this case
        if(await PharmanetHelper.getFirstAssetFromKeyPrefix(ctx, PHARMANETASSETS.Company, companyCRN)){
			throw new Error("Given company CRN is already registered on pharma network!!!");
        }

		//Create a composite key for the new company being registered
        const companyKey = PharmanetHelper.getCompanyKey(ctx, companyCRN, companyName);
        
        //Verify that the provided organization role is valid
        if(!(organisationRole in PHARMANETROLES)){
            throw new Error("Invalid role provided for organization!! Role should be either Manufacturer or Distributor or Retailer or Transporter!!!");
        }

        //Hierarchy key is 1 for Manufacturer, 2 for Distributor, 3 for Retailer
        let hierarchyKey = organisationRole === "Manufacturer" ? PHARMANETROLES.Manufacturer
                        :organisationRole === "Distributor" ? PHARMANETROLES.Distributor
                        :organisationRole === "Retailer" ? PHARMANETROLES.Retailer
                        :PHARMANETROLES.Transporter;
        
        //Create a Company object to be stored on blockchain
        let newCompanyObject = {
            companyID: companyKey,
            name: companyName,
            location: location,
            organisationRole: organisationRole,  
            hierarchyKey: hierarchyKey
        };

		//Store the company being registered on blockchain
		await PharmanetHelper.putAssetData(ctx, companyKey, newCompanyObject);

		//Return value of new company registered
		return newCompanyObject;
    }

	/**
	 * Add a new drug on the network
	 * @param ctx - The transaction context object
	 * @param drugName - Name of the drug
	 * @param serialNo - Serial number of the drug
	 * @param mfgDate - Manufacturing date of the drug
	 * @param expDate - Expiry date of the drug
     * @param companyCRN - Company Registration Number of manufacturer
	 * @returns
	 */
	async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN) {
		//Allow only manufacturers to add drugs on the network
		if(!(PharmanetHelper.getRequestorOrg(ctx) === PHARMANETORGS.MANUFACTURER)){
			throw new Error("Only manufacturing companies are allowed to add drugs on pharma network!!!");
		}

		//Verify that manufacturer exists
        //Company composite key is a combination of company CRN and name
        //However since CRN is a unique registration number issued to each company
        //check if manufacturer is registered with pharma network based on CRN
        let manufacturer = await PharmanetHelper.getFirstAssetFromKeyPrefix(ctx, PHARMANETASSETS.Company, companyCRN);
        if(!manufacturer){
			throw new Error("Manufacturer with given company CRN is not registered on pharma network!!!");
        }

        //manufacturer object assigned above contains "value" object returned by ledger iterator
        //Get the composite key of manufacturing company from this value object
        let manufacturerKey = manufacturer.key;

        //Validate that a manufacturer CRN is provided
        if(!(await PharmanetHelper.getCompanyRole(ctx, manufacturerKey) === PHARMANETROLES.Manufacturer)){
            throw new Error("Given company CRN is not a manufacturer. Provide a valid manufacturer company CRN to add the drug!!!");
        }

        //Create new composite key for the drug to be added
        const drugKey = PharmanetHelper.getDrugKey(ctx, drugName, serialNo);

        //Check if drug already exists
        if(await PharmanetHelper.isAssetExisting(ctx, drugKey)){
            throw new Error("Given drug with serial number is already added on pharma network!!!");
        }
        
        //Check if manufacturing date is valid
        let manufactureDate = PharmanetHelper.getDateFromString(mfgDate);
        if(isNaN(manufactureDate)){
            throw new Error("Invalid manufacturing date. Pass a valid date in yyyy-mm-dd format!!!");
        }

        //Check if expiry date is valid
        let expiryDate = PharmanetHelper.getDateFromString(expDate);
        if(isNaN(expiryDate)){
            throw new Error("Invalid expiry date. Pass a valid date in yyyy-mm-dd format!!!");
        }

        //Verify that expriy date is greater than manufacturing date
        if(!(expiryDate > manufactureDate)){
            throw new Error("Expiry date must be greater than manufacture date!!!");
        }
        
        //Create a Drug object to be stored on blockchain
        let newDrugObject = {
            productID: drugKey,
            name: drugName,
            manufacturer: manufacturerKey,
            manufacturingDate: manufactureDate,
            expiryDate: expiryDate,
            owner: manufacturerKey,
            shipment: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

		//Store the drug on blockchain
		await PharmanetHelper.putAssetData(ctx, drugKey, newDrugObject);

		//Return value of new drug added
		return newDrugObject;
    }

}

module.exports = RegistrationContract;