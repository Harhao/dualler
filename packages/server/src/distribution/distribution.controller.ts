import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { DistributionService } from './distribution.service';

@Controller('distributions')
export class DistributionController {
  constructor(private readonly distributionService: DistributionService) {}

  @Post()
  create(@Body() dto: { appId: string; version: string; platform: 'android' | 'ios' | 'web'; downloadUrl: string }) {
    return this.distributionService.create(dto.appId, dto.version, dto.platform, dto.downloadUrl);
  }

  @Get()
  findByAppId(@Query('appId') appId: string, @Query('page') page = 1, @Query('pageSize') pageSize = 10) {
    return this.distributionService.findByAppId(appId, +page, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.distributionService.findById(id);
  }
}
