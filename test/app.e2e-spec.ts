import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { RoomsService } from 'src/rooms/rooms.service';
import { ScheduleService } from 'src/schedule/schedule.service';
import { disconnect } from 'mongoose';

import { RomsCategory } from 'src/rooms/type/room-category.enum';
import { RoomDto } from 'src/rooms/dto/room.dto';
import { SheduleDto } from 'src/schedule/dto/shedule.dto';
import { SHEDULE_NOT_FOUND } from 'src/schedule/constant/message';
import { ROOM_NOT_FOUND } from 'src/rooms/constant/message';

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let roomService: RoomsService;
	let scheduleService: ScheduleService;
	const createdRoomIds: string[] = [];
	const createdSheduleIds: string[] = [];
	const nonExistentId: string = '000000000000000000000000';
	const invalid_id: string = '938300dfsdjn9Ljfdlnjkk';

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		roomService = moduleFixture.get<RoomsService>(RoomsService);
		scheduleService = moduleFixture.get<ScheduleService>(ScheduleService);

		// Создание 5 комнат
		const categories = [
			RomsCategory.Insider,
			RomsCategory.SeaView,
			RomsCategory.SeaTerrace,
			RomsCategory.RockStar,
			RomsCategory.MegaRockStar,
		];

		for (let i = 0; i < categories.length; i++) {
			const room = await roomService.create({
				number_room: String(i + 1),
				room_category: categories[i],
			});
			createdRoomIds.push(room._id);
		}
	});

	afterAll(async () => {
		for (const id of createdSheduleIds) {
			await scheduleService.deleteOne(id);
		}
		for (const id of createdRoomIds) {
			await roomService.deleteOne(id);
		}
		disconnect();
		await app.close();
	});

	describe('RoomsController', () => {
		it('POST /rooms/create - success', async () => {
			const createRoomDto: RoomDto = {
				number_room: '6',
				room_category: RomsCategory.Insider,
			};

			const response = await request(app.getHttpServer())
				.post('/rooms/create')
				.send(createRoomDto)
				.expect(201);

			expect(response.body).toHaveProperty('_id');
			expect(response.body.number_room).toBe(createRoomDto.number_room);
			expect(response.body.room_category).toBe(createRoomDto.room_category);

			createdRoomIds.push(response.body._id);
		});

		it('GET /rooms/all - success', async () => {
			const response = await request(app.getHttpServer()).get('/rooms/all').expect(200);

			expect(response.body.length).toBeGreaterThanOrEqual(5);
		});

		it('GET /rooms/:id - success', async () => {
			const roomId = createdRoomIds[0];
			const response = await request(app.getHttpServer()).get(`/rooms/${roomId}`).expect(200);

			expect(response.body).toHaveProperty('_id', String(roomId));
		});

		it('PATCH /rooms/:id - success', async () => {
			const roomId = createdRoomIds[0];
			const updateRoomDto: RoomDto = {
				number_room: '10',
				room_category: RomsCategory.RockStar,
			};

			const response = await request(app.getHttpServer())
				.patch(`/rooms/${roomId}`)
				.send(updateRoomDto)
				.expect(200);

			expect(response.body.number_room).toBe(updateRoomDto.number_room);
			expect(response.body.room_category).toBe(updateRoomDto.room_category);
		});

		it('DELETE /rooms/:id - success', async () => {
			const roomId = createdRoomIds.pop();
			await request(app.getHttpServer()).delete(`/rooms/${roomId}`).expect(204);
		});

		it('GET /rooms/:id - not found', async () => {
			await request(app.getHttpServer()).get(`/rooms/${invalid_id}`).expect(404, {
				statusCode: 404,
				message: ROOM_NOT_FOUND,
			});
		});

		it('PATCH /rooms/:id - not found', async () => {
			const updateRoomDto: RoomDto = {
				number_room: '10',
				room_category: RomsCategory.RockStar,
			};

			await request(app.getHttpServer())
				.patch(`/rooms/${invalid_id}`)
				.send(updateRoomDto)
				.expect(404, {
					statusCode: 404,
					message: ROOM_NOT_FOUND,
				});
		});

		it('DELETE /rooms/:id - not found', async () => {
			await request(app.getHttpServer()).delete(`/rooms/${invalid_id}`).expect(404, {
				statusCode: 404,
				message: ROOM_NOT_FOUND,
			});
		});

		it('GET /rooms/:id - room not found', async () => {
			await request(app.getHttpServer()).get(`/rooms/${nonExistentId}`).expect(404, {
				statusCode: 404,
				message: ROOM_NOT_FOUND,
			});
		});

		it('PATCH /rooms/:id - room not found', async () => {
			const updateRoomDto: RoomDto = {
				number_room: '10',
				room_category: RomsCategory.RockStar,
			};

			await request(app.getHttpServer())
				.patch(`/rooms/${nonExistentId}`)
				.send(updateRoomDto)
				.expect(404, {
					statusCode: 404,
					message: ROOM_NOT_FOUND,
				});
		});

		it('DELETE /rooms/:id - room not found', async () => {
			await request(app.getHttpServer()).delete(`/rooms/${nonExistentId}`).expect(404, {
				statusCode: 404,
				message: ROOM_NOT_FOUND,
			});
		});
	});

	describe('ScheduleController', () => {
		it('POST /schedule/create - success', async () => {
			const createSheduleDto: SheduleDto = {
				time: new Date(),
				status: 'reserved',
				roomId: createdRoomIds[0],
			};

			const response = await request(app.getHttpServer())
				.post('/schedule/create')
				.send(createSheduleDto)
				.expect(201);
			expect(response.body).toHaveProperty('_id');
			expect(response.body.status).toBe(createSheduleDto.status);
			expect(response.body.roomId).toBe(String(createSheduleDto.roomId));

			createdSheduleIds.push(response.body._id);
		});

		it('POST /schedule/create - room not found', async () => {
			const createSheduleDto: SheduleDto = {
				time: new Date(),
				status: 'reserved',
				roomId: nonExistentId,
			};

			await request(app.getHttpServer())
				.post('/schedule/create')
				.send(createSheduleDto)
				.expect(404, {
					statusCode: 404,
					message: ROOM_NOT_FOUND,
				});
		});

		it('GET /schedule/:id - success', async () => {
			const sheduleId = createdSheduleIds[0];
			const response = await request(app.getHttpServer()).get(`/schedule/${sheduleId}`).expect(200);

			expect(response.body).toHaveProperty('_id', String(sheduleId));
		});

		it('PATCH /schedule/:id - success', async () => {
			const sheduleId = createdSheduleIds[0];
			const updateSheduleDto: SheduleDto = {
				time: new Date(),
				status: 'confirmed',
				roomId: createdRoomIds[0],
			};

			const response = await request(app.getHttpServer())
				.patch(`/schedule/${sheduleId}`)
				.send(updateSheduleDto)
				.expect(200);

			expect(response.body.status).toBe(updateSheduleDto.status);
		});

		it('DELETE /schedule/:id - success', async () => {
			const sheduleId = createdSheduleIds.pop();
			await request(app.getHttpServer()).delete(`/schedule/${sheduleId}`).expect(204);
		});

		it('GET /schedule/:id - not found', async () => {
			await request(app.getHttpServer()).get(`/schedule/${invalid_id}`).expect(404, {
				statusCode: 404,
				message: SHEDULE_NOT_FOUND,
			});
		});

		it('PATCH /schedule/:id - not found', async () => {
			const updateSheduleDto: SheduleDto = {
				time: new Date(),
				status: 'confirmed',
				roomId: createdRoomIds[0],
			};

			await request(app.getHttpServer())
				.patch(`/schedule/${invalid_id}`)
				.send(updateSheduleDto)
				.expect(404, {
					statusCode: 404,
					message: SHEDULE_NOT_FOUND,
				});
		});

		it('DELETE /schedule/:id - not found', async () => {
			await request(app.getHttpServer()).delete(`/schedule/${invalid_id}`).expect(404, {
				statusCode: 404,
				message: SHEDULE_NOT_FOUND,
			});
		});

		it('GET /schedule/:id - shedule not found', async () => {
			await request(app.getHttpServer()).get(`/schedule/${nonExistentId}`).expect(404, {
				statusCode: 404,
				message: SHEDULE_NOT_FOUND,
			});
		});

		it('PATCH /schedule/:id - shedule not found', async () => {
			const updateSheduleDto: SheduleDto = {
				time: new Date(),
				status: 'confirmed',
				roomId: createdRoomIds[0],
			};

			await request(app.getHttpServer())
				.patch(`/schedule/${nonExistentId}`)
				.send(updateSheduleDto)
				.expect(404, {
					statusCode: 404,
					message: SHEDULE_NOT_FOUND,
				});
		});

		it('DELETE /schedule/:id - shedule not found', async () => {
			await request(app.getHttpServer()).delete(`/schedule/${nonExistentId}`).expect(404, {
				statusCode: 404,
				message: SHEDULE_NOT_FOUND,
			});
		});
	});
});
