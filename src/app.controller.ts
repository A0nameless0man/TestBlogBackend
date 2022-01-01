import { Body, Controller, Get, HttpException, Logger, Param, Post, Req, Res, Session } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SessionData } from 'express-session';
import { json } from 'stream/consumers';

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
      throw new HttpException("Know yourself!", StatusCodes.UNAUTHORIZED)
    }
  }

  @Get("/user/:id")
  getUser(@Param('id') idStr: string) {
    const id = parseInt(idStr)
    return this.appService.getUser(id)
  }

  @Post("/login")
  async login(@Session() session: Partial<SessionData>, @Body() body: { username, password }) {
    if (!((typeof body.username) == "string") || !((typeof body.password) === "string")) {
      throw new HttpException("?", StatusCodes.BAD_REQUEST)
    }
    const res = await this.appService.login(body.username, body.password)
    session.userId = res.user.id
    return res
  }

}
