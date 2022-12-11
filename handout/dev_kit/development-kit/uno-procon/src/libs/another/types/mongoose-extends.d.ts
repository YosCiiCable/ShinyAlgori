// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="mongoose" />
import * as Bluebird from 'bluebird';
import { Document as DocumentMongoose, ModelProperties, Error } from 'mongoose';
import { Pagination, PaginateParams, PaginateCursorParams } from '../../commons';

/**
 * @interface QueryHelper`
 */
interface QueryHelper<T> {
  /**
   * @method paginate
   * @description Extension method helps us paginate the documents in a query
   * @param params
   * @param callback
   */
  paginate(
    params?: PaginateParams,
    callback?: (err: any, data: Pagination<T>) => void,
  ): Bluebird<Pagination<T>>;

  paginateCursor(
    params?: PaginateCursorParams,
    callback?: (err: any, data: Pagination<T>) => void,
  ): Bluebird<Pagination<T>>;
}

interface MongooseDocumentHelper {
  validateSync(): Error;
}

declare module 'mongoose' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Query<T> extends QueryHelper<T> {}

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DocumentQuery<T, DocType extends DocumentMongoose> extends QueryHelper<T> {}

  interface Model<T extends Document, QueryHelpers = {}>
    extends NodeJS.EventEmitter,
      ModelProperties {}

  interface MongooseDocument extends MongooseDocumentHelper {
    validateSync(): Error;
  }

  interface Document {
    save(
      options: { validateBeforeSave: boolean },
      fn?: (err: any, product: this, numAffected: number) => void,
    ): Promise<this>;

    dateCreated: string;
    dateUpdated?: string;
  }

  type Promise<T> = Bluebird<T>;
}
