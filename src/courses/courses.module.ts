import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service.js';
import { CoursesController } from './courses.controller.js';
import { DrizzleModule } from '../db/drizzle.module.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DrizzleModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [CoursesService],
  controllers: [CoursesController]
})
export class CoursesModule {}
