import { Controller, Post, Get, UseInterceptors, UploadedFile, BadRequestException, UseGuards, Body, Param, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CoursesService } from './courses.service.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('upload')
  @UseGuards(AuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    
    // Check if it is an excel file
    if (!file.originalname.match(/\.(xls|xlsx)$/)) {
      throw new BadRequestException('Only excel files are allowed');
    }

    return this.coursesService.processExcel(file.buffer);
  }

  @Post('bulk')
  @UseGuards(AuthGuard, AdminGuard)
  async uploadBulkJson(@Body('courses') courses: any[]) {
    if (!courses || !Array.isArray(courses)) {
      throw new BadRequestException('Invalid payload. Expected a JSON object with a "courses" array.');
    }
    return this.coursesService.processJSONData(courses);
  }

  @Get()
  async getCourses() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  async getCourse(@Param('id') id: string) {
    const course = await this.coursesService.findOne(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }
}
