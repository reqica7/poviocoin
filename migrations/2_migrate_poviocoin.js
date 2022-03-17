var PovioCoin = artifacts.require('./PovioCoin.sol');

module.exports = function (deployer) {
	deployer.deploy(PovioCoin);
};
