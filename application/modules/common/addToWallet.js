'use strict';

/**
 * This is a Node.JS module to load a user's Identity to his wallet.
 * This Identity will be used to sign transactions initiated by this user.
 * This will accept the organization name for which identity needs to be created as input
 * Identity is then created by reading the corresponding certificate and private key from crypto-config folder
 * Created identity is stored inside respective organization sub-folder of 'identity' folder
 *
 */
const fileHelper = require('../../helpers/fileHelper.js');

const fs = require('fs'); // FileSystem Library
const { FileSystemWallet, X509WalletMixin } = require('fabric-network'); // Wallet Library provided by Fabric
const path = require('path'); // Support library to build filesystem paths in NodeJs

//Declare ENUMS, all CAPS followed for easy identification
const CRYPTOPATHS = require('../../enums/orgcryptopaths.js'); //List of crypto material relative paths for each org
const ORGMSPIDS = require('../../enums/orgmsps.js'); //List of MSP ID for each org

//Declare constants
const crypto_materials = path.resolve(__dirname, '../../../network/crypto-config'); // Directory where all Network artifacts are stored
const certificateFolder = 'signcerts'; //Folder name inside crypto path which contains Admin certificate
const privatekeyFolder = 'keystore'; //Folder name inside crypto path which contains private key

/**
 * This function creates wallet for given organization at provided path
 * @param organizationName - Name of the organization to create wallet
 * @param walletPath - Relative folder path to create wallet
 * @param identityLabel - Identity folder to create inside organization wallet
 * @param cryptoDirPath - Directory path which has crypto materials for given org
 * @returns
 */
async function main(organizationName, walletPath, identityLabel, cryptoDirPath) {

	// Main try/catch block
	try {

		//A wallet is a filesystem path that stores a collection of Identities
		const wallet = new FileSystemWallet(walletPath);

		//Get certificate file path from signcerts folder using filer helper
		const certFolderPath = path.resolve(cryptoDirPath, certificateFolder);
		const certificatePath = path.resolve(certFolderPath, fileHelper.getSingleFile(certFolderPath));

		//Get private key file path from signcerts folder using filer helper
		const keyFolderPath = path.resolve(cryptoDirPath, privatekeyFolder);
		const privateKeyPath = path.resolve(keyFolderPath, fileHelper.getSingleFile(keyFolderPath));

		// Fetch the credentials from our previously generated Crypto Materials required to create this user's identity
		const certificate = fs.readFileSync(certificatePath).toString();
		const privatekey = fs.readFileSync(privateKeyPath).toString();

		// Load credentials into wallet
		const identity = X509WalletMixin.createIdentity(ORGMSPIDS[organizationName], certificate, privatekey);

		await wallet.import(identityLabel, identity);

	} catch (error) {
		console.log(`Error adding to wallet. ${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}

module.exports.execute = main;