import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('ping')
  ping() {
    return this.appService.ping();
  }

  @Get('keep-alive')
  keepAlive() {
    return this.appService.keepAlive();
  }
}
