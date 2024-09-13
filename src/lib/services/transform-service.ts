import type { Options } from '@/lib/request/request';
import OmniverseTransformerService from '@/lib/services/contract-services/omniverse-transformer-service';
import ERC20TokenService from '@/lib/services/contract-services/erc20-token-service';
import TransactionService from '@/lib/services/transaction-service';
import Account from '@/lib/models/account/account';

export default class TransformService {
  options?: Options;
  public constructor(options?: Options) {
    this.options = options;
  }

  public async up(data: { account: Account; transformerAddress: string; amount: string }) {
    const transformer = new OmniverseTransformerService(
      data.transformerAddress,
      data.account,
      this.options,
    );
    const localTokenAddress = await transformer.getLocalTokenAddress();
    const erc20 = new ERC20TokenService(localTokenAddress, data.account, this.options);

    // approve
    const tx = await erc20.approve(data.transformerAddress, data.amount);

    //wait
    await erc20.waitForTransactionReceipt(tx as unknown as string);

    // convert from local to omniverse
    await transformer.convertToOmniverse(data.amount);
  }

  async down(data: {
    account: Account;
    transformerAddress: string;
    amount: string;
    tokenAssetId: string;
  }) {
    const transformer = new OmniverseTransformerService(
      data.transformerAddress,
      data.account,
      this.options,
    );
    const target = await transformer.getPubkey();
    const txData = await TransactionService.constructTransfer(
      {
        accountAddress: data.account.address,
        chainId: data.account.chainId,
        publicKey32: data.account.publicKey32,
        assetId: data.tokenAssetId,
        outputs: [
          {
            address: target,
            amount: data.amount,
          },
        ],
      },
      this.options,
    );
    console.log('convertToLocal txData: ', txData);
    // submit the transaction data to transformer contract
    await transformer.convertToLocal(txData);
    // send transaction to omniverse server
    //console.log('Transfer txData: ', txData);
    await TransactionService.sendTransaction('Transfer', txData, this.options);
  }

  async claimAll(data: { transformerAddress: string; account: Account }) {
    const transformer = new OmniverseTransformerService(
      data.transformerAddress,
      data.account,
      this.options,
    );
    await transformer.claimAll();
  }
}
