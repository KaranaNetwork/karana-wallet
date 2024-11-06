import _ from 'lodash';
import Decimal from 'decimal.js';

class DecimalUtil {
  public isValidDecimal(x: string) {
    return /^\d+(\.\d+)?$/.test(x);
  }

  public add(x: Decimal.Value, y: Decimal.Value): Decimal {
    const a1 = x ? new Decimal(x) : new Decimal(0);
    const a2 = y ? new Decimal(y) : new Decimal(0);
    return a1.add(a2);
  }

  public mul(x: Decimal.Value, y: Decimal.Value): Decimal {
    const a1 = x ? new Decimal(x) : new Decimal(0);
    const a2 = y ? new Decimal(y) : new Decimal(0);
    return a1.mul(a2);
  }

  public div(x: Decimal.Value, y: Decimal.Value): Decimal {
    const a1 = x ? new Decimal(x) : new Decimal(0);
    const a2 = y ? new Decimal(y) : new Decimal(0);
    return a1.div(a2);
  }

  public sub(x: Decimal.Value, y: Decimal.Value): Decimal {
    const a1 = x ? new Decimal(x) : new Decimal(0);
    const a2 = y ? new Decimal(y) : new Decimal(0);
    return a1.sub(a2);
  }

  public compareTo(x: Decimal.Value, y: Decimal.Value): number {
    const a1 = x ? new Decimal(x) : new Decimal(0);
    const a2 = y ? new Decimal(y) : new Decimal(0);
    return a1.comparedTo(a2);
  }

  public floor(x: Decimal.Value, decimalPlaces: number): string {
    const a = x ? new Decimal(x) :new Decimal(0);
    return a.toFixed(decimalPlaces, Decimal.ROUND_FLOOR);
  }
}

export default new DecimalUtil();
