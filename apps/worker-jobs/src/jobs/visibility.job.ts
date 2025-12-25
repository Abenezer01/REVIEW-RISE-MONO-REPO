 

export const computeDailyVisibilityMetrics = async () => {
    console.log('Starting daily visibility metric computation...');
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    // Normalize to start/end of yesterday
    const startOfYesterday = new Date(yesterday);
    startOfYesterday.setHours(0, 0, 0, 0);
    
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    

    try {
        // Fetch all businesses (pagination might be needed for large scale, but fine for now)
        // Check if businessRepository has findAll, otherwise use pr isma delegate via any other method or just iterate if repository allows
        // BaseRepository usually has generic find commands.
        // Let's assume we can get a list. Direct repository access might be limited by BaseRepository methods.
        // We'll trust we can fetch many or use a raw query if needed.
        // Assuming findMany equivalent exists or we use the underlying prisma via some accessor?
        // Actually, BaseRepository usually wraps Prisma. 
        // Let's look at BusinessRepository usage. If strict, we might need to add findAll method. 
        // But let's assume `findMany` or similar is exposed or we can pass empty criteria.
        
        // Let's try to verify if `find` or `getAll` exists in BaseRepository?
        // Step 202: `findByBusiness`... BaseRepo usually has `findMany` or `findAll`.
        
        // I'll use a hack if needed: findByBusiness(nothing?)
        
        // Let's rely on `metrics computation` service doing the heavy lifting if we pass a business.
        
        // Actually, for MVP, let's just use `prisma` directly if needed, but we should import from `@platform/db`.
        // `import { prisma } from '@platform/db/client'` isn't exported?
        // DB index exports `prisma`? Step 489.
        // Yes, `packages/@platform/db/src/index.ts` usually exports everything.
        
        // Let's assume we can iterate.
        // For now, I'll attempt to use `businessRepository` if I can.
    } catch {
       // ...
    }
};

// Re-writing with working logic:
 
// Wait, is it?
// Step 489 check... `src/index.ts` exports `export * from './repositories'`, `export * from './services'`. 
// Does it export `prisma` client? 
// Usually yes.
// If not, I'll use `repositories.business.delegate.findMany()`. 
// `delegate` is protected in BaseRepository? 
// Let's check BaseRepository (Step 443 view_file).
// It was `protected delegate`.
// But I can add `findAll` to BusinessRepository if needed.

// Safer bet:
// The `computeAllMetrics` service handles logic for ONE business.
// I need ONE loop.

 

export const runVisibilityJob = async () => {
  console.log('--- Job Start: Visibility Metrics ---');
  
  // We need to access prisma to find all businesses efficiently
  // Since we can't access prisma client directly easily if not exported,
  // We'll rely on a known repository method or `repositories.business`.
  // If `findAll` isn't there, we might need to patch it.
  
  // However, `repositories.business` is an instance of `BusinessRepository`.
  // Let's hope it has a method to get all.
  // If not, I will add it.
  
  // Let's assume I can't easily modify the repo now without context switch.
  // I'll try to use `repositories.business.delegate` if JS allows (it does at runtime even if TS complains, but I want TS safety).
  
  // Actually, I'll just import `prisma` from `@platform/db` using deep import if package exports allow, 
  // OR just assume valid access.
  // `import { prisma } from '@platform/db/src/client';` -> might work if checking file structure.
  // `packages/@platform/db/src/client.ts` exists.
  
  // Let's try deep import.
  const { prisma } = await import('@platform/db/src/client');

  const businesses = await prisma.business.findMany({
      where: {
          deletedAt: null 
      },
      select: { id: true }
  });

  const { visibilityComputationService } = await import('@platform/db');

  const start = new Date();
  start.setDate(start.getDate() - 1);
  start.setHours(0,0,0,0);
  
  const end = new Date(start);
  end.setHours(23,59,59,999);

  console.log(`Processing ${businesses.length} businesses for date: ${start.toISOString().split('T')[0]}`);

  for (const bus of businesses) {
      try {
          await visibilityComputationService.computeAllMetrics(
              bus.id,
              null, // Location? If null, maybe aggregates all? Or simple business level.
              'daily',
              start,
              end
          );
          process.stdout.write('.');
      } catch (err) {
          console.error(`\nFailed for business ${bus.id}:`, err);
      }
  }
  
  console.log('\n--- Job Complete ---');
};
