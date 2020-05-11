const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

// Import all routes
const registration = require('./routes/registration.js');
const transferdrug = require('./routes/transferdrug.js');
const viewlifecycle = require('./routes/viewlifecycle.js');

module.exports = app;

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharmacy Supply Chain App');

app.post('/registerCompany', registration.registerCompany);
app.post('/addDrug', registration.addDrug);

app.post('/createPO', transferdrug.createPO);
app.post('/createShipment', transferdrug.createShipment);
app.put('/updateShipment', transferdrug.updateShipment);
app.put('/retailDrug', transferdrug.retailDrug);

app.get('/viewHistory', viewlifecycle.viewHistory);
app.get('/viewDrugCurrentState', viewlifecycle.viewDrugCurrentState);

app.listen(port, () => console.log(`Distributed Pharma Supply Chain app listening on port ${port}!`)).setTimeout(0);
