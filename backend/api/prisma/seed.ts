import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('syncspace123', 10)

  // Seed users
  const rohit = await prisma.user.upsert({
    where: { email: 'rohit@northstar.co' },
    update: {},
    create: {
      email: 'rohit@northstar.co',
      name: 'Rohit Kumar',
      initials: 'RK',
      tone: 'slate',
      role: 'OWNER',
      passwordHash,
    },
  })

  const maya = await prisma.user.upsert({
    where: { email: 'maya@northstar.co' },
    update: {},
    create: {
      email: 'maya@northstar.co',
      name: 'Maya Chen',
      initials: 'MC',
      tone: 'indigo',
      role: 'ADMIN',
      passwordHash,
    },
  })

  const jordan = await prisma.user.upsert({
    where: { email: 'jordan@northstar.co' },
    update: {},
    create: {
      email: 'jordan@northstar.co',
      name: 'Jordan Lee',
      initials: 'JL',
      tone: 'emerald',
      role: 'MEMBER',
      passwordHash,
    },
  })

  const aisha = await prisma.user.upsert({
    where: { email: 'aisha@northstar.co' },
    update: {},
    create: {
      email: 'aisha@northstar.co',
      name: 'Aisha Shah',
      initials: 'AS',
      tone: 'amber',
      role: 'MEMBER',
      passwordHash,
    },
  })

  // Seed workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'northstar-studio' },
    update: {},
    create: {
      name: 'Northstar Studio',
      slug: 'northstar-studio',
      ownerId: rohit.id,
      members: {
        create: [
          { userId: rohit.id, role: 'OWNER' },
          { userId: maya.id, role: 'ADMIN' },
          { userId: jordan.id, role: 'MEMBER' },
          { userId: aisha.id, role: 'MEMBER' },
        ],
      },
    },
  })

  // Seed documents
  await prisma.document.createMany({
    data: [
      {
        id: 'product-roadmap',
        workspaceId: workspace.id,
        title: 'Product roadmap — Q4 2026',
        category: 'Product strategy',
        content: 'Overview of Q4 2026 product deliverables, objectives, and milestones.',
        authorId: maya.id,
        authorName: 'Maya Chen',
        initials: 'MC',
        tone: 'indigo',
      },
      {
        id: 'launch-brief',
        workspaceId: workspace.id,
        title: 'Launch campaign brief',
        category: 'Marketing',
        content: 'Brief for upcoming SyncSpace general availability campaign.',
        authorId: rohit.id,
        authorName: 'Rohit Kumar',
        initials: 'RK',
        tone: 'emerald',
      },
      {
        id: 'weekly-notes',
        workspaceId: workspace.id,
        title: 'Weekly team notes',
        category: 'Meeting notes',
        content: 'Sprint review, cross-team alignment, and blockers discussed during weekly standup.',
        authorId: jordan.id,
        authorName: 'Jordan Lee',
        initials: 'JL',
        tone: 'amber',
      },
    ],
    skipDuplicates: true,
  })

  // Seed projects
  await prisma.project.createMany({
    data: [
      {
        id: 'website-refresh',
        workspaceId: workspace.id,
        title: 'Website refresh',
        description: 'A clearer story for the next chapter of SyncSpace.',
        progress: 68,
        dueDate: 'Due Nov 18',
        members: JSON.stringify(['MC', 'JL', 'RK']),
        tone: 'indigo',
      },
      {
        id: 'mobile-app',
        workspaceId: workspace.id,
        title: 'Mobile app launch',
        description: 'Bring the team workspace to every screen.',
        progress: 42,
        dueDate: 'Due Dec 02',
        members: JSON.stringify(['AS', 'RK', 'MC']),
        tone: 'emerald',
      },
      {
        id: 'onboarding',
        workspaceId: workspace.id,
        title: 'Customer onboarding',
        description: 'Make the first week feel effortless.',
        progress: 84,
        dueDate: 'Due Nov 12',
        members: JSON.stringify(['JL', 'AS']),
        tone: 'amber',
      },
    ],
    skipDuplicates: true,
  })

  // Seed activities
  await prisma.activity.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId: maya.id,
        name: 'Maya Chen',
        initials: 'MC',
        tone: 'indigo',
        action: 'updated',
        target: 'Product roadmap — Q4 2026',
      },
      {
        workspaceId: workspace.id,
        userId: jordan.id,
        name: 'Jordan Lee',
        initials: 'JL',
        tone: 'emerald',
        action: 'completed a task in',
        target: 'Website refresh',
      },
      {
        workspaceId: workspace.id,
        userId: aisha.id,
        name: 'Aisha Shah',
        initials: 'AS',
        tone: 'amber',
        action: 'commented on',
        target: 'Launch campaign brief',
      },
    ],
  })

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
