import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Room, RoomDocument } from './model/room.model';
import { RoomDto } from './dto/room.dto';

@Injectable()
export class RoomsService {
	constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

	async create(dto: RoomDto): Promise<Room> {
		return this.roomModel.create(dto);
	}

	async getOne(roomId: string): Promise<Room | null> {
		if (!Types.ObjectId.isValid(roomId)) {
			return null;
		}
		const id = new Types.ObjectId(roomId);
		return this.roomModel.findOne({ id }).exec();
	}

	async getAll(): Promise<Room[]> {
		return await this.roomModel.find({}).exec();
	}

	async deleteOne(roomId: string): Promise<Room | null> {
		if (!Types.ObjectId.isValid(roomId)) {
			return null;
		}
		const id = new Types.ObjectId(roomId);
		return this.roomModel.findByIdAndDelete(id).exec();
	}

	async update(roomId: string, dto: RoomDto): Promise<Room | null> {
		if (!Types.ObjectId.isValid(roomId)) {
			return null;
		}
		const id = new Types.ObjectId(roomId);
		return this.roomModel.findByIdAndUpdate(id, dto, { new: true }).exec();
	}
}
