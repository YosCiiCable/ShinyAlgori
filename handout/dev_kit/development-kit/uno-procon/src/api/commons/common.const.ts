/**
 * @module CommonConst
 * @description Module common
 */

export class CommonConst {
  static readonly ATTACHMENT_TYPE: any = {
    FILE: 'file',
    IMAGE: 'image',
    VIDEO: 'video',
  };
  static readonly ATTACHMENT_STATUS: any = {
    ACCEPTED: 'accepted',
    PENDING: 'pending',
  };
  static readonly FILE_IS_REQUIRED: string = 'File is required.';
  static readonly EXTERNAL_FILE_TYPE: any = {
    UNDEFINED: 'undefined',
    PDF: 'pdf',
    VIDEO: 'video',
  };
  static readonly MIN_CODE: number = 0;
  static readonly MAX_CODE: number = 63;
}
