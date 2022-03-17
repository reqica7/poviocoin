[//]: # (Replace this section with the project intro.)

# PovioCoin example

This is a simple example on how to connect node js with etherum smart contract

[//]: # (End Intro)


# Tooling

First we install globally ganache-cli and truffle

```bash
npm install truffle ganache-cli -g
```

## Environment

Install npm packages

```bash
npm i
```
Replace `.env.example` with `.env`.

First start up the emulator for our blockchain contract to connect and work.
You can start up by running the command 

```bash
$ ganache-cli
```

Since the contracts folder and migration will be on the repo we don't need to run command `truffle init` otherwise you have to

To compile contract run command : `truffle compile`

To build the contract run command : `truffle migrate`

To start the server run command :
```bash
# local development in watch mode
$ npm run start
```
