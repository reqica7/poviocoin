require('dotenv').config();
const express= require('express')
const routes = require('./routes')
const Web3 = require('web3');
const mongodb = require('mongodb').MongoClient
const contract = require('truffle-contract');

const app =express()
app.use(express.json());

const artifacts = require('./build/PovioCoin.json');
if (typeof web3 !== 'undefined') {
	var web3 = new Web3(web3.currentProvider)
} else {
	var provider = new Web3.providers.HttpProvider('http://localhost:8545');
	var web3 = new Web3();
	web3.setProvider(provider)
}

const LMS = contract(artifacts);
LMS.setProvider(provider);

mongodb.connect(process.env.DB_URL, { useUnifiedTopology: true }, async (err, client) => {
	const db = client.db(process.env.DB_NAME);
	
	const accounts = await web3.eth.getAccounts();
	web3.eth.defaultAccount = accounts[0];
	const lms = await LMS.deployed();
	// const lms = LMS.at('0x9D4b69aEcf9173e71EEfC425b6CCa794Bf9d20c9'); for remote nodes deployed on ropsten or rinkeby
	routes(app,db, lms, accounts)
	app.listen(process.env.PORT || 3000, () => {
		console.log('listening on port '+ (process.env.PORT || 3000));
	})
});
