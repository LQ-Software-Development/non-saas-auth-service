import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'AUTH_DB_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(process.env.AUTH_DB_URL),
  },
];
