import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from './schedule/schedule.module';
import { RoomsModule } from './rooms/rooms.module';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from 'src/configs/mongo.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';

@Module({
	imports: [
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoConfig,
		}),
		ConfigModule.forRoot(),
		ScheduleModule,
		RoomsModule,
		UserModule,
		AuthModule,
		FilesModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
