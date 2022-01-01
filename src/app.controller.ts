import { Controller, Get, Req, Res, Session } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { SessionData } from 'express-session';
import { StatusCodes } from 'http-status-codes';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(@Req() req: Request) {
    return this.appService.getHello(req);
  }

  @Get('/user/self')
  getUserSelf(@Session() session: Partial<SessionData>, @Res() resp: Response) {
    if (session.userId !== undefined) {
      return this.appService.getUser(session.userId);
    } else {
      resp.statusCode = StatusCodes.UNAUTHORIZED
      return { code: StatusCodes.UNAUTHORIZED, message: "Know yourself!" }
    }
  }
}
