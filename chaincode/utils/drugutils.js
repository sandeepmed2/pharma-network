'use strict';

/* This class contains helper functions for transfer drugs logic on Pharma network */

const PharmanetHelper = require('./utils.js');

//Declare ENUMS, all CAPS followed for easy identification
const PHARMANETASSETS = require('../enums/pharmaassetsenum.js');

class DrugHelper {

    /**
	 * Helper function to get company composite key from ledger
	 * @param ctx - The transaction context object
     * @param companyCRN - Company registration number of the company
     * @param companyRole - Role of the company in transaction, example buyer, seller etc..
	 * @returns
	 */
    static async getCompanyKey(ctx, companyCRN, companyRole){
        //Verify that company exists
        //Company composite key is a combination of company CRN and name
        //However since CRN is a unique registration number issued to each company
        //check if company is registered with pharma network based on CRN
        let company = await PharmanetHelper.getFirstAssetFromKeyPrefix(ctx, PHARMANETASSETS.Company, companyCRN);

        //Throw error if company does not exist
        if(!company){
			throw new Error(`${companyRole} with given company CRN is not registered on pharma network!!!`);
        }

        //company object assigned above contains "value" object returned by ledger iterator
        //Get the composite key of company from this value object
        return company.key;
    }
    
    /**
	 * Helper function to verify that drug exists on ledger
	 * @param ctx - The transaction context object
     * @param drugName - Name of the drug
	 * @returns
	 */
    static async verifyDrug(ctx, drugName){
        //Drug composite key is a combinaton of drug name and serial number
        //Check if given drug is added on the network using partial key of drug name
        let drug = await PharmanetHelper.getFirstAssetFromKeyPrefix(ctx, PHARMANETASSETS.Drug, drugName);

        //Throw error if drug does not exist
        if(!drug){
            throw new Error("No drug with given name is available on pharma network!!!");
        }
    }    

    /**
	 * Helper function to validate drug data when creating shipment
	 * @param ctx - The transaction context object
     * @param drugName - Name of the drug
     * @param serialNumber - Serial number of the drug
     * @param sellerKey - Composite key of the seller
	 * @returns
	 */
    static async validateDrug(ctx, drugName, serialNumber, sellerKey){
        //Get drug key to be verified
        const drugKey = PharmanetHelper.getDrugKey(ctx, drugName, serialNumber);

        //Get drug asset from ledger
        let drug = await PharmanetHelper.getAssetData(ctx, drugKey);

        //Throw error if serial number of the drug is not registered on pharma network
        if(!drug){
            throw new Error(`Serial number ${serialNumber} of drug ${drugName} is not available on pharma network!!!`);
        }

        //Validate that seller is the current owner of drug serial number being shippped/ sold
        if(drug.owner !== sellerKey){
            throw new Error(`Serial number ${serialNumber} of drug ${drugName} cannot be shipped/ sold since seller is not currently its owner!!!`);
        }
    }

    /**
	 * Helper function to update the owner and shipment list of drugs
	 * @param ctx - The transaction context object
     * @param drugName - Name of the drug, will be NULL if drugKey is provided
     * @param serialNumber - Serial number of the drug, will be NULL if drugKey is provided
     * @param drugKey - Composite key of drug to be updated, will be NULL if drugName and serialNumber are provided
     * @param newOwnerKey - Composite key of the new drug owner
     * @param shipmentID - ID of the shipment through which drug was delivered, this will be NULL in case of only owner update
	 * @returns
	 */
    static async updateDrug(ctx, drugName, serialNumber, drugKey, newOwnerKey, shipmentID){
        //Get drug key to be updated from drugName and serialNumber if drugKey in input is NULL
        if(drugKey === null){
            drugKey = PharmanetHelper.getDrugKey(ctx, drugName, serialNumber);
        }

        //Get drug asset from ledger
        let drug = await PharmanetHelper.getAssetData(ctx, drugKey);

        //If shipmentID is not null, add it to the shipment list of drug
        //shipmentID will be NULL in case of only owner update
        if(shipmentID !== null){
            drug.shipment.push(shipmentID);
        }

        //Update drug owner and updated timestamp
        drug.owner = newOwnerKey;
        drug.updatedAt = new Date();

        //Store updated drug back on ledger
        await PharmanetHelper.putAssetData(ctx, drugKey, drug);

        //Return updated drug
        return drug;
    }
    
}

module.exports = DrugHelper;