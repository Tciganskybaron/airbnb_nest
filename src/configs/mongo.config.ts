import { ConfigService } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export const getMongoConfig = async (
	configService: ConfigService,
): Promise<MongooseModuleFactoryOptions> => {
	const uri = configService.get<string>('MONGO_URI');

	return {
		uri,
		retryAttempts: 10,
		retryDelay: 5000,
		connectionFactory: (connection) => {
			mongoose.set('strictQuery', true);
			return connection;
		},
		verboseRetryLog: true,
	};
};
