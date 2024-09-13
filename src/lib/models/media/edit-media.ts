export default class EditMedia {
  mediaId = '';
  path = '';
  src = '';
  editSrc = '';
  file!: File;
  filename = '';
  fileWidth = 0;
  fileHeight = 0;
  fileDuration = 0;
  fileSize = 0;
  fileMd5 = '';
  isUploaded = 0;
  isConvertSubmited = 0;

  public constructor(file?: File) {
    if (file) {
      this.setFile(file);
    }
  }

  public setFile(file: File) {
    this.file = file;
    this.filename = file.name;
    this.fileSize = file.size;
  }

  public get isComplete(): number {
    return this.isUploaded && this.isConvertSubmited;
  }
}
