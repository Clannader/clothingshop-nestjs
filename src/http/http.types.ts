/**
 * Create by oliver.wu 2024/10/29
 */
export type ServiceType = 'localhost' | 'staging' | 'jwt';

export type ServiceOptions = {
  serviceType: ServiceType;
  userName?: string;
  password?: string;
}