import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Shedule, SheduleSchema } from './model/shedule.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Shedule.name,
				schema: SheduleSchema,
			},
		]),
	],
	controllers: [ScheduleController],
	providers: [ScheduleService],
})
export class ScheduleModule {}
