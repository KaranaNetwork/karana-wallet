import _ from 'lodash';

class ObjectUtil {
  snakeCaseKeys<T>(o: T): T {
    if (o instanceof Array) {
      const a = [];
      for (const value of o) {
        a.push(this.snakeCaseKeys(value));
      }
      return a as unknown as T;
    } else if (o instanceof Object) {
      const a = {};
      for (const key in o) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        a[_.snakeCase(key)] = this.snakeCaseKeys(o[key]);
      }
      return a as T;
    }
    return o;
  }
  camelCaseKeys<T>(o: T): T {
    if (o instanceof Array) {
      const a = [];
      for (const value of o) {
        a.push(this.camelCaseKeys(value));
      }
      return a as unknown as T;
    } else if (o instanceof Object) {
      const a = {};
      for (const key in o) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        a[_.camelCase(key)] = this.camelCaseKeys(o[key]);
      }
      return a as T;
    }
    return o;
  }

  removeNull(o: object): object {
    for (const key in o) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      if (o[key] === null || o[key] === undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        delete o[key];
      }
    }
    return o;
  }
}

export default new ObjectUtil();
