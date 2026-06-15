import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('apps')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  create(@Body() dto: { appId: string; appName: string; description?: string }) {
    return this.appService.create(dto, 'user-1'); // Simplified: get from auth
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 10) {
    return this.appService.findAll(+page, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.appService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.appService.delete(id);
  }
}
