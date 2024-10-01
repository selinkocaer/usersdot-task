import { Module } from '@nestjs/common';
import { MySQLService } from './mysql.service';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, MySQLService],
})
export class AppModule {}
