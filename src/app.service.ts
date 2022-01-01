import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Router } from 'express';
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
}
