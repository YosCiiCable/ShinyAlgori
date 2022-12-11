import { GrantPermission } from '../../authenticate';

export class PermissionValidator {
  public static isAdmin(_role: string): boolean {
    return GrantPermission.adminRole.indexOf(_role) > -1;
  }
}
