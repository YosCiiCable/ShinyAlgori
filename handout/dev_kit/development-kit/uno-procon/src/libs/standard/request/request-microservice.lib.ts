/**
 * @description custom request internal service
 * @version 1.0
 * @since 2018/05/22
 */

import * as _ from 'lodash';
import * as request from 'request';
import * as requestPromise from 'request-promise';

import { ConfigLib } from '../../config.lib';
import { MethodOption, OptionRequest, Strategy } from '../../commons';

export class RequestMicroserviceLib {
  public _request: request.RequestAPI<
    requestPromise.RequestPromise,
    requestPromise.RequestPromiseOptions,
    request.RequiredUriUrl
  >;
  public _optionBase: any = {};
  public _apiGateway = ConfigLib.API_GATEWAY;

  /**
   * @constructor RequestLib
   * @param headersSecure
   */
  constructor(
    headersSecure: any = { [Strategy.ClientSecret]: ConfigLib.SECURE.API_RESTRICT.CLIENT_SECRET },
  ) {
    this._request = requestPromise;
    this._optionBase = {
      headers: {
        'Content-Type': 'application/json',
      },
      json: true,
      qs: {
        env: ConfigLib.ENVIRONMENT,
      },
    };
    if (headersSecure) {
      Object.keys(headersSecure).forEach((key) => {
        this._optionBase.headers[key] = headersSecure[key];
      });
    }
  }

  set optionBase(__optionBase: any) {
    this._optionBase = __optionBase;
  }

  get optionBase() {
    return this._optionBase;
  }

  set apiGateway(__apiGateway: string) {
    this._apiGateway = __apiGateway;
  }

  get apiGateway() {
    return this._apiGateway;
  }

  /**
   * @method mergeOption
   * @description merge option request
   * @param options
   * @param method
   */
  public mergeOption(options: OptionRequest, method: MethodOption) {
    this._optionBase.method = method;
    return _.omitBy(
      Object.assign({}, this._optionBase, {
        method: method,
        url: `${this._apiGateway}/${options.service}/${options.url}`,
        body: options.body,
        qs: Object.assign(this._optionBase.qs, options.qs),
      }),
      _.isNil,
    ) as any;
  }

  /**
   * @method get
   * @param {OptionRequest} options
   * @param {boolean} ignoreQueryString
   * @return {requestPromise.RequestPromise}
   * @example
   {
      service: ServiceOption.NOTIFY;
      url: 'template/keys';
      qs: {
        page:1
      }
   }
   */
  public get(options: OptionRequest, ignoreQueryString = false) {
    const newOption = this.mergeOption(options, MethodOption.GET);
    if (ignoreQueryString) {
      Reflect.deleteProperty(newOption, 'qs');
    }
    return this._request(newOption);
  }

  /**
   * @method post
   * @param {OptionRequest} options
   * @return {requestPromise.RequestPromise}
   * @example
   {
      service: ServiceOption.NOTIFY;
      url: 'mail/send';
      body: {
        page:1
      }
   }
   */
  public post(options: OptionRequest) {
    const newOption = this.mergeOption(options, MethodOption.POST);
    return this._request(newOption);
  }

  /**
   * @method put
   * @param {OptionRequest} options
   * @return {requestPromise.RequestPromise}
   * @example
   {
      service: ServiceOption.NOTIFY;
      url: 'mail/send';
      body: {
        info: 'phat.phan@sotatek.com'
      }
   }
   */
  public put(options: OptionRequest) {
    const newOption = this.mergeOption(options, MethodOption.PUT);
    return this._request(newOption);
  }

  /**
   * @method delete
   * @param {OptionRequest} options
   * @return {requestPromise.RequestPromise}
   * @example
   {
      service: ServiceOption.WHOLESALER;
      url: 'auction/:id'
   }
   */
  public delete(options: OptionRequest) {
    const newOption = this.mergeOption(options, MethodOption.DELETE);
    return this._request(newOption);
  }

  /**
   * @method patch
   * @param {OptionRequest} options
   * @return {requestPromise.RequestPromise}
   * @example
   {
      service: ServiceOption.WHOLESALER;
      url: 'auction/:id',
      body: {
        name: 'mr.strength',
        address: 'bit to VN'
      }
   }
   */
  public patch(options: OptionRequest) {
    const newOption = this.mergeOption(options, MethodOption.PATCH);
    return this._request(newOption);
  }
}
