import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { PackageService } from './package.service';

@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post('upload')
  upload(@Body() dto: { appId: string; version: string; releaseNote: string }) {
    return this.packageService.upload(dto.appId, dto.version, dto.releaseNote, {
      size: 1024,
      buffer: Buffer.from(''),
    });
  }

  @Get()
  findByAppId(@Query('appId') appId: string, @Query('page') page = 1, @Query('pageSize') pageSize = 10) {
    return this.packageService.findByAppId(appId, +page, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packageService.findById(id);
  }

  @Put(':id/publish')
  publish(@Param('id') id: string) {
    return this.packageService.publish(id);
  }

  @Put(':id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.packageService.unpublish(id);
  }

  @Get(':appId/check')
  checkUpdate(@Param('appId') appId: string, @Query('version') version: string) {
    const result = this.packageService.findByAppId(appId);
    const pkg = result.items[0];
    if (!pkg || pkg.version === version) {
      return { needUpdate: false, packageInfo: null };
    }
    return { needUpdate: true, packageInfo: pkg };
  }
}
