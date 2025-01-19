import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RomsCategory } from '../type/room-category.enum';

export type RoomDocument = HydratedDocument<Room>;

@Schema({ timestamps: true, collection: 'rooms' })
export class Room {
	@Prop({ required: true })
	number_room: string;

	@Prop({
		required: true,
		enum: RomsCategory,
	})
	room_category: number;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
