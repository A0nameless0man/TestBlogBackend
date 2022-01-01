import { Controller, Get, Request, Session } from '@nestjs/common';
import { AppService } from './app.service';
import { Request as ExpressRequest } from 'express';
import { SessionData } from 'express-session';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Request() req: ExpressRequest) {
    return this.appService.getHello(req);
  }

  @Get('/user/self')
  getUserSelf(@Session() session: Partial<SessionData>) {
    if (session.userId !== undefined) {
      return this.appService.getUser(session.userId);
    }
  }
}
