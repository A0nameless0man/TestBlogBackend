import { Controller, Get, HttpException, Logger, Param, Req, Res, Session } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SessionData } from 'express-session';

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
      throw new HttpException("Know yourself!",StatusCodes.UNAUTHORIZED)
    }
  }

  @Get("/user/:id")
  getUser(@Param('id') idStr: string) {
    const id = parseInt(idStr)
    return this.appService.getUser(id)
  }

}
