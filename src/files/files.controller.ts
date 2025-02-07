import { Controller, HttpCode, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileElementResponse } from './dto/file-element.response';
import { FilesService } from './files.service';
import { MFile } from './mfile.class';
import { Roles } from 'src/decorators/user-role.decorator';
import { UserRole } from 'src/user/type/userRole.enum';

@Controller('files')
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Post('upload')
	@HttpCode(200)
	@Roles(UserRole.Admin)
	@UseInterceptors(FilesInterceptor('files', 10)) //ограничиваем 10ю фотографиями
	async uploadFiles(@UploadedFiles() files: Express.Multer.File[]): Promise<FileElementResponse[]> {
		console.log('files', files);
		const saveArray: MFile[] = [];
		for (const file of files) {
			if (file.mimetype.includes('image')) {
				const resizeImagesBuffer = await this.filesService.resizeImage(file.buffer, 500);
				const buffer = await this.filesService.convertToWebP(resizeImagesBuffer);
				saveArray.push(
					new MFile({ originalname: file.originalname, buffer: resizeImagesBuffer }),
					new MFile({ originalname: `${file.originalname.split('.')[0]}.webp`, buffer }),
				);
			}
		}
		return this.filesService.saveFiles(saveArray);
	}
}
