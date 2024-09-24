import store from '@/store/store';
import request, { type Options } from '@/lib/request/request';
import type { TransformerInfo } from '@/lib/models/server/transformer-info';
import { createModel } from '@/lib/models/model';
import TransformRecordPageData from '@/lib/models/transform/transform-record-page-data';

class TransformerRequest {
  public async getTransformers(options?: Options): Promise<TransformerInfo> {
    const url = request.traUrl('/get_transformers');
    const data = await request.get(url, undefined, options);
    store.setTransformerInfo(data);
    return data;
  }

  public async getClaimableNumber(
    params: { ethAccount: string },
    options?: Options,
  ): Promise<{ count: number }> {
    const url = request.traUrl('/get_claimable_number');
    const data = await request.get(url, params, options);
    return data;
  }

  public async getPendingRecords(
    params: {
      ethAccount: string;
      page: number;
    },
    options?: Options,
  ): Promise<TransformRecordPageData> {
    const url = request.traUrl('/get_pending_records');
    const data = await request.get(url, params, options);
    return createModel(TransformRecordPageData, data);
  }

  public async getSettledRecords(
    params: {
      ethAccount: string;
      page: number;
    },
    options?: Options,
  ): Promise<TransformRecordPageData> {
    const url = request.traUrl('/get_settled_records');
    const data = await request.get(url, params, options);
    return createModel(TransformRecordPageData, data);
  }
}
export default new TransformerRequest();
