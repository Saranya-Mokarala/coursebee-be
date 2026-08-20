import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { roles, permissions, rolePermissions } from './src/db/schema/index';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config();

async function seedRolesAndPermissions() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    console.log('Seeding permissions...');
    const insertedPermissions = await db.insert(permissions).values([
      { name: 'courses:read', description: 'Can view courses' },
      { name: 'courses:create', description: 'Can create new courses' },
      { name: 'courses:update', description: 'Can edit courses' },
      { name: 'courses:delete', description: 'Can delete courses' },
      { name: 'users:manage', description: 'Can manage users' },
    ]).onConflictDoNothing().returning();

    console.log('Seeding roles...');
    const [adminRole] = await db.insert(roles).values([
      { name: 'admin', description: 'Administrator' }
    ]).onConflictDoNothing().returning();

    const [instructorRole] = await db.insert(roles).values([
      { name: 'instructor', description: 'Course instructor' }
    ]).onConflictDoNothing().returning();

    const [studentRole] = await db.insert(roles).values([
      { name: 'student', description: 'Standard student user' }
    ]).onConflictDoNothing().returning();

    console.log('Linking roles and permissions...');
    
    // In a real scenario you would query to get exact permission IDs, 
    // but here we just map the ones we inserted, assuming this is a fresh database.
    // If running on an existing DB where nothing was returned, you'd need a select query.
    const allPermissions = await db.select().from(permissions);
    
    const adminRoleId = adminRole ? adminRole.id : (await db.select().from(roles).where(eq(roles.name, 'admin')))[0]?.id;
    
    if (adminRoleId && allPermissions.length > 0) {
      const adminLinks = allPermissions.map(p => ({
        roleId: adminRoleId,
        permissionId: p.id,
      }));
      
      for (const link of adminLinks) {
        await db.insert(rolePermissions).values(link).onConflictDoNothing();
      }
    }

    console.log("Roles and permissions seeded successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await pool.end();
  }
}

seedRolesAndPermissions();
