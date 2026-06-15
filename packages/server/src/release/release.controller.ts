import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ReleaseService } from './release.service';

@Controller('releases')
export class ReleaseController {
  constructor(private readonly releaseService: ReleaseService) {}

  @Post()
  create(@Body() dto: { appId: string; packageId: string; version: string; grayConfig?: { percentage: number; userWhitelist: string[] } }) {
    return this.releaseService.create(dto.appId, dto.packageId, dto.version, dto.grayConfig);
  }

  @Get()
  findByAppId(@Query('appId') appId: string, @Query('page') page = 1, @Query('pageSize') pageSize = 10) {
    return this.releaseService.findByAppId(appId, +page, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.releaseService.findById(id);
  }

  @Put(':id/activate')
  activate(@Param('id') id: string) {
    return this.releaseService.activate(id);
  }

  @Put(':id/rollback')
  rollback(@Param('id') id: string) {
    return this.releaseService.rollback(id);
  }
}
