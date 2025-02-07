import {
	Injectable,
	ExecutionContext,
	UnauthorizedException,
	ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/user/type/userRole.enum';
import { ROLES_KEY } from 'src/decorators/user-role.decorator';
import { INVALID_PERMISSION } from 'src/auth/contants/auth.constants';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	constructor(private reflector: Reflector) {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// Проверяем, является ли маршрут публичным (без аутентификации)
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true; // Если публичный, пропускаем Guard
		}

		// Проверяем валидность токена
		const isAuthorized = (await super.canActivate(context)) as boolean;
		if (!isAuthorized) {
			throw new UnauthorizedException('Invalid token');
		}

		// Проверяем роли (если они указаны)
		const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!requiredRoles) {
			return true; // Если роли не требуются, доступ разрешен
		}

		// Получаем пользователя из запроса
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user) {
			throw new UnauthorizedException('User not found in request');
		}

		// Проверяем, есть ли у пользователя необходимая роль
		if (!requiredRoles.some((role) => user.role === role)) {
			throw new ForbiddenException(INVALID_PERMISSION);
		}

		return true;
	}
}
