import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac } from 'crypto';
import { Request, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Repository } from 'typeorm';
import User from './user.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
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

  sign(obj: Object,salt:string): string {
    let s = ''
    switch (typeof obj) {
      case "object":
        const keys: Array<string> = []
        const values: Array<string> = []
        for (const k in obj) {
          keys.push(k)
        }
        keys.sort()
        for (const k of keys) {
          values.push(this.sign(obj[k],salt))
        }
        s = `{${keys.join("$")}:${values.join("$")}}`
        break;

      default:
        s = JSON.stringify(obj)
        break;
    }
    return createHmac("sha256", salt).update(s).digest("base64url")
  }

  async login(username: string, password: string) {
    const user = await this.userRepository.findOne({ username, password })
    if (user === undefined) {
      throw new HttpException("用户名或密码错误", StatusCodes.NOT_FOUND)
    }
    return { user, token: this.sign(user,"k-on!") };
  }
}
