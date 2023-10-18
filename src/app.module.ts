import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalExceptionFilter } from './core/global-exception.filter';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AutoIncrementModule } from './modules/auto-increment/auto-increment.module';
import { RolesModule } from './modules/roles/roles.module';
import { EntityModule } from './modules/entity/entity.module';
import { NewsModule } from './modules/news/news.module';
import { DealsModule } from './modules/deals/deals.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { ClassifiedsModule } from './modules/classifieds/classifieds.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),  
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      }
    }),
    BullModule.registerQueue({
      name: 'item',
    }),
    UsersModule,
    AuthModule,
    AutoIncrementModule,
    RolesModule,
    EntityModule,
    NewsModule,
    DealsModule,
    ClubsModule,
    ClassifiedsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    },
    AppService,
],
})
export class AppModule {}
