/**
 * Create by oliver.wu 2024/10/16
 */
import { ListTimeZoneDto } from '../timeZone';
import { PartialType } from '@nestjs/swagger';

export class ReqTimeZoneModifyDto extends PartialType(ListTimeZoneDto) {}
