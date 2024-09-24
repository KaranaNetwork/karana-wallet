import Model from '@/lib/models/model';
import TransformRecord from '@/lib/models/transform/transform-record';

export default class TransformRecordPageData extends Model {
  items: Array<TransformRecord> = [];
  page: number = 0;
  pageNumber: number = 0;
  total: number = 0;
  public objectArrayClasses(): object {
    return {
      records: TransformRecord,
    };
  }
}
