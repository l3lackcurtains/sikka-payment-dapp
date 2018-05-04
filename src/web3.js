import Web3 from 'web3';

const web3 = new Web3();

export const providers = {
  testrpc: web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))
};

/* eslint-disable */
if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
  providers.window = web3.setProvider(window.web3.currentProvider);
}

export function getCurrentProvider() {
  return web3.currentProvider;
}

export function setProvider(provider) {
  if (typeof provider === 'string') {
    web3.setProvider(providers[provider]);
  } else {
    web3.setProvider(provider);
  }
}

// Abstract the getBalance object
export function getBalance() {
  return web3.eth.getBalance.apply(web3.eth, arguments);
}

// Abstract contract object
export function contract() {
  return web3.eth.contract(web3.eth, arguments);
}

export function fixTruffleContractCompatibilityIssue(contract) {
  if (typeof contract.currentProvider.sendAsync !== 'function') {
    contract.currentProvider.sendAsync = function() {
      return contract.currentProvider.send.apply(contract.currentProvider, arguments);
    };
  }
  return contract;
}

/* eslint-enable */
export default web3;
