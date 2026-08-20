import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../db/drizzle.service';
import { users, roles } from '../db/schema/index.js';

@Injectable()
export class UsersService { 
  constructor(private readonly drizzle: DrizzleService) {}

  async findByEmail(email: string) {
    const result = await this.drizzle.db
      .select({
        user: users,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.email, email))
      .limit(1);

    if (!result[0]) return undefined;

    return {
      ...result[0].user,
      role: result[0].roleName,
    };
  }

  async create(user: typeof users.$inferInsert) {
    const result = await this.drizzle.db
      .insert(users)
      .values(user)
      .returning();
    
    return result[0];
  }
}
