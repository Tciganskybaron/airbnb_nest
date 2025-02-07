import { ConfigService } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export const getMongoConfig = async (
	configService: ConfigService,
): Promise<MongooseModuleFactoryOptions> => {
	const user = configService.get<string>('MONGO_INITDB_ROOT_USERNAME') || 'admin';
	const pass = configService.get<string>('MONGO_INITDB_ROOT_PASSWORD') || 'admin';
	const host = configService.get<string>('MONGO_HOST') || 'localhost';
	const port = configService.get<string>('MONGO_PORT') || '27017';
	const database = configService.get<string>('MONGO_DATABASE') || 'test';
	const authSource = configService.get<string>('MONGO_AUTH_SOURCE') || 'admin';

	return {
		uri: `mongodb://${user}:${pass}@${host}:${port}/${database}?authSource=${authSource}`,
		retryAttempts: 10,
		retryDelay: 5000,
		connectionFactory: (connection) => {
			mongoose.set('strictQuery', true);
			console.log(`Connection MongooDB established`);
			return connection;
		},
		verboseRetryLog: true,
	};
};
