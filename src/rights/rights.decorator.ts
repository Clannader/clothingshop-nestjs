import { RightsEnum } from './rights.constants';
import { SetMetadata } from '@nestjs/common';

export const RIGHTS_KEY = 'rights';
export const Rights = (...roles: RightsEnum[]) =>
  SetMetadata(RIGHTS_KEY, roles);
