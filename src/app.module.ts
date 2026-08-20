import { Module } from '@nestjs/common';
import { DrizzleModule } from './db/drizzle.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    DrizzleModule,
    AuthModule,
    UsersModule,
    CoursesModule,
  ],
})
export class AppModule {}