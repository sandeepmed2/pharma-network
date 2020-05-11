'use strict';

/* This is a helper class for filesystem operations */
const fs = require('fs'); // FileSystem Library

/**
 * This function returns the absolute path of only file available in input directory path
 * Throws error in case more than one file is present in the directory
 * @param dirPath - Absolute path of directory to retrieve file
 * @returns
 */
function getSingleFile(dirPath){
    //Main try/catch block
    try{
        //Get the list of files from provided directory path
        let files = fs.readdirSync(dirPath);

        //Throw error if more than on file is existing in given path
        if(files.length !== 1){
            throw new Error(`Expected 1 file but detected ${files.length} files in "${dirPath}"`);
        }

        //Return the single file available in directory
        return files[0];
    }
    catch(error){
        console.log(`Could not get files from directory due to error - "${error}"`);
        throw new Error(error);
    }
}

/**
 * This function verifies if given directory exists and 
 * compares the number of files inside that directory with exepcted number passed as input
 * @param dirPath - Absolute path of directory to check existence
 * @param expectedFiles - Number of files expected in the directory
 * @returns
 */
function verifyDirectoryFiles(dirPath, expectedFiles){
    //Main try/catch block
    try{
        //Return false if directory does not exist
        if(!fs.existsSync(dirPath)){
            console.log(`"${dirPath}" does not exist!!!`);
            return false;
        }

        //Get the list of files from provided directory path
        let files = fs.readdirSync(dirPath);

        //Return false if number of files does not match expected count
        if(files.length !== expectedFiles){
            console.log(`Expected ${expectedFiles} but found ${files.length} files in "${dirPath}"`);
            return false;
        }

        //Return true if all validations have passed
        return true;
    }
    catch(error){
        console.log(`Could not verify directory files due to error - "${error}"`);
        throw new Error(error);
    }
}

/**
 * This function returns the creation time of directory or file passed as input
 * @param absPath - Absolute path of directory or file to retrieve creation time
 * @returns
 */
function getCreationTime(absPath){
    //Main try/catch block
    try{
        //Get the list stats metadata object
        let stats = fs.statSync(absPath);

        console.log(`Creation time of "${absPath}" is ${stats.birthtime}`);

        //Return the birthtime property of stats object which is creation time
        return stats.birthtime;
    }
    catch(error){
        console.log(`Could not get creation time of "${absPath}" due to error - "${error}"`);
        throw new Error(error);
    }
}

module.exports.getSingleFile = getSingleFile;
module.exports.verifyDirectoryFiles = verifyDirectoryFiles;
module.exports.getCreationTime = getCreationTime;