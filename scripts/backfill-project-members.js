const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    select: { id: true, createdBy: true },
  });

  const existing = await prisma.projectMember.findMany({
    select: { projectId: true, userId: true },
  });

  const existingSet = new Set(
    existing.map((member) => `${member.projectId}:${member.userId}`)
  );

  const missing = [];
  for (const project of projects) {
    const key = `${project.id}:${project.createdBy}`;
    if (!existingSet.has(key)) {
      missing.push({ projectId: project.id, userId: project.createdBy });
    }
  }

  if (missing.length === 0) {
    console.log("No missing project members found.");
    return;
  }

  const result = await prisma.projectMember.createMany({
    data: missing,
    skipDuplicates: true,
  });

  console.log(`Added ${result.count} project member(s).`);
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
