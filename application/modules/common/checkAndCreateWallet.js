'use strict';

/**
 * This is a Node.JS module to verify if organization's wallet is available
 * The org wallet is created in case it does not exist
 *
 */

const fileHelper = require('../../helpers/fileHelper.js');
const addToWallet = require('./addToWallet.js');

const path = require('path'); // Support library to build filesystem paths in NodeJs

//Declare ENUMS, all CAPS followed for easy identification
const CRYPTOPATHS = require('../../enums/orgcryptopaths.js'); //List of crypto material relative paths for each org

/**
 * This function checks if wallet for given organization and creates it if not found
 * @param organizationName - Name of the organization to check for wallet
 * @param walletPath - Relative folder path of the organization wallet
 * @param identityLabel - Identity folder expected inside organization wallet
 * @returns
 */
async function main(organizationName, walletPath, identityLabel) {

	//Main try/catch block
	try {    
        const expectedWalletFiles = 3; //Number of files expected in wallet    
        const identityFolderPath = path.resolve(walletPath, identityLabel); // Directory where organization wallet should be available
        
        const crypto_materials = path.resolve(__dirname, '../../../network/crypto-config'); // Directory where all Network artifacts are stored
        //Get the directory path which has crypto materials for given org
		const cryptoDirPath = path.join(crypto_materials,CRYPTOPATHS[organizationName]);

        //Check if the wallet exists with expected number of files and create if it is not
        if(!fileHelper.verifyDirectoryFiles(identityFolderPath,expectedWalletFiles)){
            console.log('.....Either wallet does not exist or does not have expected number of files');
            console.log(`.....Creating wallet now for ${organizationName}`);
            await addToWallet.execute(organizationName, walletPath, identityLabel, cryptoDirPath);
            console.log(`.....Succesfully created wallet for ${organizationName}`);
        }
        //Check if org crypto materials are created after wallet creation, possible in case of network restarts
        //If org crypto materials are generated after wallet, then recreate the wallet for that org
        else if(
            fileHelper.getCreationTime(cryptoDirPath) > 
                fileHelper.getCreationTime(identityFolderPath)
            ){
            console.log(`.....Crypto materials are generated after wallet creation for ${organizationName}`);
            console.log(`.....Recreating wallet now for ${organizationName}`);
            await addToWallet.execute(organizationName, walletPath, identityLabel, cryptoDirPath);
            console.log(`.....Succesfully recreated wallet for ${organizationName}`);
        }
        else{
            console.log(`.....Wallet exists for ${organizationName}`);
        }
	} catch (error) {
		console.log(`Error checking for wallet. ${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}

module.exports.execute = main;