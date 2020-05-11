const viewHistory = require('../modules/viewlifecycle/viewHistory.js');
const viewDrugCurrentState = require('../modules/viewlifecycle/viewDrugCurrentState.js');

exports.viewHistory = (req, res) => {
    viewHistory.execute(req.body.organizationName, req.body.drugName, req.body.serialNo)
            .then((drughistory) => {
                const msg = 'Drug history fetched';
                console.log(msg);
                const result = {
                    status: 'success',
                    message: msg,
                    drughistory: drughistory
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

exports.viewDrugCurrentState = (req, res) => {
    viewDrugCurrentState.execute(req.body.organizationName, req.body.drugName, req.body.serialNo)
            .then((drug) => {
                const msg = 'Drug fetched';
                console.log(msg);
                const result = {
                    status: 'success',
                    message: msg,
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