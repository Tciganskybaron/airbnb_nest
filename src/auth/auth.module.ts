import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getJwtConfig } from 'src/configs/jwt.config';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './strategies/jwt.stratagy';

@Module({
	providers: [AuthService, JwtStrategy],
	controllers: [AuthController],
	imports: [
		ConfigModule,
		JwtModule.registerAsync({
			global: true,
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig,
		}),
		PassportModule,
		UserModule,
	],
})
export class AuthModule {}
