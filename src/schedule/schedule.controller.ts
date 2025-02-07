import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { SheduleDto } from './dto/shedule.dto';
import { ROOM_BOOKED, SHEDULE_NOT_FOUND } from './constant/message';
@Controller('schedule')
export class ScheduleController {
	constructor(private readonly sheduleService: ScheduleService) {}

	@Post('create')
	@HttpCode(201)
	async create(@Body() dto: SheduleDto) {
		const isOccupied = await this.sheduleService.isRoomOccupied(dto.roomId, dto.time);
		if (isOccupied) {
			throw new HttpException(ROOM_BOOKED, HttpStatus.CONFLICT);
		}

		return this.sheduleService.create(dto);
	}

	@Get(':id')
	@HttpCode(200)
	async get(@Param('id') id: string) {
		const shedule = await this.sheduleService.getOne(id);

		if (!shedule) {
			throw new HttpException(SHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
		}
		return shedule;
	}

	@Delete(':id')
	@HttpCode(204)
	async delete(@Param('id') id: string) {
		const deletedRoom = await this.sheduleService.deleteOne(id);

		if (!deletedRoom) {
			throw new HttpException(SHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
		}
	}

	@Patch(':id')
	@HttpCode(200)
	async path(@Param('id') id: string, @Body() dto: SheduleDto) {
		const updated = await this.sheduleService.update(id, dto);

		if (!updated) {
			throw new HttpException(SHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
		}
		return updated;
	}
}
