import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { users, roles } from './src/db/schema/index';

dotenv.config();

async function promoteToAdmin() {
  const emailToPromote = process.argv[2];

  if (!emailToPromote) {
    console.error("Please provide an email address. Usage: npx ts-node seed-admin.ts <email>");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    const adminRoles = await db.select().from(roles).where(eq(roles.name, 'admin'));
    if (adminRoles.length === 0) {
      console.error("Admin role not found in the database. Please run seed-roles.ts first.");
      process.exit(1);
    }
    const adminRoleId = adminRoles[0].id;

    const result = await db.update(users)
      .set({ roleId: adminRoleId })
      .where(eq(users.email, emailToPromote))
      .returning();

    if (result.length > 0) {
      console.log(`Successfully promoted ${emailToPromote} to admin!`);
    } else {
      console.log(`User with email ${emailToPromote} not found.`);
    }
  } catch (error) {
    console.error("Error promoting user:", error);
  } finally {
    await pool.end();
  }
}

promoteToAdmin();
