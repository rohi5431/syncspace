import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()
dotenv.config({ path: '../../.env' })

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('syncspace123', 10)

  // Seed users
  const rohit = await prisma.user.upsert({
    where: { email: 'rohit@northstar.co' },
    update: { passwordHash, isSuspended: false, platformRole: 'USER' },
    create: {
      email: 'rohit@northstar.co',
      name: 'Rohit Kumar',
      initials: 'RK',
      tone: 'slate',
      role: 'OWNER',
      platformRole: 'USER',
      passwordHash,
    },
  })

  const maya = await prisma.user.upsert({
    where: { email: 'maya@northstar.co' },
    update: { passwordHash, isSuspended: false, platformRole: 'ADMIN' },
    create: {
      email: 'maya@northstar.co',
      name: 'Maya Chen',
      initials: 'MC',
      tone: 'indigo',
      role: 'ADMIN',
      platformRole: 'ADMIN',
      passwordHash,
    },
  })

  const jordan = await prisma.user.upsert({
    where: { email: 'jordan@northstar.co' },
    update: { passwordHash, isSuspended: false, platformRole: 'USER' },
    create: {
      email: 'jordan@northstar.co',
      name: 'Jordan Lee',
      initials: 'JL',
      tone: 'emerald',
      role: 'MEMBER',
      platformRole: 'USER',
      passwordHash,
    },
  })

  const aisha = await prisma.user.upsert({
    where: { email: 'aisha@northstar.co' },
    update: { passwordHash, isSuspended: false, platformRole: 'USER' },
    create: {
      email: 'aisha@northstar.co',
      name: 'Aisha Shah',
      initials: 'AS',
      tone: 'amber',
      role: 'MEMBER',
      platformRole: 'USER',
      passwordHash,
    },
  })

  const demoUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'priya@acme-demo.co' },
      update: { passwordHash },
      create: {
        email: 'priya@acme-demo.co',
        name: 'Priya Patel',
        initials: 'PP',
        tone: 'violet',
        role: 'OWNER',
        passwordHash,
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'omar@acme-demo.co' },
      update: { passwordHash },
      create: {
        email: 'omar@acme-demo.co',
        name: 'Omar Hassan',
        initials: 'OH',
        tone: 'blue',
        role: 'MEMBER',
        passwordHash,
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'elena@brightpath-demo.co' },
      update: { passwordHash },
      create: {
        email: 'elena@brightpath-demo.co',
        name: 'Elena Garcia',
        initials: 'EG',
        tone: 'rose',
        role: 'OWNER',
        passwordHash,
        emailVerifiedAt: new Date(),
      },
    }),
  ])

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

  for (const [user, role] of [
    [rohit, 'OWNER'],
    [maya, 'ADMIN'],
    [jordan, 'MEMBER'],
    [aisha, 'MEMBER'],
  ] as const) {
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
      update: { role },
      create: { workspaceId: workspace.id, userId: user.id, role },
    })
  }

  const [priya, omar, elena] = demoUsers
  const acmeWorkspace = await prisma.workspace.upsert({
    where: { slug: 'acme-demo' },
    update: {},
    create: {
      name: 'Acme Demo',
      slug: 'acme-demo',
      ownerId: priya.id,
    },
  })
  const brightPathWorkspace = await prisma.workspace.upsert({
    where: { slug: 'brightpath-demo' },
    update: {},
    create: {
      name: 'BrightPath Demo',
      slug: 'brightpath-demo',
      ownerId: elena.id,
    },
  })

  for (const [workspaceId, userId, role] of [
    [acmeWorkspace.id, priya.id, 'OWNER'],
    [acmeWorkspace.id, omar.id, 'MEMBER'],
    [brightPathWorkspace.id, elena.id, 'OWNER'],
  ] as const) {
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId, userId } },
      update: { role },
      create: { workspaceId, userId, role },
    })
  }

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

  await prisma.project.createMany({
    data: [
      {
        id: 'acme-demo-project',
        workspaceId: acmeWorkspace.id,
        title: 'Customer portal',
        description: 'Demo project for platform administration metrics.',
        progress: 35,
        dueDate: 'Due Dec 15',
        members: JSON.stringify(['PP', 'OH']),
        tone: 'violet',
      },
      {
        id: 'brightpath-demo-project',
        workspaceId: brightPathWorkspace.id,
        title: 'Learning platform',
        description: 'Demo project for organization analytics.',
        progress: 52,
        dueDate: 'Due Dec 20',
        members: JSON.stringify(['EG']),
        tone: 'rose',
      },
    ],
    skipDuplicates: true,
  })

  await prisma.task.createMany({
    data: [
      { id: 'acme-demo-task-1', projectId: 'acme-demo-project', title: 'Review portal requirements', assignedTo: 'Priya Patel', priority: 'HIGH' },
      { id: 'acme-demo-task-2', projectId: 'acme-demo-project', title: 'Create customer dashboard', assignedTo: 'Omar Hassan', priority: 'MEDIUM' },
      { id: 'brightpath-demo-task-1', projectId: 'brightpath-demo-project', title: 'Prepare course catalog', assignedTo: 'Elena Garcia', priority: 'LOW' },
    ],
    skipDuplicates: true,
  })

  // Seed activities
  await prisma.activity.createMany({
    data: [
      {
        id: 'seed-activity-roadmap',
        workspaceId: workspace.id,
        userId: maya.id,
        name: 'Maya Chen',
        initials: 'MC',
        tone: 'indigo',
        action: 'updated',
        target: 'Product roadmap — Q4 2026',
      },
      {
        id: 'seed-activity-task',
        workspaceId: workspace.id,
        userId: jordan.id,
        name: 'Jordan Lee',
        initials: 'JL',
        tone: 'emerald',
        action: 'completed a task in',
        target: 'Website refresh',
      },
      {
        id: 'seed-activity-comment',
        workspaceId: workspace.id,
        userId: aisha.id,
        name: 'Aisha Shah',
        initials: 'AS',
        tone: 'amber',
        action: 'commented on',
        target: 'Launch campaign brief',
      },
    ],
    skipDuplicates: true,
  })

  await prisma.activity.createMany({
    data: [
      {
        id: 'seed-activity-acme',
        workspaceId: acmeWorkspace.id,
        userId: priya.id,
        name: 'Priya Patel',
        initials: 'PP',
        tone: 'violet',
        action: 'created a project',
        target: 'Customer portal',
      },
      {
        id: 'seed-activity-brightpath',
        workspaceId: brightPathWorkspace.id,
        userId: elena.id,
        name: 'Elena Garcia',
        initials: 'EG',
        tone: 'rose',
        action: 'started a project',
        target: 'Learning platform',
      },
    ],
    skipDuplicates: true,
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
