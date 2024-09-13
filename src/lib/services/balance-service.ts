import store from '@/store/store';
import Decimal from 'decimal.js';
import decimalUtil from '@/lib/utils/decimal';

export default class BalanceService {
  static humanLize(balance: Decimal.Value, decimals?: number) {
    if (!decimals) {
      decimals = store.serverInfo?.assets.decimals ?? 12;
    }
    const a = decimalUtil.div(balance, 10 ** decimals);
    if (decimalUtil.compareTo(0, a) == 0) {
      return '0';
    }
    if (decimalUtil.compareTo(0.00001, a) > 0) {
      return '<0.00001';
    }
    let n = a.toFixed(5, Decimal.ROUND_FLOOR);
    if (n.indexOf('.') >= 0) {
      for (let i = n.length - 1; i >= 0; i--) {
        if (n[i] != '0') {
          if (n[i] == '.') {
            n = n.substring(0, i);
          } else {
            n = n.substring(0, i + 1);
          }
          break;
        }
      }
    }
    return n;
  }

  //将带精度的转换为不带精度的
  static withoutAccuracy(balance: Decimal.Value, decimals?: number) {
    if (!decimals) {
      decimals = store.serverInfo?.assets.decimals ?? 12;
    }
    const a = decimalUtil.mul(balance, 10 ** decimals);
    if (decimalUtil.compareTo(0, a) == 0) {
      return '0';
    }
    return a.toFixed(0, Decimal.ROUND_FLOOR);
  }

  //不带带精度的转换为带精度的
  static withAccuracy(balance: Decimal.Value, decimals?: number) {
    if (!decimals) {
      decimals = store.serverInfo?.assets.decimals ?? 12;
    }
    const a = decimalUtil.div(balance, 10 ** decimals);
    if (decimalUtil.compareTo(0, a) == 0) {
      return '0';
    }
    return a.toFixed(decimals, Decimal.ROUND_FLOOR);
  }

  static convertToMinUnit(balance: Decimal.Value, decimals?: number): string {
    if (!decimals) {
      decimals = store.serverInfo?.assets.decimals ?? 12;
    }
    const a = decimalUtil.div(balance, 10 ** decimals);
    if (decimalUtil.compareTo(0, a) == 0) {
      return '0';
    }
    if (decimalUtil.compareTo(0.00001, a) > 0) {
      return '<0.00001';
    }
    let n = a.toFixed(5, Decimal.ROUND_FLOOR);
    if (n.indexOf('.') >= 0) {
      for (let i = n.length - 1; i >= 0; i--) {
        if (n[i] != '0') {
          if (n[i] == '.') {
            n = n.substring(0, i);
          } else {
            n = n.substring(0, i + 1);
          }
          break;
        }
      }
    }
    return n;
  }
}
