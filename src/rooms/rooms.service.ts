import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './model/room.model';

@Injectable()
export class RoomsService {
	constructor(@InjectModel(Room.name) private userModel: Model<RoomDocument>) {}
}
