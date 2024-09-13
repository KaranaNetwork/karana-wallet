const urlPattern = /http[s]?:\/\/[\d\w_-]+(\.[\d\w]+)+[^\s]*/;

class Text {
  public readonly urlPattern = urlPattern;
  public async copy(value: string) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = value;

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise((resolve, reject) => {
        document.execCommand('copy') ? resolve(null) : reject();
        textArea.remove();
      });
    }
  }
  public htmlEncode(text: string): string {
    const temp = document.createElement('div');
    temp.textContent != undefined ? (temp.textContent = text) : (temp.innerText = text);
    const output = temp.innerHTML;
    return output;
  }

  public htmlDecode(text: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = text;
    const output = (temp.innerText || temp.textContent) ?? '';
    return output;
  }

  public numberFormat(num: number): string {
    const numStr = num.toString();
    // 使用正则表达式每隔三位添加逗号
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  public middleEllipsis(s: string, sideLength = 10): string {
    if (s.length > sideLength * 2 + 3) {
      return s.substring(0, sideLength) + '...' + s.substring(s.length - sideLength, s.length);
    }
    return s;
  }

  public ucfirst(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}

const text = new Text();
export default text;
