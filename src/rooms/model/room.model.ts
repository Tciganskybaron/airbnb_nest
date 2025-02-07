/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
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
	room_category: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface Room extends Document {
	_id: string;
	number_room: string;
	room_category: string;
	createdAt: Date;
	updatedAt: Date;
	__v: number;
}
