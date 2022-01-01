import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService, TokenMiddleWare } from './app.service';
import Article from './articles.entity';
import User from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data.sqlite',
      autoLoadEntities: true,
      synchronize: true // auto create tables do not do this in prod env
    }),
    TypeOrmModule.forFeature([User, Article])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenMiddleWare).forRoutes(AppController)
  }
}
