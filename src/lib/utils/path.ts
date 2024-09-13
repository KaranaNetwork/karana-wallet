import _ from 'lodash';
class Path {
  public join(...args: string[]) {
    args = args.map(function (v: string): string {
      return _.trim(v, '/');
    });
    return _.join(args, '/');
  }

  public suffix(filename: string): string {
    const a = filename.split('.');
    if (a.length > 1) {
      return '.' + a[a.length - 1];
    }
    return '';
  }

  public isVideo(filename: string): boolean {
    return ['.mp4'].indexOf(this.suffix(filename).toLowerCase()) >= 0;
  }
}
const path = new Path();
export default path;
