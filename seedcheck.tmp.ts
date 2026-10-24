import { demoProjects } from './src/domain/seed';
for (const p of demoProjects()) console.log(p.name.padEnd(16), p.score, p.recommendedPath);
