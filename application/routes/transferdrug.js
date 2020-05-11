const createPO = require('../modules/transferdrug/createPO.js');
const createShipment = require('../modules/transferdrug/createShipment.js');
const updateShipment = require('../modules/transferdrug/updateShipment.js');
const retailDrug = require('../modules/transferdrug/retailDrug.js');

exports.createPO = (req, res) => {
    createPO.execute(req.body.organizationName, req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity)
            .then((purchaseorder) => {
                const msg = 'New purchase order created';
                console.log(msg);
                const result = {
                    status: 'success',
                    message: msg,
                    purchaseorder: purchaseorder
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

exports.createShipment = (req, res) => {
    createShipment.execute(req.body.organizationName, req.body.buyerCRN, req.body.drugName, req.body.listOfAssets, req.body.transporterCRN)
            .then((shipment) => {
                const msg = 'New shipment created';
                console.log(msg);
                const result = {
                    status: 'success',
                    message: msg,
                    shipment: shipment
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

exports.updateShipment = (req, res) => {
    updateShipment.execute(req.body.organizationName, req.body.buyerCRN, req.body.drugName, req.body.transporterCRN)
            .then((assets) => {
                const msg = 'Shipment updated';
                console.log(msg);
                const result = {
                    status: 'success',
                    message: msg,
                    assets: assets
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

exports.retailDrug = (req, res) => {
    retailDrug.execute(req.body.organizationName, req.body.drugName, req.body.serialNo, req.body.retailerCRN, req.body.customerAadhar)
            .then((drug) => {
                const msg = 'Drug retailed';
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