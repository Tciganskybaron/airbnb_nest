import { RomsCategory } from '../type/room-category.enum';
import { IsString, IsEnum, IsDefined, IsArray } from 'class-validator';
import {
	NUMBER_ROOM_NOT_EMPTY,
	NUMBER_ROOM_STRING,
	ROOM_CATEGORY_NOT_EMPTY,
	ROOM_CATEGORY_ENUM,
	IMAGES_ROOM_NOT_EMPTY,
	IMAGES_ROOM_ARRAY,
	IMAGES_ROOM_STRING,
} from '../constant/message';

export class RoomDto {
	@IsArray({ message: IMAGES_ROOM_ARRAY })
	@IsDefined({ message: IMAGES_ROOM_NOT_EMPTY })
	@IsString({ each: true, message: IMAGES_ROOM_STRING })
	images: string[];

	@IsDefined({ message: NUMBER_ROOM_NOT_EMPTY })
	@IsString({ message: NUMBER_ROOM_STRING })
	number_room: string;

	@IsDefined({ message: ROOM_CATEGORY_NOT_EMPTY })
	@IsEnum(RomsCategory, { message: ROOM_CATEGORY_ENUM })
	room_category: RomsCategory;
}
