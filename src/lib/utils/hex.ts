class HexUtil {
  public hexToIntArray(
    hexString: string,
    options: { unitLength?: number; prefix?: string } = {
      unitLength: 2,
      prefix: '0x',
    },
  ) {
    const unitLength = options.unitLength ?? 2;
    const prefix = options.prefix ?? '0x';
    hexString = this.trimLeft(hexString, prefix);
    const result: number[] = []; // 创建空数组用于存放结果
    for (let i = 0; i < hexString.length / unitLength; i++) {
      const startIndex = i * unitLength; // 计算当前起始索引
      const subHexStr = hexString.substring(startIndex, startIndex + unitLength); // 获取当前N位子字符串

      const decimalNum = parseInt(subHexStr, 16); // 将子字符串转换为十进制数值

      result.push(decimalNum); // 添加到结果数组中
    }
    return result;
  }

  public intArrayToHex(a: number[], prefix = ''): string {
    return (
      prefix +
      Array.from(a)
        .map((n) => Number(n).toString(16).padStart(2, '0'))
        .join('')
    );
  }

  public intArrayToJson(a: number[]) {
    const serializedJsonBytes = new Uint8Array(a);
    const textDecoder = new TextDecoder('utf-8');
    const serializedJsonString = textDecoder.decode(serializedJsonBytes);
    const data = JSON.parse(serializedJsonString);
    return data;
  }

  public stringToHex(s: string) {
    let hex = '';
    for (let i = 0; i < s.length; i++) {
      hex += s.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return hex;
  }

  public intToHex(i: number, prefix = '0x') {
    return prefix + i.toString(16);
  }

  public bigIntToHex(i: string | number | bigint | boolean, byteCount: number) {
    return BigInt(i).toString(16).padStart(byteCount, '0');
  }

  public bigIntToHexLE(i: string | number | bigint | boolean, byteCount: number) {
    const hex = this.bigIntToHex(i, byteCount);
    let hexLE = '';
    // 每两个字符一组反转顺序
    for (let i = 0; i < hex.length; i += 2) {
      hexLE = hex.substring(i, i + 2) + hexLE;
    }
    return hexLE;
  }

  padding0x(s: string): `0x${string}` {
    if (s.startsWith('0x')) {
      return s as `0x${string}`;
    }
    return `0x${s}`;
  }

  trim0x(s: string): string {
    if (s.startsWith('0x')) {
      return s.substring(2);
    }
    return s;
  }

  trimLeft(s: string, prefix = '0x'): string {
    if (s.startsWith(prefix)) {
      return s.substring(2);
    }
    return s;
  }

  paddingLeft(s: string, prefix = '0x'): string {
    if (s.startsWith(prefix)) {
      return s;
    }
    return `${prefix}${s}`;
  }

  convertIntArrayToHex(o: unknown, prefix = '0x'): unknown {
    if (o instanceof Array) {
      let isHex = o.length > 0 && o.length % 2 == 0;
      for (let i = 0; i < o.length; i++) {
        if (!(typeof o[i] == 'number' && o[i] >= 0 && o[i] <= 255)) {
          isHex = false;
        }
      }
      if (isHex) {
        return this.intArrayToHex(o, prefix);
      }
      const a = [];
      for (let i = 0; i < o.length; i++) {
        //o[i] = this.convertIntArrayToHex(o[i], prefix);
        a.push(this.convertIntArrayToHex(o[i], prefix));
      }
      return a;
    } else if (o instanceof Object) {
      const a = {};
      for (const key in o) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        a[key] = this.convertIntArrayToHex(o[key], prefix);
        //_.set(o, key, this.convertIntArrayToHex(_.get(o, key), prefix));
      }
      return a;
    }
    return o;
  }

  converHexToIntArray(o: unknown, prefix = '0x'): unknown {
    if (typeof o == 'string') {
      if (o.startsWith(prefix)) {
        return this.hexToIntArray(o, { prefix: prefix });
      }
    } else if (o instanceof Array) {
      const a = [];
      for (let i = 0; i < o.length; i++) {
        a.push(this.converHexToIntArray(o[i], prefix));
      }
      return a;
    } else if (o instanceof Object) {
      const a = {};
      for (const key in o) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        a[key] = this.converHexToIntArray(o[key], prefix);
        //_.set(o, key, this.converHexToIntArray(_.get(o, key), prefix));
      }
      return a;
    }
    return o;
  }
}

export default new HexUtil();
