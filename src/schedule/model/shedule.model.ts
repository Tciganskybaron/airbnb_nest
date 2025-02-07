import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, HydratedDocument, Schema as MSchema } from 'mongoose';
import { Room } from 'src/rooms/model/room.model';
import { ScheduleStatus } from '../type/shedule-status.enum';

export type SheduleDocument = HydratedDocument<Shedule>;

@Schema({ timestamps: true, collection: 'shedule' })
export class Shedule {
	@Prop({ type: Date, required: true })
	time: Date;

	@Prop({
		required: true,
		enum: ScheduleStatus,
	})
	status: string;

	@Prop({ type: MSchema.Types.ObjectId, ref: Room.name, required: true })
	roomId: Room;
}

export const SheduleSchema = SchemaFactory.createForClass(Shedule);
