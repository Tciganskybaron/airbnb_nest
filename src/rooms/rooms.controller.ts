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
import { RoomDto } from './dto/room.dto';
import { RoomsService } from './rooms.service';
import { ROOM_NOT_FOUND } from './constant/message';
import { Room } from './model/room.model';
import { ValidateObjectIdPipe } from './pipe/validateObjectIdPipe';

@Controller('rooms')
export class RoomsController {
	constructor(private readonly roomService: RoomsService) {}

	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
	@Post('create')
	@HttpCode(201)
	async create(@Body() dto: RoomDto): Promise<Room> {
		return this.roomService.create(dto);
	}

	@Get('all')
	@HttpCode(200)
	async getAll(): Promise<Room[]> {
		return this.roomService.getAll();
	}

	@Get(':id')
	@HttpCode(200)
	async get(@Param('id', ValidateObjectIdPipe) id: string): Promise<Room> {
		const room = await this.roomService.getOne(id);
		if (!room) {
			throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
		}
		return room;
	}

	@Delete(':id')
	@HttpCode(204)
	async delete(@Param('id', ValidateObjectIdPipe) id: string): Promise<void> {
		const deletedRoom = await this.roomService.deleteOne(id);
		if (!deletedRoom) {
			throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
		}
	}

	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
	@Patch(':id')
	@HttpCode(200)
	async path(@Param('id', ValidateObjectIdPipe) id: string, @Body() dto: RoomDto): Promise<Room> {
		const updated = await this.roomService.update(id, dto);
		if (!updated) {
			throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
		}
		return updated;
	}
}
