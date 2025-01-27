import { IsDefined, IsEmail, IsEnum, IsString } from 'class-validator';
import { UserRole } from 'src/user/type/userRole.enum';

export class AuthCreateDto {
	@IsDefined()
	@IsString()
	@IsEmail()
	email: string;

	@IsDefined()
	@IsString()
	password: string;

	@IsDefined()
	@IsString()
	name: string;

	@IsDefined()
	@IsString()
	telephone: string;

	@IsDefined()
	@IsEnum(UserRole)
	role: UserRole;
}
