'use strict';

/* This is a helper class to connect to pharma network through gateway and get the respective smart contract */
const checkAndCreateWallet = require('../modules/common/checkAndCreateWallet.js');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const { FileSystemWallet, Gateway } = require('fabric-network');

//Declare ENUMS, all CAPS followed for easy identification
const ORGWALLETPATHS = require('../enums/orgwalletpaths.js'); //List of wallet paths for each org
const ORGIDLABELS = require('../enums/orgidentitylabels.js'); //List of wallet identity labels for each org
const ORGCCPPATHS = require('../enums/orgccppaths.js'); //List of CCP paths for all orgs on pharma network

//Declare constants
const channelName = 'pharmachannel';
const chaincodeName = 'pharmanet';

let gateway;

/**
 * This function returns the smart contract after connecting to fabric network through gateway
 * @param organizationName - Name of the organization connecting to network
 * @param contractType - Name of contract to be fetched from pharma network chaincode
 * @returns
 */
async function getContractInstance(organizationName, contractName) {
	
	// A gateway defines which peer is used to access Fabric network
	// It uses a common connection profile (CCP) to connect to a Fabric Peer
	// CCP is determined based on the organization accessing the node application
	gateway = new Gateway();
	
	// A wallet is where the credentials to be used for this transaction exist
	let walletPath = path.resolve(__dirname,ORGWALLETPATHS[organizationName]);

	// Username of Client user accessing the network
	const fabricUserName = ORGIDLABELS[organizationName];
	
	// Verify if the wallet exists for given org and create in case it does not exist
	await checkAndCreateWallet.execute(organizationName, walletPath, fabricUserName);
	const wallet = new FileSystemWallet(walletPath);

	// Get CCP file path based on org name
	const ccpFilePath = path.resolve(__dirname,ORGCCPPATHS[organizationName]);

	// Load connection profile; will be used to locate a gateway; The CCP is converted from YAML to JSON.
	let connectionProfile = yaml.safeLoad(fs.readFileSync(ccpFilePath, 'utf8'));
	
	// Set connection options; identity and wallet
	let connectionOptions = {
		wallet: wallet,
		identity: fabricUserName,
		discovery: { enabled: false, asLocalhost: true },
		eventHandlerOptions: {
			commitTimeout: 3000 //Increased commit timeout (in seconds) to a large value to prevent request timeout errors on first requests
		}
	};
	
	// Connect to gateway using specified parameters
	console.log('.....Connecting to Fabric Gateway');
	await gateway.connect(connectionProfile, connectionOptions);
	
	// Access pharma channel
	console.log(`.....Connecting to channel - ${channelName}`);
	const channel = await gateway.getNetwork(channelName);
	
	// Get instance of deployed Pharmanet contract
	// @param Name of chaincode
	// @param Name of smart contract
	console.log(`.....Connecting to Smart Contract in ${chaincodeName} chaincode`);
	return channel.getContract(chaincodeName, contractName);
}

function disconnect() {
	if(gateway){
		console.log('.....Disconnecting from Fabric Gateway');
		gateway.disconnect();
	}
}

module.exports.getContractInstance = getContractInstance;
module.exports.disconnect = disconnect;