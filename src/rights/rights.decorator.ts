import { RightsEnum } from './rights.constants';
import { SetMetadata } from '@nestjs/common';

export const RIGHTS_KEY = 'RIGHTS';
export const RIGHTS_KEY_OR = 'RIGHTS_OR';

/**
 * 权限并且的逻辑
 * @param roles
 * @constructor
 */
export const ApiRights = (...roles: RightsEnum[]) =>
  SetMetadata(RIGHTS_KEY, roles);

/**
 * 权限或者的逻辑
 * @param roles
 * @constructor
 */
export const ApiOrRights = (...roles: RightsEnum[]) =>
  SetMetadata(RIGHTS_KEY_OR, roles);
