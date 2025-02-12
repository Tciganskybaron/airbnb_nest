import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shedule, SheduleDocument } from './model/shedule.model';
import { SheduleDto } from './dto/shedule.dto';
import { ScheduleStatus } from './type/shedule-status.enum';

@Injectable()
export class ScheduleService {
	constructor(@InjectModel(Shedule.name) private sheduleModel: Model<SheduleDocument>) {}

	async create(dto: SheduleDto): Promise<Shedule> {
		return this.sheduleModel.create(dto);
	}

	async getOne(sheduleId: string, populate?: string): Promise<Shedule | null> {
		if (!this.isValidObjectId(sheduleId)) {
			return null;
		}
		const id = new Types.ObjectId(sheduleId);
		const query = this.sheduleModel.findById(id);

		if (populate) {
			query.populate(populate);
		}

		return query.exec();
	}

	async getStatistic(month: string) {
		const monthNumber = parseInt(month, 10);
		return this.sheduleModel
			.aggregate()
			.match({ $expr: { $eq: [{ $month: '$time' }, monthNumber] } })
			.group({
				_id: '$roomId', // Группируем по roomId
				shedule: { $sum: 1 }, // Считаем количество записей
			})
			.project({
				_id: 0, // Убираем _id из вывода
				roomId: '$_id',
				shedule: 1,
			});
	}

	async deleteOne(sheduleId: string): Promise<Shedule | null> {
		if (!this.isValidObjectId(sheduleId)) {
			return null;
		}
		const id = new Types.ObjectId(sheduleId);
		return this.sheduleModel
			.findByIdAndUpdate(id, { status: ScheduleStatus.Cancelled }, { new: true })
			.populate('roomId userId')
			.exec();
	}

	async update(sheduleId: string, dto: SheduleDto): Promise<Shedule | null> {
		if (!this.isValidObjectId(sheduleId)) {
			return null;
		}
		const id = new Types.ObjectId(sheduleId);
		return this.sheduleModel.findByIdAndUpdate(id, dto, { new: true }).exec();
	}

	async isRoomOccupied(roomId: string, date: Date): Promise<Shedule | 'ROOM_NOT_FOUND' | null> {
		const startOfDay = new Date(date);
		startOfDay.setUTCHours(0, 0, 0, 0);

		const endOfDay = new Date(date);
		endOfDay.setUTCHours(23, 59, 59, 999);

		const shedule = await this.sheduleModel
			.findOne({
				roomId,
				time: { $gte: startOfDay, $lt: endOfDay },
			})
			.populate('roomId userId')
			.exec();
		if (!shedule) {
			return null;
		}

		if (!shedule.roomId) {
			return 'ROOM_NOT_FOUND';
		}

		return shedule;
	}

	isValidObjectId(id: string): boolean {
		return Types.ObjectId.isValid(id);
	}
}
