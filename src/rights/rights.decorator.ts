import { RightsEnum } from './rights.constants';
import { SetMetadata } from '@nestjs/common';

export const RIGHTS_KEY = 'RIGHTS';
export const Rights = (...roles: RightsEnum[]) =>
  SetMetadata(RIGHTS_KEY, roles);
