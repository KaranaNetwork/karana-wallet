class TimeUtil {
  public currentTimestamp(): number {
    return new Date().getTime();
  }

  public humanize(timestamp: number): string {
    const now = new Date().getTime();
    const subSecond = (now - timestamp) / 1000;
    if (subSecond < 10) {
      return 'Now';
    } else if (subSecond < 60) {
      return Math.floor(subSecond) + 's';
    } else if (subSecond < 3600) {
      return Math.floor(subSecond / 60) + 'm';
    } else if (subSecond < 86400) {
      return Math.floor(subSecond / 3600) + 'h';
    } else if (subSecond < 86400 * 4) {
      return Math.floor(subSecond / 86400) + 'd';
    }
    const time = new Date(timestamp);
    if (time.getFullYear() == new Date().getFullYear()) {
      return time.toDateString().split(' ')[1] + ' ' + time.getDate();
    }
    return time.toDateString().split(' ')[1] + ' ' + time.getDate() + ', ' + time.getFullYear();
  }

  public date(timestamp: number): string {
    const time = new Date(timestamp);
    return time.toDateString().split(' ')[1] + '. ' + time.getDate() + ', ' + time.getFullYear();
  }

  public format(timestamp: number) {
    const time = new Date(timestamp);
    return `${time.getDate()}/${time.getMonth()}/${time.getFullYear()}`;
  }

  public formatToString(timestamp: number) {
    const date = new Date(timestamp);
    return date.toString();
  }

  // standard format: "Jan 1, 2020 12:00 AM or PM"
  public standard(timestamp: number): string {
    const time = new Date(timestamp);
    return (
      time.toDateString().split(' ')[1] +
      ' ' +
      time.getDate() +
      ', ' +
      time.getFullYear() +
      ' · ' +
      time.toLocaleTimeString(navigator.language, {
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
      })
    );
  }

  public iso(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear(); // 获取年份
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 获取月份并补零
    const day = date.getDate().toString().padStart(2, '0'); // 获取日期并补零
    const hours = date.getHours().toString().padStart(2, '0'); // 获取小时并补零
    const minutes = date.getMinutes().toString().padStart(2, '0'); // 获取分钟并补零
    const seconds = date.getSeconds().toString().padStart(2, '0'); // 获取秒钟并补零
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // 返回格式化后的日期时间字符串
    // return time.toISOString();
  }

  public sleep(n: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, n);
    });
  }
}

export default new TimeUtil();
