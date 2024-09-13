import _ from 'lodash';

export default abstract class Model {
  public $source?: unknown;

  constructor(source?: unknown) {
    Object.defineProperty(this, '$source', {
      enumerable: false,
    });
    if (source) {
      this.$source = source;
      this.assign(source);
    }
  }

  public objectArrayClasses(): object {
    return {};
  }

  public hasKey(key: string) {
    return _.get(this.$source, key) !== undefined;
  }

  public assign(data: unknown) {
    if (!this.$source) {
      this.$source = data;
    } else if (this.$source instanceof Object && data instanceof Object) {
      this.$source = { ...this.$source, ...data };
    }

    const keys = _.keys(this);
    for (const key of keys) {
      let value = _.get(this, key);
      value = this.getValue(value, _.get(data, key), key);
      _.set(this, key, value);
    }
    return this;
  }

  public clearArray() {
    const keys = _.keys(this);
    for (const key of keys) {
      const value = _.get(this, key);
      if (value instanceof Array) {
        _.set(this, key, []);
      } else if (value instanceof Model) {
        value.clearArray();
      }
    }
    return this;
  }

  public getValue(
    value: object | boolean | string | number,
    data: object | boolean | string | number,
    key: string,
  ): object | boolean | string | number {
    if (_.isUndefined(data) || data === null) {
      return value;
    }
    switch (typeof value) {
      case 'boolean':
        if (data === '1' || data === 1 || data === true) {
          value = true;
        } else if (data === '0' || data === 0 || data === false) {
          value = false;
        } else {
          value = !!data;
        }
        break;
      case 'number':
        value = !isNaN(parseFloat(data as string)) ? parseFloat(data as string) : value;
        break;
      case 'string':
        value = String(data).valueOf();
        break;
      case 'object':
        if (value instanceof Model) {
          value.assign(data as object);
        } else if (value instanceof Array) {
          if (_.has(this.objectArrayClasses(), key)) {
            if (data instanceof Array) {
              value.splice(0, value.length);
              for (const i in data) {
                const cls = _.get(this.objectArrayClasses(), key);
                const obj = new cls();
                if (obj instanceof Model) {
                  obj.assign(data[i] as object);
                  value.push(obj);
                } else if (obj instanceof String) {
                  value.push(String(data[i]));
                } else if (obj instanceof Number) {
                  value.push(Number(data[i]));
                } else {
                  value.push(data[i]);
                }
              }
            } else {
              value = data;
            }
          } else {
            value = data;
          }
        } else {
          value = data;
        }
        break;
    }
    return value;
  }

  static fromObject<T extends Model>(c: new () => T, data: object): T {
    const obj = new c();
    obj.assign(data);
    return obj;
  }

  static fromArray<T extends Model>(c: new () => T, list: Array<object>) {
    const a: T[] = [];
    _.forEach(list, (item) => {
      const obj = new c();
      obj.assign(item);
      a.push(obj);
    });
    return a;
  }

  static fromMap<T extends Model>(c: new () => T, m: _.Dictionary<object>) {
    const a: _.Dictionary<T> = {};
    for (const i in m) {
      const obj = new c();
      obj.assign(m[i]);
      a[i] = obj;
    }
    return a;
  }
}

export function createModel<T extends Model>(c: new () => T, data: object): T {
  const obj = new c();
  obj.assign(data);
  return obj;
}

export function createModels<T extends Model>(c: new () => T, list: Array<object>): T[] {
  const a: T[] = [];
  _.forEach(list, (item) => {
    const obj = new c();
    obj.assign(item);
    a.push(obj);
  });
  return a;
}
