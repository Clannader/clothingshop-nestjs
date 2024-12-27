/**
 * Create by oliver.wu 2024/12/27
 */
import { ApiCommon, ApiTagsController } from '@/common/decorator';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { TokenCacheService } from '@/cache/services';
import { SequenceSchemaService } from '@/entities/services';
import { SequenceTypeEnum } from '@/common/enum';

@ApiCommon()
@Controller('/ifc/box')
@ApiTagsController('BoxController', '测试BOX接口')
export class BoxController {
  @Inject()
  protected readonly tokenCacheService: TokenCacheService;

  @Inject()
  private readonly sequenceSchemaService: SequenceSchemaService;

  @Post('/upload-log')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试上传日志',
    description: '测试上传日志',
  })
  async writeLog(@Body() params: Record<string, any>) {
    const list = params.ifclog_list;
    const trace_id = list[0].trace_id;
    console.log(trace_id);
    await this.tokenCacheService.setTokenCache(trace_id, trace_id);
    const [err, result] = await this.sequenceSchemaService
      .getNextSequence(SequenceTypeEnum.Message)
      .then((result) => [null, result])
      .catch((err) => [err]);
    if (err) {
      console.error(err);
      return;
    }
    console.log(`序列号为:${result.sequenceId}`);
    return { err: '' };
  }
}
