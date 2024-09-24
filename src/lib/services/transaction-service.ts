import hexUtil from '@/lib/utils/hex';
import objectUtil from '@/lib/utils/object';
import request, { type Options } from '@/lib/request/request';
import SignService from '@/lib/services/sign-service';
import type { IInput, IOutput, ITransfer } from '@/lib/models/transaction/transaction';

export default class TransactionService {
  static async deploy(
    data: {
      account: string;
      chainId: number;
      publicKey32: string;
      name: string;
      totalSupply: string;
      price: string;
      mintAmount: string;
      salt: string;
    },
    options?: Options,
  ) {
    const metadata = {
      name: data.name,
      deployer: data.publicKey32,
      totalSupply: data.totalSupply,
      price: data.price,
      mintAmount: data.mintAmount,
      salt: data.salt,
    };
    const preDeployData = await request.rpc('preDeploy', [metadata], options);
    objectUtil.removeNull(preDeployData);
    console.log('preDeploy:', preDeployData);

    console.log('metadata:', metadata);
    //let signature = "";
    const sign = await SignService.deploySign(data.account, data.chainId, {
      metadata: objectUtil.snakeCaseKeys(metadata),
      ...objectUtil.snakeCaseKeys(preDeployData),
    });
    console.log('deploy sign: ', sign);
    const result = await request.rpc(
      'sendTransaction',
      [
        {
          type: 'Deploy',
          metadata: metadata,
          signature: sign,
          ...preDeployData,
        },
      ],
      options,
    );
    console.log('deploy: ', result);
  }

  static async mint(
    data: {
      account: string;
      chainId: number;
      publicKey32: string;
      assetId: string;
      outputs: { address: string; amount: string }[];
    },
    options?: Options,
  ) {
    const assetId = hexUtil.padding0x(data.assetId);
    const outputs = data.outputs.map((output) => {
      return {
        address: hexUtil.padding0x(output.address),
        amount: output.amount,
      };
    });
    const preMintData = await request.rpc(
      'preMint',
      [
        {
          assetId: hexUtil.padding0x(assetId),
          address: hexUtil.padding0x(data.publicKey32),
          outputs: outputs,
        },
      ],
      options,
    );
    objectUtil.removeNull(preMintData);
    const sign = await SignService.mintSign(data.account, data.chainId, {
      asset_id: assetId,
      outputs: outputs,
      ...(objectUtil.snakeCaseKeys(preMintData) as object),
    });
    const result = await request.rpc(
      'sendTransaction',
      [
        {
          type: 'Mint',
          signature: sign,
          assetId: assetId,
          outputs: outputs,
          ...preMintData,
        },
      ],
      options,
    );
    console.log('result: ', result);
  }

  static async transfer(
    data: {
      account: string;
      chainId: number;
      publicKey32: string;
      assetId: string;
      outputs: { address: string; amount: string }[];
    },
    options?: Options,
  ) {
    const assetId = hexUtil.padding0x(data.assetId);
    const outputs = data.outputs.map((output) => {
      return {
        address: hexUtil.padding0x(output.address),
        amount: output.amount,
      };
    });
    const preTransferData = await request.rpc(
      'preTransfer',
      [
        {
          assetId: hexUtil.padding0x(assetId),
          address: hexUtil.padding0x(data.publicKey32),
          outputs: outputs,
        },
      ],
      options,
    );
    const sign = await SignService.transferSign(data.account, data.chainId, {
      asset_id: data.assetId,
      ...(objectUtil.snakeCaseKeys(preTransferData) as object),
    });
    const result = await request.rpc(
      'sendTransaction',
      [
        {
          type: 'Transfer',
          signature: sign,
          assetId: data.assetId,
          ...preTransferData,
        },
      ],
      options,
    );
    console.log('result:', result);
  }

  static async preTransfer(
    data: {
      assetId: string;
      address: string;
      outputs: { address: string; amount: string }[];
    },
    options?: Options,
  ): Promise<{
    inputs: IInput[];
    outputs: IOutput[];
    feeInputs: IInput[];
    feeOutputs: IOutput[];
  }> {
    const assetId = hexUtil.padding0x(data.assetId);
    const expectedOutputs = data.outputs.map((output) => {
      return {
        address: hexUtil.padding0x(output.address),
        amount: output.amount,
      };
    });
    const preTransferData = await request.rpc(
      'preTransfer',
      [
        {
          assetId: hexUtil.padding0x(assetId),
          address: hexUtil.padding0x(data.address),
          outputs: expectedOutputs,
        },
      ],
      options,
    );

    const inputs = preTransferData.inputs.map((input: IInput) => {
      return {
        txid: input.txid,
        index: input.index,
        amount: input.amount,
        address: input.address,
      };
    });

    const outputs = preTransferData.outputs.map((output: IOutput) => {
      return {
        amount: output.amount,
        address: output.address,
      };
    });

    const feeInputs = preTransferData.feeInputs.map((input: IInput) => {
      return {
        txid: input.txid,
        index: input.index,
        amount: input.amount,
        address: input.address,
      };
    });

    const feeOutputs = preTransferData.feeOutputs.map((output: IOutput) => {
      return {
        amount: output.amount,
        address: output.address,
      };
    });

    return {
      inputs,
      outputs,
      feeInputs,
      feeOutputs,
    };
  }

  static async constructTransfer(
    data: {
      accountAddress: string;
      chainId: number;
      publicKey32: string;
      assetId: string;
      outputs: { address: string; amount: string }[];
    },
    options?: Options,
  ): Promise<ITransfer> {
    const preTransferData = await this.preTransfer(
      {
        assetId: data.assetId,
        address: data.publicKey32,
        outputs: data.outputs,
      },
      options,
    );

    const sign = await SignService.transferSign(
      data.accountAddress,
      data.chainId,
      {
        asset_id: data.assetId,
        inputs: preTransferData.inputs,
        outputs: preTransferData.outputs,
        fee_inputs: preTransferData.feeInputs,
        fee_outputs: preTransferData.feeOutputs,
      },
      options,
    );

    const txData: ITransfer = {
      assetId: data.assetId,
      signature: sign,
      inputs: preTransferData.inputs,
      outputs: preTransferData.outputs,
      feeInputs: preTransferData.feeInputs,
      feeOutputs: preTransferData.feeOutputs,
    };

    return txData;
  }

  static async sendTransaction(txType: string, txData: object, options?: Options): Promise<any> {
    const result = await request.rpc(
      'sendTransaction',
      [
        {
          type: txType,
          ...txData,
        },
      ],
      options,
    );
    return result;
  }
}
