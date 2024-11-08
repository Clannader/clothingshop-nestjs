/**
 * Create by oliver.wu 2024/10/29
 */
// import type { HttpAbstractService } from './services';

export type ServiceType = 'localhost' | 'staging' | 'jwt';

export type ServiceOptions = {
  serviceType: ServiceType;
  userName?: string;
  shopId?: string;
  password?: string;
};

export type ServiceCache = {
  // service: HttpAbstractService;
  options: ServiceOptions;
  credential?: string;
  accessToken?: string;
  refreshToken?: string;
  publicKey?: string;
};
