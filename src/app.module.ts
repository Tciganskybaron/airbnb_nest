import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from './schedule/schedule.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [ScheduleModule, RoomsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
