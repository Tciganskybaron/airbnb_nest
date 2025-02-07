import { Body, Controller, Delete, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/authLogin.dto';
import { AuthCreateDto } from './dto/authCreate.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@UsePipes(new ValidationPipe())
	@Post('register')
	async create(@Body() dto: AuthCreateDto) {
		return this.authService.createUser(dto);
	}

	@Public()
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(@Body() { email, password }: AuthLoginDto) {
		const userData = await this.authService.validateUser(email, password);
		return this.authService.login(userData);
	}

	@Public()
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Delete()
	async delete(@Body() { email, password }: AuthLoginDto) {
		await this.authService.validateUser(email, password);
		return this.authService.deleteUser({ email });
	}
}
