import store from '@/store/store';

import type { Options } from '@/lib/request/request';
import ContractRequest from '@/lib/request/contract-request';
import Web3Request from '@/lib/request/web3-request';

import Web3Service from '@/lib/services/web3-service';
import MetamaskService from '@/lib/services/metamask-service';
import Account from '@/lib/models/account/account';

// const ABI_DATA =
//   '{"abi":[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"receipt","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]}';

export default class ERC20TokenService {
  contractAddress: string;
  account: Account;
  options?: Options;
  contract: ContractRequest;
  web3: Web3Request;

  constructor(contractAddress: string, account: Account, options?: Options) {
    this.contractAddress = contractAddress;
    this.account = account;
    this.options = options;
    const web3 = Web3Service.metamask;
    this.web3 = new Web3Request(web3, options);
    const contract = new web3.eth.Contract(
      store.transformerInfo?.abi.erc20 as any,
      contractAddress,
    );
    this.contract = new ContractRequest(contract, options);
  }

  async balanceOf(precise = true): Promise<bigint> {
    const balance = await this.contract.methods.balanceOf(this.account.address);
    if (precise) {
      return balance;
    } else {
      const decimals = await this.decimals();
      return balance / 10n ** BigInt(decimals);
    }
  }

  async name(): Promise<string> {
    return await this.contract.methods.name();
  }

  async symbol(): Promise<string> {
    return await this.contract.methods.symbol();
  }

  async decimals(): Promise<number> {
    return await this.contract.methods.decimals();
  }

  async approve(spender: string, amount: string) {
    const allowance = await this.contract.methods.allowance(this.account.address, this.contractAddress);
    if (allowance >= BigInt(amount)) {
      return;
    }
    const data = await this.contract.methods.approve(spender, amount);

    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = await this.web3.eth.calculateFeeData();

    const params = [
      {
        from: this.account.address,
        to: this.contractAddress,
        maxFeePerGas: (maxFeePerGas as bigint).toString(16),
        maxPriorityFeePerGas: (maxPriorityFeePerGas as bigint).toString(16),
        data,
      },
    ];

    //await MetamaskService.reqeust({ method: "eth_sendTransaction", params });
    const tx = await MetamaskService.request(
      {
        method: 'eth_sendTransaction',
        params,
      },
      this.options,
    );
    return tx;
    //await this.waitForTransactionReceipt(tx as unknown as string);
  }

  // Helper function to wait for transaction receipt
  async waitForTransactionReceipt(txHash: string): Promise<any> {
    let receipt: any;
    while (!receipt) {
      try {
        receipt = await this.web3.eth.getTransactionReceipt(txHash, {
          ignoreTraceError: true,
          isAlert: false,
        });
      } catch (e) {
        console.log('error', e);
      }

      // Wait before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
