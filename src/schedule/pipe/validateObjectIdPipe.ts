import { PipeTransform, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { SHEDULE_NOT_FOUND } from '../constant/message';

@Injectable()
export class ValidateObjectIdPipe implements PipeTransform<string> {
	transform(value: string): string {
		if (!isValidObjectId(value)) {
			throw new HttpException(SHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
		}
		return value;
	}
}
