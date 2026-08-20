import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as xlsx from 'xlsx';
import { DrizzleService } from '../db/drizzle.service.js';
import { courses } from '../db/schema/courses.js';

@Injectable()
export class CoursesService {
  constructor(private dbService: DrizzleService) {}

  async processExcel(buffer: Buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    return this.processJSONData(xlsx.utils.sheet_to_json(worksheet));
  }

  async processJSONData(data: any[]) {
    const mappedCourses = data.map((row: any, index: number) => {
      // Helper to try multiple possible keys (case-insensitive where possible)
      const getVal = (...keys: string[]) => {
        for (const key of keys) {
          if (row[key] !== undefined) return row[key];
        }
        return null;
      };

      const title = getVal('title', 'Title', 'Course Title');
      const generatedCode = `CBE-${Date.now()}-${index}`;
      
      return {
        courseCode: getVal('course_id', 'courseCode', 'Course Code')?.toString() || generatedCode,
        title: title,
        startDate: getVal('start_date', 'Start Date') ? new Date(getVal('start_date', 'Start Date')) : new Date(),
        endDate: getVal('end_date', 'End Date') ? new Date(getVal('end_date', 'End Date')) : new Date(),
        country: getVal('country', 'Country') || 'IN',
        state: getVal('state', 'State'),
        city: getVal('city', 'City'),
        address: getVal('address', 'Address'),
        postalCode: getVal('zip_postal_code', 'postalCode', 'Postal Code')?.toString(),
        email: getVal('email', 'Email'),
        phoneNumber: getVal('phones', 'Phone', 'Phone Number')?.toString(),
        teachers: getVal('teachers', 'Teachers') ? JSON.stringify(getVal('teachers', 'Teachers')) : null,
        courseFees: getVal('course_fee', 'courseFees', 'Course Fees')?.toString(),
        registrationRequired: getVal('registration_required', 'Registration Required') === true || getVal('registration_required', 'Registration Required') === 'Yes',
        onlineEvent: getVal('is_online_event', 'onlineEvent', 'Online Event') === 1 || getVal('is_online_event', 'onlineEvent', 'Online Event') === 'Yes',
        courseLanguages: getVal('course_language', 'Course Language') ? JSON.stringify(getVal('course_language', 'Course Language')) : null,
        courseTimings: getVal('course_timings', 'Course Timings'),
        registrationUrl: getVal('register_url', 'Registration URL'),
        courseUrl: getVal('link', 'Course URL'),
        capacityMax: parseInt(getVal('max_capacity', 'Max Capacity')) || 0,
      };
    }).filter(c => c.title); // only insert rows with a title

    if (mappedCourses.length > 0) {
      await this.dbService.db.insert(courses).values(mappedCourses).onConflictDoNothing();
    }
    
    return {
      message: 'Courses processed successfully',
      count: mappedCourses.length
    };
  }

  async findAll() {
    return this.dbService.db.select().from(courses);
  }

  async findOne(id: string) {
    const result = await this.dbService.db.select().from(courses).where(eq(courses.id, id));
    return result[0] || null;
  }
}
