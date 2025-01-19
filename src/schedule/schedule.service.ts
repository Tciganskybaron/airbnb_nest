import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shedule, SheduleDocument } from './model/shedule.model';

@Injectable()
export class ScheduleService {
	constructor(@InjectModel(Shedule.name) private userModel: Model<SheduleDocument>) {}
}
