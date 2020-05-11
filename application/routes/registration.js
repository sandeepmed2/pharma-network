const registerCompany = require('../modules/registration/registerCompany.js');
const addDrug = require('../modules/registration/addDrug.js');

exports.registerCompany = (req, res) => {
    registerCompany.execute(req.body.organizationName, req.body.companyCRN, req.body.companyName, req.body.location, req.body.organisationRole)
            .then((company) => {
                console.log('New company registered');
                const result = {
                    status: 'success',
                    message: 'New company registered',
                    company: company
                };
                res.json(result);
            })
            .catch((error) => {
                const result = {
                    status: 'error',
                    message: 'Failed',
                    error: error
                };
                res.status(500).send(result);
            })
};

exports.addDrug = (req, res) => {
    addDrug.execute(req.body.organizationName, req.body.drugName, req.body.serialNo, req.body.mfgDate, req.body.expDate, req.body.companyCRN)
            .then((drug) => {
                console.log('New drug added');
                const result = {
                    status: 'success',
                    message: 'New drug added',
                    drug: drug
                };
                res.json(result);
            })
            .catch((error) => {
                const result = {
                    status: 'error',
                    message: 'Failed',
                    error: error
                };
                res.status(500).send(result);
            })
};