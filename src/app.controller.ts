import { BadRequestException, Body, Controller, createParamDecorator, ExecutionContext, Get, HttpException, Logger, Param, Post, Req, Res, Session, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SessionData } from 'express-session';

const UserId = createParamDecorator((_, ctx: ExecutionContext) => {
  return ((ctx.switchToHttp().getRequest() as Request).session as Partial<SessionData>).userId
})

export const IntParam = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const id = parseInt(req.params[data], 10);
    if (Number.isInteger(id)) return id;
    else throw new BadRequestException(`Param ${data} should be integer`);
  },
);

export const IntQuery = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const id = parseInt(req.query[data], 10);
  if (Number.isInteger(id)) return id;
  else throw new BadRequestException(`Query ${data} should be integer`);
});

export const OptionalIntQuery = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const id = parseInt(req.query[data], 10);
    if (!id) return undefined;
    if (Number.isInteger(id)) return id;
    else throw new BadRequestException(`Query ${data} should be integer`);
  },
);
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(@Req() req: Request) {
    return this.appService.getHello(req);
  }

  @Get('/user/self')
  async getUserSelf(@UserId() id: number | undefined) {
    if (id !== undefined) {
      return await this.appService.getUser(id);
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
    if (((typeof body.username) !== "string") || ((typeof body.password) !== "string")) {
      throw new HttpException("?", StatusCodes.BAD_REQUEST)
    }
    const res = await this.appService.login(body.username, body.password)
    session.userId = res.user.id
    return res
  }

  @Post("/logout")
  async logout(@Session() session: Partial<SessionData>) {
    session.userId = undefined
    return { msg: "ok" }
  }

  @Get("/article")
  async getArticles(@OptionalIntQuery("page") page: number = 1, @OptionalIntQuery("page_size") pageSize: number = 20) {
    return this.appService.getArticles(page, pageSize)
  }

  @Post("/article")
  async createArticle(@UserId() userId: number | undefined, @Body() body: { title, content }) {
    if (userId === undefined) {
      throw new UnauthorizedException("Tell me your name")
    }
    if (((typeof body.title) !== "string") || ((typeof body.content) !== "string")) {
      throw new HttpException("?", StatusCodes.BAD_REQUEST)
    }
    return await this.appService.createOrUpdateArticle(await this.appService.getUser(userId), { title: body.title, content: body.content })
  }

  @Get("/article/:id")
  getArticle(@IntParam("id") id: number) {
    return this.appService.getArticle(id)
  }

  @Post("/article/:id")
  async updateArticle(@UserId() userId: number | undefined, @Body() body: { title, content }) {
    if (userId === undefined) {
      throw new UnauthorizedException("Tell me your name")
    }
    if (((typeof body.title) !== "string") || ((typeof body.content) !== "string")) {
      throw new HttpException("?", StatusCodes.BAD_REQUEST)
    }
  }
}
