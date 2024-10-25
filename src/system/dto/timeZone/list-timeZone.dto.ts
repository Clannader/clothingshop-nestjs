/**
 * Create by oliver.wu 2024/10/15
 */
import { CreateTimeZoneDto } from './create-timeZone.dto';
import { Expose } from 'class-transformer';

export class ListTimeZoneDto extends CreateTimeZoneDto {
  /**
   * ID
   */
  @Expose()
  id: string;
}
