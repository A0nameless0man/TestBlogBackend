import { Controller, Get, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { Request as ExpressRequest } from "express";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(@Request() req: ExpressRequest) {
    return this.appService.getHello(req);
  }
}
