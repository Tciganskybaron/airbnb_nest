import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { RoomsService } from 'src/rooms/rooms.service';
import { ScheduleService } from 'src/schedule/schedule.service';
import { disconnect } from 'mongoose';

import { RomsCategory } from 'src/rooms/type/room-category.enum';
import { RoomDto } from 'src/rooms/dto/room.dto';
import {
	NUMBER_ROOM_NOT_EMPTY,
	NUMBER_ROOM_STRING,
	ROOM_CATEGORY_ENUM,
	ROOM_CATEGORY_NOT_EMPTY,
	ROOM_NOT_FOUND,
} from 'src/rooms/constant/message';
import { SheduleDto } from 'src/schedule/dto/shedule.dto';
import {
	ROOM_ID_NOT_EMPTY,
	ROOM_ID_STRING,
	SHEDULE_NOT_FOUND,
	STATUS_NOT_EMPTY,
	STATUS_STRING,
	TIME_DATE_STRING,
	TIME_NOT_EMPTY,
} from 'src/schedule/constant/message';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { AuthService } from 'src/auth/auth.service';
import { UserRole } from 'src/user/type/userRole.enum';
import { AuthCreateDto } from 'src/auth/dto/authCreate.dto';

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let authService: AuthService;
	let roomService: RoomsService;
	let scheduleService: ScheduleService;
	let adminUserToken: string;
	let userUserToken: string;
	const createdRoomIds: string[] = [];
	const createdSheduleIds: string[] = [];
	const usersToDelete: string[] = [];
	const nonExistentId: string = '000000000000000000000000';
	const invalid_id: string = 'invalidObjectId';

	// Функция для создания пользователя и получения токена
	const createAndLoginUser = async (userData: AuthCreateDto) => {
		const user = await authService.createUser(userData);
		usersToDelete.push(user.email); // Добавляем в список для удаления

		const response = await request(app.getHttpServer()).post('/auth/login').send({
			email: user.email,
			password: userData.password,
		});

		return response.body.access_token;
	};

	// Функция для создания комнат
	const createRooms = async () => {
		const categories = [
			RomsCategory.Insider,
			RomsCategory.SeaView,
			RomsCategory.SeaTerrace,
			RomsCategory.RockStar,
			RomsCategory.MegaRockStar,
		];

		for (const category of categories) {
			const room = await roomService.create({
				number_room: String(createdRoomIds.length + 1),
				room_category: category,
			});
			createdRoomIds.push(room._id);
		}
	};

	beforeAll(async () => {
		// Инициализируем приложение
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();

		// Подключаем глобальный Guard
		const reflector = app.get(Reflector);
		app.useGlobalGuards(new JwtAuthGuard(reflector));

		await app.init();

		// Получаем сервисы
		authService = moduleFixture.get<AuthService>(AuthService);
		roomService = moduleFixture.get<RoomsService>(RoomsService);
		scheduleService = moduleFixture.get<ScheduleService>(ScheduleService);

		// Создаем пользователей и получаем токены
		adminUserToken = await createAndLoginUser({
			email: 'admin@example.com',
			password: 'AdminPassword123!',
			role: UserRole.Admin,
			name: 'Admin User',
			telephone: '1234567890',
		});

		userUserToken = await createAndLoginUser({
			email: 'user@example.com',
			password: 'UserPassword123!',
			role: UserRole.User,
			name: 'Regular User',
			telephone: '0987654321',
		});

		// Создаем тестовые комнаты
		await createRooms();
	});

	afterAll(async () => {
		// Удаление расписаний
		for (const id of createdSheduleIds) {
			await scheduleService.deleteOne(id);
		}
		// Удаление комнат
		for (const id of createdRoomIds) {
			await roomService.deleteOne(id);
		}
		// Удаление пользователей
		for (const email of usersToDelete) {
			await authService.deleteUser({ email });
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
				.set('Authorization', `Bearer ${adminUserToken}`)
				.send(createRoomDto)
				.expect(201);

			expect(response.body).toHaveProperty('_id');
			expect(response.body.number_room).toBe(createRoomDto.number_room);
			expect(response.body.room_category).toBe(createRoomDto.room_category);

			createdRoomIds.push(response.body._id);
		});

		it('POST /rooms/create - error due to invalid room_category', async () => {
			const createRoomDto = {
				number_room: '6',
				room_category: 'dfsaf',
			};

			const response = await request(app.getHttpServer())
				.post('/rooms/create')
				.set('Authorization', `Bearer ${adminUserToken}`)
				.send(createRoomDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(ROOM_CATEGORY_ENUM);
		});

		it('POST /rooms/create - error due to invalid room_category empty', async () => {
			const createRoomDto = {
				number_room: '6',
			};

			const response = await request(app.getHttpServer())
				.post('/rooms/create')
				.set('Authorization', `Bearer ${adminUserToken}`)
				.send(createRoomDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(ROOM_CATEGORY_NOT_EMPTY);
		});

		it('POST /rooms/create - error due to number_room not being a string', async () => {
			const createRoomDto = {
				number_room: 6,
				room_category: RomsCategory.Insider,
			};

			const response = await request(app.getHttpServer())
				.post('/rooms/create')
				.set('Authorization', `Bearer ${adminUserToken}`)
				.send(createRoomDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(NUMBER_ROOM_STRING);
		});

		it('POST /rooms/create - error due to number_room empty', async () => {
			const createRoomDto = {
				room_category: RomsCategory.Insider,
			};

			const response = await request(app.getHttpServer())
				.post('/rooms/create')
				.set('Authorization', `Bearer ${adminUserToken}`)
				.send(createRoomDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(NUMBER_ROOM_NOT_EMPTY);
		});

		it('GET /rooms/all - success', async () => {
			const response = await request(app.getHttpServer())
				.get('/rooms/all')
				.set('Authorization', `Bearer ${userUserToken}`)
				.expect(200);

			expect(response.body.length).toBeGreaterThanOrEqual(5);
		});

		it('GET /rooms/:id - success', async () => {
			const roomId = createdRoomIds[0];
			const response = await request(app.getHttpServer())
				.get(`/rooms/${roomId}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.expect(200);

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
				.set('Authorization', `Bearer ${adminUserToken}`)
				.send(updateRoomDto)
				.expect(200);

			expect(response.body.number_room).toBe(updateRoomDto.number_room);
			expect(response.body.room_category).toBe(updateRoomDto.room_category);
		});

		it('PATCH /rooms/:id - error due to invalid room_category', async () => {
			const roomId = createdRoomIds[0];
			const updateRoomDto = {
				number_room: '10',
				room_category: 'invalid_category',
			};

			const response = await request(app.getHttpServer())
				.patch(`/rooms/${roomId}`)
				.send(updateRoomDto)
				.set('Authorization', `Bearer ${adminUserToken}`)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(ROOM_CATEGORY_ENUM);
		});

		it('PATCH /rooms/:id - error due to room_category empty', async () => {
			const roomId = createdRoomIds[0];
			const updateRoomDto = {
				number_room: '10',
			};

			const response = await request(app.getHttpServer())
				.patch(`/rooms/${roomId}`)
				.send(updateRoomDto)
				.set('Authorization', `Bearer ${adminUserToken}`)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(ROOM_CATEGORY_NOT_EMPTY);
		});

		it('PATCH /rooms/:id - error due to number_room not being a string', async () => {
			const roomId = createdRoomIds[0];
			const updateRoomDto = {
				number_room: 10,
				room_category: RomsCategory.RockStar,
			};

			const response = await request(app.getHttpServer())
				.patch(`/rooms/${roomId}`)
				.set('Authorization', `Bearer ${adminUserToken}`)
				.send(updateRoomDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(NUMBER_ROOM_STRING);
		});

		it('PATCH /rooms/:id - error due to number_room not empty', async () => {
			const roomId = createdRoomIds[0];
			const updateRoomDto = {
				room_category: RomsCategory.RockStar,
			};

			const response = await request(app.getHttpServer())
				.patch(`/rooms/${roomId}`)
				.set('Authorization', `Bearer ${adminUserToken}`)
				.send(updateRoomDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(NUMBER_ROOM_NOT_EMPTY);
		});

		it('DELETE /rooms/:id - success', async () => {
			const roomId = createdRoomIds.pop();
			await request(app.getHttpServer())
				.delete(`/rooms/${roomId}`)
				.set('Authorization', `Bearer ${adminUserToken}`)
				.expect(204);
		});

		it('GET /rooms/:id - not found', async () => {
			await request(app.getHttpServer())
				.get(`/rooms/${invalid_id}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.expect(404, {
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
				.set('Authorization', `Bearer ${adminUserToken}`)
				.expect(404, {
					statusCode: 404,
					message: ROOM_NOT_FOUND,
				});
		});

		it('DELETE /rooms/:id - not found', async () => {
			await request(app.getHttpServer())
				.delete(`/rooms/${invalid_id}`)
				.set('Authorization', `Bearer ${adminUserToken}`)
				.expect(404, {
					statusCode: 404,
					message: ROOM_NOT_FOUND,
				});
		});

		it('GET /rooms/:id - room not found', async () => {
			await request(app.getHttpServer())
				.get(`/rooms/${nonExistentId}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.expect(404, {
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
				.set('Authorization', `Bearer ${adminUserToken}`)
				.send(updateRoomDto)
				.expect(404, {
					statusCode: 404,
					message: ROOM_NOT_FOUND,
				});
		});

		it('DELETE /rooms/:id - room not found', async () => {
			await request(app.getHttpServer())
				.delete(`/rooms/${nonExistentId}`)
				.set('Authorization', `Bearer ${adminUserToken}`)
				.expect(404, {
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
				.set('Authorization', `Bearer ${userUserToken}`)
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
				.set('Authorization', `Bearer ${userUserToken}`)
				.send(createSheduleDto)
				.expect(404, {
					statusCode: 404,
					message: ROOM_NOT_FOUND,
				});
		});

		it('POST /schedule/create - error due to invalid time format', async () => {
			const createSheduleDto = {
				time: 'invalid-date',
				status: 'reserved',
				roomId: createdRoomIds[0],
			};

			const response = await request(app.getHttpServer())
				.post('/schedule/create')
				.set('Authorization', `Bearer ${userUserToken}`)
				.send(createSheduleDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(TIME_DATE_STRING);
		});

		it('POST /schedule/create - error due to empty time', async () => {
			const createSheduleDto = {
				status: 'reserved',
				roomId: createdRoomIds[0],
			};

			const response = await request(app.getHttpServer())
				.post('/schedule/create')
				.set('Authorization', `Bearer ${userUserToken}`)
				.send(createSheduleDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(TIME_NOT_EMPTY);
		});

		it('POST /schedule/create - error due to empty status', async () => {
			const createSheduleDto = {
				time: new Date(),
				roomId: createdRoomIds[0],
			};

			const response = await request(app.getHttpServer())
				.post('/schedule/create')
				.set('Authorization', `Bearer ${userUserToken}`)
				.send(createSheduleDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(STATUS_NOT_EMPTY);
		});

		it('POST /schedule/create - error due to status not being a string', async () => {
			const createSheduleDto = {
				time: new Date(),
				status: 123,
				roomId: createdRoomIds[0],
			};

			const response = await request(app.getHttpServer())
				.post('/schedule/create')
				.set('Authorization', `Bearer ${userUserToken}`)
				.send(createSheduleDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(STATUS_STRING);
		});

		it('POST /schedule/create - error due to empty roomId', async () => {
			const createSheduleDto = {
				time: new Date(),
				status: 'reserved',
			};

			const response = await request(app.getHttpServer())
				.post('/schedule/create')
				.set('Authorization', `Bearer ${userUserToken}`)
				.send(createSheduleDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(ROOM_ID_NOT_EMPTY);
		});

		it('POST /schedule/create - error due to roomId not being a string', async () => {
			const createSheduleDto = {
				time: new Date(),
				status: 'reserved',
				roomId: 123,
			};

			const response = await request(app.getHttpServer())
				.post('/schedule/create')
				.set('Authorization', `Bearer ${userUserToken}`)
				.send(createSheduleDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(ROOM_ID_STRING);
		});

		it('GET /schedule/:id - success', async () => {
			const sheduleId = createdSheduleIds[0];
			const response = await request(app.getHttpServer())
				.get(`/schedule/${sheduleId}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.expect(200);

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
				.set('Authorization', `Bearer ${userUserToken}`)
				.expect(200);

			expect(response.body.status).toBe(updateSheduleDto.status);
		});

		it('GET /schedule/:id - not found invalid_id', async () => {
			await request(app.getHttpServer())
				.get(`/schedule/${invalid_id}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.expect(404, {
					statusCode: 404,
					message: SHEDULE_NOT_FOUND,
				});
		});

		it('PATCH /schedule/:id - not found invalid_id', async () => {
			const updateSheduleDto: SheduleDto = {
				time: new Date(),
				status: 'confirmed',
				roomId: createdRoomIds[100],
			};

			await request(app.getHttpServer())
				.patch(`/schedule/${invalid_id}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.send(updateSheduleDto)
				.expect(404, {
					statusCode: 404,
					message: SHEDULE_NOT_FOUND,
				});
		});

		it('PATCH /schedule/:id - error due to invalid time format', async () => {
			const sheduleId = createdSheduleIds[0];
			const updateSheduleDto = {
				time: 'invalid-date',
				status: 'confirmed',
				roomId: createdRoomIds[0],
			};

			const response = await request(app.getHttpServer())
				.patch(`/schedule/${sheduleId}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.send(updateSheduleDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(TIME_DATE_STRING);
		});

		it('PATCH /schedule/:id - error due to empty time', async () => {
			const sheduleId = createdSheduleIds[0];
			const updateSheduleDto = {
				status: 'confirmed',
				roomId: createdRoomIds[0],
			};

			const response = await request(app.getHttpServer())
				.patch(`/schedule/${sheduleId}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.send(updateSheduleDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(TIME_NOT_EMPTY);
		});

		it('PATCH /schedule/:id - error due to empty status', async () => {
			const sheduleId = createdSheduleIds[0];
			const updateSheduleDto = {
				time: new Date().toISOString(),
				roomId: createdRoomIds[0],
			};

			const response = await request(app.getHttpServer())
				.patch(`/schedule/${sheduleId}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.send(updateSheduleDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(STATUS_NOT_EMPTY);
		});

		it('PATCH /schedule/:id - error due to status not being a string', async () => {
			const sheduleId = createdSheduleIds[0];
			const updateSheduleDto = {
				time: new Date().toISOString(),
				status: 123,
				roomId: createdRoomIds[0],
			};

			const response = await request(app.getHttpServer())
				.patch(`/schedule/${sheduleId}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.send(updateSheduleDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(STATUS_STRING);
		});

		it('PATCH /schedule/:id - error due to empty roomId', async () => {
			const sheduleId = createdSheduleIds[0];
			const updateSheduleDto = {
				time: new Date().toISOString(),
				status: 'confirmed',
			};

			const response = await request(app.getHttpServer())
				.patch(`/schedule/${sheduleId}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.send(updateSheduleDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(ROOM_ID_NOT_EMPTY);
		});

		it('PATCH /schedule/:id - error due to roomId not being a string', async () => {
			const sheduleId = createdSheduleIds[0];
			const updateSheduleDto = {
				time: new Date().toISOString(),
				status: 'confirmed',
				roomId: 123,
			};

			const response = await request(app.getHttpServer())
				.patch(`/schedule/${sheduleId}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.send(updateSheduleDto)
				.expect(400);

			expect(response.body).toHaveProperty('statusCode', 400);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message[0]).toContain(ROOM_ID_STRING);
		});

		it('DELETE /schedule/:id - success', async () => {
			const sheduleId = createdSheduleIds.pop();
			await request(app.getHttpServer())
				.delete(`/schedule/${sheduleId}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.expect(204);
		});

		it('DELETE /schedule/:id - not found invalid_id', async () => {
			await request(app.getHttpServer())
				.delete(`/schedule/${invalid_id}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.expect(404, {
					statusCode: 404,
					message: SHEDULE_NOT_FOUND,
				});
		});

		it('GET /schedule/:id - shedule not found nonExistentId', async () => {
			await request(app.getHttpServer())
				.get(`/schedule/${nonExistentId}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.expect(404, {
					statusCode: 404,
					message: SHEDULE_NOT_FOUND,
				});
		});

		it('PATCH /schedule/:id - shedule not found nonExistentId', async () => {
			const updateSheduleDto: SheduleDto = {
				time: new Date(),
				status: 'confirmed',
				roomId: createdRoomIds[0],
			};

			await request(app.getHttpServer())
				.patch(`/schedule/${nonExistentId}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.send(updateSheduleDto)
				.expect(404, {
					statusCode: 404,
					message: SHEDULE_NOT_FOUND,
				});
		});

		it('DELETE /schedule/:id - shedule not found nonExistentId', async () => {
			await request(app.getHttpServer())
				.delete(`/schedule/${nonExistentId}`)
				.set('Authorization', `Bearer ${userUserToken}`)
				.expect(404, {
					statusCode: 404,
					message: SHEDULE_NOT_FOUND,
				});
		});
	});
});
