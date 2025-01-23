import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { RoomsService } from 'src/rooms/rooms.service';
import { disconnect } from 'mongoose';

import { RomsCategory } from 'src/rooms/type/room-category.enum';
import { RoomDto } from 'src/rooms/dto/room.dto';
import { ROOM_NOT_FOUND } from 'src/rooms/constant/message';

describe('RoomsController (e2e)', () => {
	let app: INestApplication;
	let roomService: RoomsService;
	const createdRoomIds: string[] = [];
	const nonExistentId: string = '000000000000000000000000';
	const invalid_id: string = '938300dfsdjn9Ljfdlnjkk';

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		roomService = moduleFixture.get<RoomsService>(RoomsService);

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
		for (const id of createdRoomIds) {
			await roomService.deleteOne(id);
		}
		disconnect();
		await app.close();
	});

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
