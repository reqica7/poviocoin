const shortid = require('short-id');
const ObjectId = require('mongodb').ObjectID;

function routes(app, db, lms, accounts) {
	let dbUser = db.collection('povio-users');
	let dbTransaction = db.collection('povio-transaction');
	
	app.post('/register', async (req, res) => {
		let email = req.body.email;
		let address = req.body.address;
		
		if (!(email && address)) {
			res.status(400).json({ status: 'Failed', reason: 'wrong input' });
		}

		const user = await dbUser.findOne({ email });

		if (user) {
			res.status(400).json({
				status: 'Failed',
				reason: 'Already registered',
			});
		}

		const dbRes = await dbUser.insertOne({ email, address });
		res.json({ status: 'success', id: dbRes.insertedId });
	});

	app.post('/login', async (req, res) => {
		let email = req.body.email;
		if (!email) {
			res.status(400).json({ status: 'Failed', reason: 'wrong input' });
		}

		const user = await dbUser.findOne({ email });

		if(!user){
			res.status(404).json({
				status: 'Failed',
				reason: 'Not found!',
			});
		}

		res.json({ status: 'success', user });
	});

	app.get('/:id/getBalance', async (req, res) => {
		let id = req.params.id;

		if (!id) {
			res.status(404).json({ status: 'Not Found', reason: 'Not Found' });
		}

		const user = await dbUser.findOne({ _id: ObjectId(id) });

		const balanceOfUser = await lms.balanceOf(user.address);
		
		res.json({ status: 'success', balance: balanceOfUser.toString() });
	});

	app.post('/sendCoinsFromMainAcc', async (req, res) => {
		let address = req.body.to;
		let amount = req.body.amount || 0;

		if (!address) {
			res.status(400).json({ status: 'Failed', reason: 'wrong input' });
		}

		try {
			const transfer = await lms.transfer(address, amount, { from:  accounts[0]});
			if (transfer) {
				const date = new Date();
				const today = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
				const dbRes = await dbTransaction.insertOne({
					sender: accounts[0],
					receiver: address,
					amount,
					transcationHash: transfer.receipt.transactionHash,
					created_at: today,
				});
				res.json({ status: 'success', transcationId: dbRes.insertedId });
			}

			res.status(500).json({
				status: 'Failed',
				reason: 'Something went wrong!',
			});
		} catch (error) {
			res.status(500).json({
				status: 'Failed',
				reason: error,
			});
		}
	});

	app.get('/getTransactions', async (req, res) => {
	
		return await dbTransaction
			.find({})
			.toArray(function (err, result) {
				if (err) {
					res.send(err);
				} else {
					res.send(result);
				}
			});
	});

	app.get('/:id/allowance', async (req, res) => {

		let id = req.params.id;

		if (!id) {
			res.status(404).json({ status: 'Not Found', reason: 'Not Found' });
		}

		const user = await dbUser.findOne({ _id: ObjectId(id) });

		if (!user) {
			res.status(404).json({ status: 'Failed', reason: 'Not Found!' });
		}

		const allowanceCoins = await lms.allowance(accounts[0], user.address, {from:  accounts[0]});

		return res.send({ allowed: allowanceCoins.toString()});
	});

	app.post('/approve', async (req, res) => {

		let email = req.body.from;
		let amount = req.body.amount || 0;

		if (!email) {
			res.status(404).json({ status: 'Not Found', reason: 'Not Found' });
		}

		const user = await dbUser.findOne({ email });

		if (!user) {
			res.status(404).json({ status: 'Failed', reason: 'Not Found!' });
		}

		const allowanceCoins = await lms.approve(user.address, amount, {from:  accounts[0]});

		return res.send( allowanceCoins);
	});

	app.post('/sendCoins', async (req, res) => {
		let email = req.body.from;
		let address = req.body.to;
		let amount = req.body.amount || 0;

		if (!(email && address)) {
			res.status(400).json({ status: 'Failed', reason: 'wrong input' });
		}
		
		const user = await dbUser.findOne({ email });

		if (!user) {
			res.status(404).json({ status: 'Failed', reason: 'Not Found!' });
		}

		try {
			const transfer = await lms.transferFrom(user.address, address, amount,{from:  accounts[0]});
			console.log(transfer)
			if (transfer) {
				const date = new Date();
				const today = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
				const dbRes = await dbTransaction.insertOne({
					sender: user.address,
					receiver: address,
					amount,
					transcationHash: transfer.receipt.transactionHash,
					created_at: today,
				});

				return res.json({ status: 'success', transcationId: dbRes.insertedId });
			}

			res.status(500).json({
				status: 'Failed',
				reason: 'Couldn\'t approve transaction',
			});

		} catch (error) {
			res.status(500).json({
				status: 'Failed',
				reason: error,
			});
		}
	});
}

module.exports = routes;
