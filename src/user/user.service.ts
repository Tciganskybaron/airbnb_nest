import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model } from 'mongoose';
import { User, UserDocument } from './model/user.model';
import { AuthCreateDto } from 'src/auth/dto/authCreate.dto';
import { genSalt, hash } from 'bcryptjs';
import { USER_NOT_FOUND_ERROR, ALREADY_REGISTERED_ERROR } from './contants/user.constants';

@Injectable()
export class UserService {
	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

	async getByEmail(email: string): Promise<User> {
		const user = await this.userModel.findOne({ email }).lean();
		if (!user) {
			throw new UnauthorizedException(USER_NOT_FOUND_ERROR);
		}
		return user;
	}

	async createUser(dto: AuthCreateDto): Promise<User> {
		const existingUser = await this.userModel.findOne({ email: dto.email }).lean();
		if (existingUser) {
			throw new BadRequestException(ALREADY_REGISTERED_ERROR);
		}

		const { password, ...rest } = dto;
		const salt = await genSalt(10);
		const passwordHash = await hash(password, salt);
		const userDto: User = { ...rest, passwordHash };

		const user = new this.userModel(userDto);
		return user.save();
	}

	async deleteUser(dto: Pick<AuthCreateDto, 'email'>): Promise<DeleteResult> {
		const user = await this.getByEmail(dto.email);
		return await this.userModel.deleteOne({ email: user.email });
	}
}
