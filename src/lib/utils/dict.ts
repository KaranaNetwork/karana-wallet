import _ from 'lodash';

class Dict {
  public mergeFilter(data1: any, data2: any, field = 'id') {
    const data = {
      ...this.filterEmpty(data1, field),
      ...this.filterEmpty(data2, field),
    };
    return data;
  }
  public filterEmpty(data: any, field = 'id') {
    const keys = Object.keys(data);
    for (const key of keys) {
      if (_.isEmpty(_.get(data, [key, field]))) {
        _.unset(data, key);
      }
    }
    return data;
  }

  public flatten(obj: any) {
    const result: _.Dictionary<any> = {};
    function traverse(prefix: string, value: any) {
      if (typeof value === 'object' && value !== null) {
        Object.keys(value).forEach(function (key) {
          traverse(prefix == '' ? key : prefix + '_' + key, value[key]);
        });
      } else if (prefix != '') {
        result[prefix] = value;
      }
    }
    traverse('', obj);
  }
}

export default new Dict();
