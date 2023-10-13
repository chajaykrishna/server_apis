import mongoose from 'mongoose';
import config from '../config';

export default async (): Promise<mongoose.Connection> => {
  const connection = await mongoose.connect(config.databaseURL);
  return connection.connection;
};
