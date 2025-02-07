import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../type/userRole.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'user' })
export class User {
	@Prop({ required: true, unique: true, index: true })
	email: string;

	@Prop({ required: true })
	passwordHash: string;

	@Prop({ required: true })
	name: string;

	@Prop({ required: true })
	telephone: string;

	@Prop({
		required: true,
		enum: UserRole,
	})
	role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
