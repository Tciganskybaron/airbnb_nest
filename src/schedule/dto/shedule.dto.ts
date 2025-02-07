import { IsDateString, IsDefined, IsString } from 'class-validator';
import {
	TIME_NOT_EMPTY,
	TIME_DATE_STRING,
	STATUS_NOT_EMPTY,
	STATUS_STRING,
	ROOM_ID_NOT_EMPTY,
	ROOM_ID_STRING,
} from '../constant/message';

export class SheduleDto {
	@IsDefined({ message: TIME_NOT_EMPTY })
	@IsDateString({}, { message: TIME_DATE_STRING })
	time: Date;

	@IsDefined({ message: STATUS_NOT_EMPTY })
	@IsString({ message: STATUS_STRING })
	status: string;

	@IsDefined({ message: ROOM_ID_NOT_EMPTY })
	@IsString({ message: ROOM_ID_STRING })
	roomId: string;
}
