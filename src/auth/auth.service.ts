import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/model/user.model';
import { UserService } from 'src/user/user.service';
import { INVALID_PASSWORD_ERROR } from './contants/auth.constants';
import { compare } from 'bcryptjs';
import { AuthCreateDto } from './dto/authCreate.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	async createUser(dto: AuthCreateDto): Promise<User> {
		return await this.userService.createUser(dto);
	}

	async validateUser(email: string, password: string): Promise<Pick<User, 'email' | 'role'>> {
		const user = await this.userService.getByEmail(email);

		const isPasswordValid = await compare(password, user.passwordHash);
		if (!isPasswordValid) {
			throw new UnauthorizedException(INVALID_PASSWORD_ERROR);
		}

		return { email: user.email, role: user.role };
	}

	async login(userData: Pick<User, 'email' | 'role'>) {
		const payload = { userData };
		return {
			access_token: await this.jwtService.signAsync(payload),
		};
	}
}
