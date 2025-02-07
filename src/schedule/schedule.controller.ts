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
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { SheduleDto } from './dto/shedule.dto';
import { ROOM_BOOKED, SHEDULE_NOT_FOUND } from './constant/message';
import { ROOM_NOT_FOUND } from 'src/rooms/constant/message';
import { ValidateObjectIdPipe } from './pipe/validateObjectIdPipe';
import { Roles } from 'src/decorators/user-role.decorator';
import { UserRole } from 'src/user/type/userRole.enum';
import { TelegramService } from 'src/telegram/telegram.service';
@Controller('schedule')
export class ScheduleController {
	constructor(
		private readonly sheduleService: ScheduleService,
		private readonly telegramService: TelegramService,
	) {}

	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
	@Post('create')
	@HttpCode(201)
	async create(@Body() dto: SheduleDto) {
		const isOccupied = await this.sheduleService.isRoomOccupied(dto.roomId, dto.time);
		if (isOccupied === 'ROOM_NOT_FOUND') {
			throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
		}

		if (isOccupied) {
			throw new HttpException(ROOM_BOOKED, HttpStatus.CONFLICT);
		}
		const shedule = await this.sheduleService.create(dto);

		if (!shedule._id) {
			throw new HttpException('Ошибка при создании бронирования', HttpStatus.INTERNAL_SERVER_ERROR);
		}
		const populatedShedule = await this.sheduleService.getOne(
			shedule._id.toString(),
			'roomId userId',
		);

		// Проверяем наличие данных
		if (!populatedShedule?.userId || !populatedShedule?.roomId) {
			throw new HttpException(
				'Ошибка при загрузке данных бронирования',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		const message =
			`📅 *Новое бронирование* \n` +
			`👤 *Имя*: ${populatedShedule.userId.name}\n` +
			`📞 *Телефон*: ${populatedShedule.userId.telephone}\n` +
			`📆 *Дата*: ${populatedShedule.time}\n` +
			`🏨 *Номер комнаты*: ${populatedShedule.roomId.number_room}\n` +
			`📌 *Статус*: ${populatedShedule.status}`;

		await this.telegramService.sendMessage(message);
		return shedule;
	}

	@Get(':id')
	@HttpCode(200)
	async get(@Param('id', ValidateObjectIdPipe) id: string) {
		const shedule = await this.sheduleService.getOne(id);

		if (!shedule) {
			throw new HttpException(SHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
		}
		return shedule;
	}

	@Get('statistics/:month')
	@HttpCode(200)
	@Roles(UserRole.Admin)
	async getStatistic(@Param('month') month: string) {
		return await this.sheduleService.getStatistic(month);
	}

	@Delete(':id')
	@HttpCode(204)
	async delete(@Param('id', ValidateObjectIdPipe) id: string) {
		const deletedRoom = await this.sheduleService.deleteOne(id);

		if (!deletedRoom) {
			throw new HttpException(SHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
		}

		const message =
			`❌ Отмена бронирования:\n` +
			`👤 Имя: ${deletedRoom.userId?.name ?? 'Неизвестно'}\n` +
			`📞 Телефон: ${deletedRoom.userId?.telephone ?? 'Неизвестно'}\n` +
			`📅 Дата: ${deletedRoom.time}\n` +
			`🏠 Номер комнаты: ${deletedRoom.roomId?.number_room ?? 'Неизвестно'}\n` +
			`🔴 Статус: ${deletedRoom.status}`;

		await this.telegramService.sendMessage(message);
	}

	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
	@Patch(':id')
	@HttpCode(200)
	async path(@Param('id', ValidateObjectIdPipe) id: string, @Body() dto: SheduleDto) {
		const updated = await this.sheduleService.update(id, dto);

		if (!updated) {
			throw new HttpException(SHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
		}
		return updated;
	}
}
