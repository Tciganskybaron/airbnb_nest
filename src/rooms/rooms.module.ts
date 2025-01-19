import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { Room, RoomSchema } from './model/room.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Room.name,
				schema: RoomSchema,
			},
		]),
	],
	controllers: [RoomsController],
	providers: [RoomsService],
})
export class RoomsModule {}
