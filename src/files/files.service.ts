import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { path } from 'app-root-path';
import { ensureDir, writeFile } from 'fs-extra';
import { FileElementResponse } from './dto/file-element.response';
import * as sharp from 'sharp';
import { MFile } from './mfile.class';

@Injectable()
export class FilesService {
	async saveFiles(files: MFile[]): Promise<FileElementResponse[]> {
		if (!files || files.length === 0) {
			throw new Error('Файлы не загружены');
		}

		const dateFolder = format(new Date(), 'yyyy-MM-dd');
		const uploadFolder = `${path}/uploads/${dateFolder}`;
		await ensureDir(uploadFolder);

		const res: FileElementResponse[] = [];
		for (const file of files) {
			console.log('file:', file);
			await writeFile(`${uploadFolder}/${file.originalname}`, file.buffer);
			res.push({
				url: `${dateFolder}/${file.originalname}`,
				name: file.originalname,
			});
		}

		return res;
	}

	async convertToWebP(file: Buffer): Promise<Buffer> {
		return sharp(file).webp().toBuffer();
	}

	async resizeImage(file: Buffer, width: number): Promise<Buffer> {
		return sharp(file)
			.resize({ width, withoutEnlargement: true }) // Сохраняем пропорции, не увеличиваем
			.toBuffer();
	}
}
