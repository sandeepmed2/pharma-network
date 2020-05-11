'use strict';

/* This contract has all the business logic to view lifecycle of drugs on Pharma network */

const {Contract} = require('fabric-contract-api');
const PharmanetHelper = require('../utils/utils.js');

class ViewLifecycleContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.pharma-network.pharmanet.viewlifecyclecontract');
	}

	/* ****** All custom functions are defined below ***** */

    /**
	 * Helper function to normalize ledger timestamp to readable format
	 * @param timestamp - Ledger timestamp from asset history to be normalized
	 * @returns
	 */
	static normalizeTimestamp(timestamp) {
        const milliseconds = (timestamp.seconds.low + 
            (
                (timestamp.nanos / 1000000) / 1000
            )
        ) * 1000;

        return new Date(milliseconds);
    }

	/**
	 * View lifecycle of drug transactions on the network
	 * @param ctx - The transaction context object
	 * @param drugName - Name of the drug
	 * @param serialNo - Serial number of the drug
	 * @returns
	 */
	async viewHistory(ctx, drugName, serialNo) {
        //Get composite key of the drug
        const drugKey = PharmanetHelper.getDrugKey(ctx, drugName, serialNo);

        //Check if drug exists
        if(!await PharmanetHelper.isAssetExisting(ctx, drugKey)){
            throw new Error(`Serial number ${serialNo} of drug ${drugName} is not available on pharma network!!!`);
        }

        //Get drug history iterator from ledger
        let drugHistoryIterator = await PharmanetHelper.getAssetHistory(ctx, drugKey);

        //Initialize an empty array to hold the drug history
        let drugHistory = [];

        //Iterate over the drug history and add each transaction assoicated with the drug
        //along with timestamp and details of the drug for each transaction
        while(true){
            let historyValue = await drugHistoryIterator.next();
            let keyModificationObject = historyValue.value;

            if(keyModificationObject){
                let drugHistoryTransaction = {
                    TransactionId: keyModificationObject.tx_id,
                    //Add timestamp to history object after converting it from ledger format to readable date
                    Timestamp: ViewLifecycleContract.normalizeTimestamp(keyModificationObject.timestamp)
                };

                //If transaction is for key deletion then add a default string as transaction data
                //else convert the data from bytes to string and add it to history object
                if(keyModificationObject.is_delete){
                    drugHistoryTransaction.Data = 'KEY DELETED';
                }
                else{
                    drugHistoryTransaction.Data = keyModificationObject.value.toString('utf8');
                }

                drugHistory.push(drugHistoryTransaction);
            }

            //If iterator has reached its end close the iterator and return drug history array
            if(historyValue.done){
                await drugHistoryIterator.close();
                return drugHistory;
            }
        }
    }

	/**
	 * View current state of drug on the network
	 * @param ctx - The transaction context object
	 * @param drugName - Name of the drug
	 * @param serialNo - Serial number of the drug
	 * @returns
	 */
	async viewDrugCurrentState(ctx, drugName, serialNo) {
        //Get composite key of the drug
        const drugKey = PharmanetHelper.getDrugKey(ctx, drugName, serialNo);

        //Check if drug exists
        if(!await PharmanetHelper.isAssetExisting(ctx, drugKey)){
            throw new Error(`Serial number ${serialNo} of drug ${drugName} is not available on pharma network!!!`);
        }
        
		//Return drug current state from ledger
		return await PharmanetHelper.getAssetData(ctx, drugKey);
    }

}

module.exports = ViewLifecycleContract;