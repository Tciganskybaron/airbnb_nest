import { IsDefined, IsEmail, IsString } from 'class-validator';

export class AuthLoginDto {
	@IsDefined()
	@IsString()
	@IsEmail()
	email: string;

	@IsDefined()
	@IsString()
	password: string;
}
