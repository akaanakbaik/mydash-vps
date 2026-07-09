import { eq } from 'drizzle-orm';
import { hash } from 'bcrypt';
import { workspaces, users } from '../schema/workspace.js';
import type { Seed } from './runner.js';

/**
 * Seed that creates the default workspace and admin user.
 * Uses the same bcrypt hashing as the auth password service.
 */
export const initialSeed: Seed = {
  name: 'initial',
  domain: 'system',
  async run(db): Promise<void> {
    const now = new Date();

    // Check if default workspace already exists
    const existingWorkspaces = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.name, 'default'))
      .limit(1);

    if (existingWorkspaces.length > 0) {
      return; // Already seeded
    }

    // Use transaction to ensure atomicity (partial failure recovery)
    await db.transaction(async (tx) => {
      const workspaceId = crypto.randomUUID();
      const adminPassword = process.env['SEED_ADMIN_PASSWORD'] ?? 'admin123';
      const passwordHash = await hash(adminPassword, 12);
      const userId = crypto.randomUUID();

      await tx.insert(workspaces).values({
        id: workspaceId,
        workspaceId: workspaceId,
        name: 'default',
        displayName: 'Default Workspace',
        timezone: 'UTC',
        language: 'en',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        version: 1,
      });

      await tx.insert(users).values({
        id: userId,
        workspaceId: workspaceId,
        email: 'admin@mydash.local',
        passwordHash,
        displayName: 'Administrator',
        role: 'owner',
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
      });
    });
  },
};
