'use strict';

/* This contract has all the business logic for transferring drugs on Pharma network */

const {Contract} = require('fabric-contract-api');
const PharmanetHelper = require('../utils/utils.js');
const DrugHelper = require('../utils/drugutils.js');

//Declare ENUMS, all CAPS followed for easy identification
const PHARMANETORGS = require('../enums/pharmaorgsenum.js');
const PHARMANETROLES = require('../enums/pharmarolesenum.js');

class TransferDrugContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.pharma-network.pharmanet.transferdrugcontract');
	}

    /* ****** All custom functions are defined below ***** */
    
	/**
	 * Create a new purchase order on the network
	 * @param ctx - The transaction context object
     * @param buyerCRN - Company Registration Number of buyer
     * @param sellerCRN - Company Registration Number of seller
     * @param drugName - Name of the drug
     * @param quantity - Quantity of the drug requested
	 * @returns
	 */
	async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity){
		//Allow only distributors or retailers to create purchase orders
		if(!([PHARMANETORGS.DISTRIBUTOR,PHARMANETORGS.RETAILER].includes(PharmanetHelper.getRequestorOrg(ctx)))){
			throw new Error("Only distributors or retailers are allowed to create purchase orders on pharma network!!!");
		}

		//Get buyer composite key
        let buyerKey = await DrugHelper.getCompanyKey(ctx, buyerCRN, 'Buyer');

        //Validate that a distributor or retailer CRN is provided as buyer
        let buyerRole = await PharmanetHelper.getCompanyRole(ctx, buyerKey);
        if(!([PHARMANETROLES.Distributor,PHARMANETROLES.Retailer].includes(buyerRole))){
            throw new Error("Given buyer CRN is not a distributor or retailer!!!");
        }

        //Get seller composite key
        let sellerKey = await DrugHelper.getCompanyKey(ctx, sellerCRN, 'Seller');

        //Validate that a manufacturer or distributor CRN is provided as seller
        let sellerRole = await PharmanetHelper.getCompanyRole(ctx, sellerKey);
        if(!([PHARMANETROLES.Manufacturer,PHARMANETROLES.Distributor].includes(sellerRole))){
            throw new Error("Given seller CRN is not a manufacturer or distributor!!!");
        }

        //Validate that the purchase is happening in a hierarchical order
        //Distributors can purchase only from manufacturers
        //Retailers can purchase only from distributors
        //Company roles fetched from ledger represent the company hierarchy value
        if(sellerRole + 1 !== buyerRole){
            throw new Error("Invalid purchase order. Distributors can buy only from manufacturers and retailers can purchase only from distributors!!!");
        }

        //Verify drug existence on pharma network
        await DrugHelper.verifyDrug(ctx, drugName);

        //Verify that a valid integer is passed as quantity
        let drugQuantity = parseInt(quantity);
        if(isNaN(drugQuantity)){
            throw new Error("Invalid quantity, it must be an integer value!!!");
        }

        const poKey = PharmanetHelper.getPOKey(ctx, buyerCRN, drugName);
        
        //Create a Purchase Order object to be stored on blockchain
        let newPOObject = {
            poID: poKey,
            drugName: drugName,
            quantity: drugQuantity,
            buyer: buyerKey,
            seller: sellerKey,
            createdAt: new Date(),
            updatedAt: new Date()
        };

		//Store the PO on blockchain
		await PharmanetHelper.putAssetData(ctx, poKey, newPOObject);

		//Return value of new PO added
		return newPOObject;
    }
    
	/**
	 * Create a new shipment on the network
	 * @param ctx - The transaction context object
     * @param buyerCRN - Company Registration Number of buyer
     * @param drugName - Name of the drug
     * @param listOfAssets - List of serial numbers of drugs being delivered
     * @param transporterCRN - Company Registration Number of transporter delivering the shipment
	 * @returns
	 */
	async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN){
        //Only manufacturers or distributors are valid sellers on pharma network
        //Hence allow only manufacturers or distributors to create shipments
		if(!([PHARMANETORGS.MANUFACTURER,PHARMANETORGS.DISTRIBUTOR].includes(PharmanetHelper.getRequestorOrg(ctx)))){
			throw new Error("Only manufacturers or distributors are allowed to create shipments on pharma network!!!");
		}

		//Verify that buyer exists on the network
        await DrugHelper.getCompanyKey(ctx, buyerCRN, 'Buyer');

        //Get transporter composite key
        let transporterKey = await DrugHelper.getCompanyKey(ctx, transporterCRN, 'Transporter');

        //Validate that transporterCRN is actually registered as transporter
        let transporterRole = await PharmanetHelper.getCompanyRole(ctx, transporterKey);
        if(transporterRole !== PHARMANETROLES.Transporter){
            throw new Error("Given transporterCRN is not registered as transporter on pharma network!!!");
        }

        //Verify drug existence on pharma network
        await DrugHelper.verifyDrug(ctx, drugName);

        //Get the purchase order key from buyerCRN and drug name
        const poKey = PharmanetHelper.getPOKey(ctx, buyerCRN, drugName);

        //Get the purchase order from ledger
        let purchaseOrder = await PharmanetHelper.getAssetData(ctx, poKey);

       //Validate that purchase order exists for given buyer and drug
        if(!purchaseOrder){
            throw new Error("No purchase order exists for given buyer and drug!!!");
        }

        //Try to prase list of assets into an array
        try{
            //Parse listOfAssets into an array
            listOfAssets = JSON.parse(listOfAssets);
        } catch(error){
            throw new Error(`Failed to parse listOfAssets due to error - ${error}`);
        }

        //Validate that an array is passed as listOfAssets
        if(!Array.isArray(listOfAssets)){
            throw new Error("Invalid listOfAssets passed as input. It must be an array of drug serial numbers to be shipped!!!");
        }

        //Validate that the length of listOfAssets is exactly equal to quantity specified in PO
        if(listOfAssets.length !== purchaseOrder.quantity){
            throw new Error(`Length of listOfAssets is ${listOfAssets.length} but quantity specified in purchase order is ${purchaseOrder.quantity}!!!`);
        }

        //For each drug being shipped, verify that the serial number is registered on pharma network and that current owner is the seller
        const sellerKey = purchaseOrder.seller;
        for(let drugSerialNumber of listOfAssets){
            await DrugHelper.validateDrug(ctx, drugName, drugSerialNumber, sellerKey);            
        }

        //Update owner of each drug being shipped to transporter and 
        //create a list of shipped drugs to store their keys along with shipment object
        let shippedDrugs = await Promise.all(
            listOfAssets.map(
                drugSerialNumber => 
                    DrugHelper.updateDrug(ctx, drugName, drugSerialNumber, null, transporterKey,null)
            )
        );

        //Create a new key for the shipment object
        const shipmentKey = PharmanetHelper.getShipmentKey(ctx, buyerCRN, drugName);
        
        //Create a Shipment object to be stored on blockchain
        let newShipmentObject = {
            shipmentID: shipmentKey,
            creator: sellerKey,
            assets: shippedDrugs.map(drug => drug.productID), //Only drug keys are stored in assets list
            transporter: transporterKey,
            status: 'in-transit', //Status will be in-transit for new shipments
            createdAt: new Date(),
            updatedAt: new Date()
        };

		//Store the Shipment on blockchain
		await PharmanetHelper.putAssetData(ctx, shipmentKey, newShipmentObject);

		//Return value of new Shipment added
		return newShipmentObject;
    }
    
	/**
	 * Update shipment once it is delivered
	 * @param ctx - The transaction context object
     * @param buyerCRN - Company Registration Number of buyer
     * @param drugName - Name of the drug
     * @param transporterCRN - Company Registration Number of transporter delivering the shipment
	 * @returns
	 */
	async updateShipment(ctx, buyerCRN, drugName, transporterCRN){
        //Allow only transporters to update shipments
		if(PharmanetHelper.getRequestorOrg(ctx) !== PHARMANETORGS.TRANSPORTER){
			throw new Error("Only transporters are allowed to update shipments on pharma network!!!");
		}

		//Get buyer composite key
        let buyerKey = await DrugHelper.getCompanyKey(ctx, buyerCRN, 'Buyer');

        //Get transporter composite key
        let transporterKey = await DrugHelper.getCompanyKey(ctx, transporterCRN, 'Transporter');

        //Verify drug existence on pharma network
        await DrugHelper.verifyDrug(ctx, drugName);

        //Get the shipment key from buyerCRN and drug name
        const shipmentKey = PharmanetHelper.getShipmentKey(ctx, buyerCRN, drugName);

        //Get the shipment from ledger
        let shipment = await PharmanetHelper.getAssetData(ctx, shipmentKey);

        //Validate that shipment exists for given buyer and drug
        if(!shipment){
            throw new Error("No shipment exists for given buyer and drug!!!");
        }

        //Validate that given transporterCRN is the transporter of shipment
        if(shipment.transporter !== transporterKey){
            throw new Error("Given transporterCRN is not the transporter of shipment for given buyer and drug!!!");
        }

        //Validate that the shipment is not already delivered
        if(shipment.status !== 'in-transit'){
            throw new Error("Shipment of given drug is already delivered to buyer!!!");
        }

        //Get list of drugs included in the shipment
        let shippedDrugKeys = shipment.assets;

        //Update owner of each drug in the shipment to buyer
        //Also update shipment list of each drug shipped with shipment composite key
        //Store updated drug assets in an array to return to caller
        let updatedDrugs = await Promise.all(
            shippedDrugKeys.map(
                drugKey => DrugHelper.updateDrug(ctx, null, null, drugKey, buyerKey, shipmentKey)
            )
        );

        //Update shipment status and updated timestamp
        shipment.status = 'delivered';
        shipment.updatedAt = new Date();

		//Store the updated Shipment back on blockchain
        await PharmanetHelper.putAssetData(ctx, shipmentKey, shipment);
        
        //Return data of each asset in the shipment
        return updatedDrugs;
    }

	/**
	 * Sell drug to a customer
	 * @param ctx - The transaction context object
     * @param drugName - Name of the drug being sold
	 * @param serialNo - Serial number of the drug being sold
     * @param retailerCRN - Company Registration Number of retailer
     * @param customerAadhar - Aadhar number of the customer buying drug
	 * @returns
	 */
	async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar){
        //Allow only retailers to sell drugs to customer
		if(PharmanetHelper.getRequestorOrg(ctx) !== PHARMANETORGS.RETAILER){
			throw new Error("Only retailers are allowed to sell drugs to customer on pharma network!!!");
		}

		//Get retailer composite key
        let retailerKey = await DrugHelper.getCompanyKey(ctx, retailerCRN, 'Retailer');

        //Validate that retailerCRN is actually registered as retailer
        let retailerRole = await PharmanetHelper.getCompanyRole(ctx, retailerKey);
        if(retailerRole !== PHARMANETROLES.Retailer){
            throw new Error("Given retailerCRN is not registered as retailer on pharma network!!!");
        }        

        //Validate if drug exists on the network and if retailer is its current owner
        await DrugHelper.validateDrug(ctx, drugName, serialNo, retailerKey);

        //Update owner of the drug to customer's Aadhar number to complete the sale
        let purcahsedDrug = await DrugHelper.updateDrug(ctx, drugName, serialNo, null, customerAadhar, null);

        //Return purchased drug asset
        return purcahsedDrug;
	}        

}

module.exports = TransferDrugContract;