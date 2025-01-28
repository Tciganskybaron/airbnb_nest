import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt.guard';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	const port = configService.get<number>('PORT', 3000);
	app.setGlobalPrefix('api');

	const reflector = app.get(Reflector); // Получаем Reflector
	const jwtAuthGuard = new JwtAuthGuard(reflector); // Передаем Reflector в Guard

	app.useGlobalGuards(jwtAuthGuard); // Устанавливаем глобальный Guard
	await app.listen(port);
}
bootstrap();
