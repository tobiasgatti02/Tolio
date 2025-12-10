import { prisma } from '../lib/utils';

async function check() {
  console.log('Conectando a la base de datos...');
  const startTime = Date.now();
  
  const services = await prisma.service.findMany({
    select: { id: true, title: true, images: true },
    take: 6
  });
  
  console.log(`Query completada en ${Date.now() - startTime}ms`);
  console.log('Found', services.length, 'services\n');
  
  let totalSize = 0;
  
  services.forEach((s: any) => {
    console.log('---');
    console.log('ID:', s.id);
    console.log('Title:', s.title);
    console.log('Images count:', s.images.length);
    s.images.forEach((img: string, i: number) => {
      const sizeKB = (img.length / 1024).toFixed(2);
      totalSize += img.length;
      console.log(`  Image ${i} - ${sizeKB} KB`);
      console.log(`  Type: ${img.startsWith('data:') ? '⚠️ BASE64' : '✅ URL'}`);
      console.log(`  Preview: ${img.substring(0, 80)}...`);
    });
  });
  
  console.log('\n=============================');
  console.log(`TOTAL DATA SIZE: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`TOTAL DATA SIZE: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  await prisma.$disconnect();
}

check().catch(console.error);
