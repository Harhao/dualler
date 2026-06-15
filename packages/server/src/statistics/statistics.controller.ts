import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Post('log')
  logAccess(@Body() dto: { appId: string; version: string; platform: string; ip: string; userAgent: string }) {
    return this.statisticsService.logAccess(dto.appId, dto.version, dto.platform, dto.ip, dto.userAgent);
  }

  @Get('app/:appId')
  findByAppId(
    @Param('appId') appId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return this.statisticsService.findByAppId(appId, +page, +pageSize);
  }

  @Get('app/:appId/stats')
  getStats(
    @Param('appId') appId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statisticsService.getStats(appId, new Date(startDate), new Date(endDate));
  }
}
