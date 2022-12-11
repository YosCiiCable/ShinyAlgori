import { DateValidator } from './date.validator';
import { ExpressValidator } from './express.validator';
import { PermissionValidator } from './permission.validator';

export class Validators {
  public static dates = DateValidator;
  public static express = ExpressValidator;
  public static permissions = PermissionValidator;
}
