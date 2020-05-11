'use strict';

//Get list of company roles in pharma network
const PHARMANETROLES = require('../enums/pharmarolesenum.js');

//Namespaces used for pharma assets
const pharmaPrefix = 'org.pharma-network.pharmanet.'; //Common preifx for all namespaces
const pharmaNamespaces = 
	{
		Company: pharmaPrefix + 'company',
		Drug: pharmaPrefix + 'drug',
		PurchaseOrder: pharmaPrefix + 'purchaseorder',
		Shipment: pharmaPrefix + 'shipment'
	}
Object.freeze(pharmaNamespaces);

//This class contains all helper utility functions like fetching data from ledger, verifying data existence...
class PharmanetHelper {

	/**
	 * Helper function to get organization of  requestor
	 * @param ctx - The transaction context object
	 * @returns
	 */
	static getRequestorOrg(ctx) {
		//Return requestor MSP value
		return ctx.clientIdentity.getMSPID();
	}

  	/**
	 * Helper function to get asset data buffer from ledger
	 * @param ctx - The transaction context object
	 * @param assetKey - Composite key of asset to be fetched
	 * @returns
	 */
	static async getAssetBuffer(ctx, assetKey) {
		//Fetch asset details with given key
		return ctx.stub
				.getState(assetKey)
				.catch(err => console.log(err));
	}

	/**
	 * Helper function to put asset data on ledger
	 * @param ctx - The transaction context object
	 * @param assetKey - Composite key of asset to be created or updated
	 * @param assetData - Asset data to put on ledger
	 * @returns
	 */
	static async putAssetData(ctx, assetKey, assetData) {
		//Convert input JSON object to buffer and store it to blockchain
		let dataBuffer = Buffer.from(JSON.stringify(assetData));
		await ctx.stub.putState(assetKey, dataBuffer);
	}

  	/**
	 * Helper function to get asset iterator from ledger based on given partial composite key prefix
	 * @param ctx - The transaction context object
	 * @param assetNamespace - Namespace of the asset to be fetched
	 * @param partialAssetKey - Partial composite key prefix of asset to be fetched
	 * @returns
	 */
	static async getAssetIterator(ctx, assetNamespace, partialAssetKey) {
		//Return asset iterator for given partial key
		return ctx.stub
				.getStateByPartialCompositeKey(assetNamespace,[partialAssetKey])
				.catch(err => console.log(err));
	}

  	/**
	 * Helper function to get history of an asset from ledger
	 * @param ctx - The transaction context object
	 * @param assetKey - Composite key of asset whose history is to be fetched
	 * @returns
	 */
	static async getAssetHistory(ctx, assetKey) {
		//Return iterator of asset history for the key provided
		return await ctx.stub.getHistoryForKey(assetKey);
	}	

  	/**
	 * Helper function to verify if given asset exists
	 * @param ctx - The transaction context object
	 * @param assetKey - Composite key of asset to be verified
	 * @returns
	 */
	static async isAssetExisting(ctx, assetKey) {
		//Return true if asset is existing
		let assetBuffer = await PharmanetHelper.getAssetBuffer(ctx, assetKey);
		return assetBuffer.length !== 0;
	}

  	/**
	 * Helper function to get first asset from the list of assets starting with a partial key
	 * @param ctx - The transaction context object
	 * @param assetType - Type of asset to be fetched
	 * @param assetKeyPrefix - Partial composite key prefix of asset to be fetched
	 * @returns
	 */
	static async getFirstAssetFromKeyPrefix(ctx, assetType, assetKeyPrefix) {
		//Get iterator of assets based on asset type partial composite key provided
		let assetIterator = await PharmanetHelper.getAssetIterator(ctx,pharmaNamespaces[assetType],assetKeyPrefix);
		let asset = await assetIterator.next();

		//If there are no assets for given key then iterator will have no results
		//Thus accessing next() result from iterator will give only done status
		//If next() returns value then at least one asset is existing with given partial key prefix
		let assetValue = asset.value;
		
		//Close the iterator if matching assets are existing, if not then iterator is already closed by this point
		if(assetValue){
			await assetIterator.close();
		}

		return assetValue;
	}

  	/**
	 * Helper function to get asset data from ledger
	 * @param ctx - The transaction context object
	 * @param assetKey - Composite key of asset to be fetched
	 * @returns
	 */
	static async getAssetData(ctx, assetKey) {
		let assetData = await PharmanetHelper.getAssetBuffer(ctx, assetKey);

		//Return asset JSON object if asset is existing
		if(assetData.length !== 0){
			return JSON.parse(assetData.toString());
		}
	}

  	/**
	 * Helper function to get role for given company key
	 * @param ctx - The transaction context object
	 * @param companyKey - Composite key of the company to fech role
	 * @returns
	 */
	static async getCompanyRole(ctx, companyKey) {
		let companyBuffer = await PharmanetHelper.getAssetBuffer(ctx, companyKey);
		let companyJSON = JSON.parse(companyBuffer.toString());
		return PHARMANETROLES[companyJSON.organisationRole];
	}		

  	/**
	 * Helper function to construct Company composite key
	 * @param ctx - The transaction context object
	 * @param companyCRN - Company Registration Number
	 * @param companyName - Name of the company
	 * @returns
	 */
	static getCompanyKey(ctx, companyCRN, companyName) {
		return ctx.stub.createCompositeKey(pharmaNamespaces.Company, [companyCRN,companyName]);
	}

  	/**
	 * Helper function to construct Drug composite key
	 * @param ctx - The transaction context object
	 * @param drugName - Name of the drug
	 * @param serialNo - Serial number of the drug
	 * @returns
	 */
	static getDrugKey(ctx, drugName, serialNo) {
		return ctx.stub.createCompositeKey(pharmaNamespaces.Drug, [drugName,serialNo]);
	}

  	/**
	 * Helper function to construct Purchase Order composite key
	 * @param ctx - The transaction context object
     * @param buyerCRN - Company Registration Number of buyer
     * @param drugName - Name of the drug
	 * @returns
	 */
	static getPOKey(ctx, buyerCRN, drugName) {
		return ctx.stub.createCompositeKey(pharmaNamespaces.PurchaseOrder, [buyerCRN,drugName]);
	}

  	/**
	 * Helper function to construct Shipment composite key
	 * @param ctx - The transaction context object
     * @param buyerCRN - Company Registration Number of buyer
     * @param drugName - Name of the drug
	 * @returns
	 */
	static getShipmentKey(ctx, buyerCRN, drugName) {
		return ctx.stub.createCompositeKey(pharmaNamespaces.Shipment, [buyerCRN,drugName]);
	}

  	/**
	 * Helper function to convert date to string
	 * @param dateString - String representation of date
	 * @returns
	 */
	static getDateFromString(dateString) {
		return new Date(dateString);
	}
	
}

module.exports = PharmanetHelper;