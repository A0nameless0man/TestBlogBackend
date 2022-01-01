import { HttpException, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response, NextFunction, Router } from 'express';
import { SessionData } from 'express-session';
import { StatusCodes } from 'http-status-codes';
import { Repository } from 'typeorm';
import Article from './articles.entity';
import { Extract, Sign } from './sign';
import User from './user.entity';

@Injectable()
export class TokenMiddleWare implements NestMiddleware {
  constructor() { }
  private salt: string = "k-on!"
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers["x-auth-token"]
    if (typeof token === "string") {
      const payload = Extract(token, this.salt)
      if (payload && typeof payload["id"] === 'number') {
        (req.session as Partial<SessionData>).userId = payload["id"]
      }
    }
    next()
  }
}
@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Article) private articleRepository: Repository<Article>,
  ) {
    this.init();
  }
  getHello(req: Request) {
    const router = req.app._router as Router;
    return {
      routes: router.stack
        .map((layer) => {
          if (layer.route) {
            const path = layer.route?.path;
            const method = layer.route?.stack[0].method;
            return `${method.toUpperCase()} ${path}`;
          }
        })
        .filter((item) => item !== undefined),
    };
  }
  async init() {
    if ((await this.userRepository.findOne({ id: 1 })) === undefined) {
      this.userRepository.save({
        id: 1,
        username: 'root',
        password: 'password',
      });
    }
    return this.userRepository.findOne({ id: 1 });
  }
  async getUser(id: number): Promise<User> {
    return await this.userRepository.findOne({ id: id });
  }

  async login(username: string, password: string) {
    const user = await this.userRepository.findOne({ username, password })
    if (user === undefined) {
      throw new HttpException("用户名或密码错误", StatusCodes.NOT_FOUND)
    }
    return { user, token: Sign(user, "k-on!") };
  }

  async getArticles(page: number, pageSize: number) {
    return await this.articleRepository.findAndCount({ skip: pageSize * (page - 1), take: pageSize, relations: ["user"] })
  }

  async getArticle(id: number) {
    return await this.articleRepository.findOne(id, { select: ["content","created","id","title","updated"],relations:["user"] })
  }
  async createOrUpdateArticle(user: User, article: Partial<Article>) {
    article.user = user;
    return await this.articleRepository.save(article)
  }
}
