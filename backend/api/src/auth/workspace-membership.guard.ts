import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

interface TenantRequest {
  user?: { id?: string }
  params?: Record<string, string>
  query?: Record<string, string>
  body?: Record<string, unknown>
}

@Injectable()
export class WorkspaceMembershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<TenantRequest>()
    const userId = request.user?.id
    if (!userId) throw new UnauthorizedException('Authentication is required')

    let workspaceId =
      request.body?.workspaceId as string | undefined ??
      request.query?.workspaceId

    const documentId = request.params?.documentId ?? request.params?.id
    if (documentId) {
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
        select: { workspaceId: true },
      })
      if (!document) throw new NotFoundException('Document not found')
      workspaceId = document.workspaceId
    } else if (request.params?.folderId) {
      const folder = await this.prisma.documentFolder.findUnique({
        where: { id: request.params.folderId },
        select: { workspaceId: true },
      })
      if (!folder) throw new NotFoundException('Folder not found')
      workspaceId = folder.workspaceId
    }

    if (!workspaceId) throw new NotFoundException('Workspace not found')

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, workspace: { isSuspended: false } },
      select: { id: true },
    })
    if (!membership) throw new NotFoundException('Workspace not found')
    return true
  }
}
