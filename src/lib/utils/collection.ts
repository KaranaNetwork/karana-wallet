import _ from 'lodash';

class Collection {
  public merge<T>(a1: T[], a2: T[], key: string, direction = 1): T[] {
    const listMap = _.keyBy(a2, key);
    for (const i in a1) {
      const item1 = a1[i];
      const id = _.get(item1, key);
      const item2 = _.get(listMap, id);
      if (item2 && _.get(item1, key) == _.get(item2, key)) {
        a1[i] = _.get(listMap, id);
        delete listMap[id];
      }
    }
    const list: T[] = [];
    for (const item of a2) {
      const id = _.get(item, key);
      if (_.get(listMap, id)) {
        list.push(item);
      }
    }
    let c: T[] = [];
    if (direction < 0) {
      c = _.concat(list, a1);
    } else {
      c = _.concat(a1, list);
    }
    return c;
  }
}

export default new Collection();
