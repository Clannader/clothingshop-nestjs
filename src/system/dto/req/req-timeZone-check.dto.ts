/**
 * Create by oliver.wu 2024/10/17
 */
import { ListTimeZoneDto } from '../timeZone';
import { PartialType } from '@nestjs/swagger';

export class ReqTimeZoneCheckDto extends PartialType(ListTimeZoneDto) {}
