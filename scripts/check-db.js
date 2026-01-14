const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const schools = await prisma.school.findMany({ 
    select: { id: true, slug: true, name: true } 
  });
  console.log('Schools:', JSON.stringify(schools, null, 2));
  
  const midrollAds = await prisma.midrollAd.findMany({
    select: { id: true, name: true, isActive: true, schoolId: true, triggerType: true, triggerValue: true }
  });
  console.log('MidrollAds:', JSON.stringify(midrollAds, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
