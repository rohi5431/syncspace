import { Injectable } from '@nestjs/common'
import type WebSocket from 'ws'

const CURSOR_COLORS = ['#635BDB', '#D946A6', '#168BA7', '#13835F', '#C47A16', '#CC4654'] as const

export interface RealtimeIdentity {
  id: string
  name: string
  avatarUrl: string | null
  color: string
}

export interface RealtimePresenceUser extends RealtimeIdentity {
  isOnline: true
  lastActiveAt: string
  connections: number
}

interface PresenceConnection {
  user: RealtimeIdentity
  lastActiveAt: string
}

@Injectable()
export class PresenceService {
  private readonly connections = new Map<string, Map<WebSocket, PresenceConnection>>()

  colorForUser(userId: string): string {
    let hash = 0
    for (const character of userId) hash = (hash * 31 + character.charCodeAt(0)) | 0
    return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length]
  }

  join(documentId: string, socket: WebSocket, identity: Omit<RealtimeIdentity, 'color'>) {
    const members = this.connections.get(documentId) ?? new Map<WebSocket, PresenceConnection>()
    this.connections.set(documentId, members)

    const user = { ...identity, color: this.colorForUser(identity.id) }
    members.set(socket, { user, lastActiveAt: new Date().toISOString() })
    return { user, users: this.list(documentId) }
  }

  touch(documentId: string, socket: WebSocket): void {
    const connection = this.connections.get(documentId)?.get(socket)
    if (connection) connection.lastActiveAt = new Date().toISOString()
  }

  leave(documentId: string, socket: WebSocket): RealtimePresenceUser[] {
    const members = this.connections.get(documentId)
    if (!members) return []

    members.delete(socket)
    if (members.size === 0) this.connections.delete(documentId)
    return this.list(documentId)
  }

  list(documentId: string): RealtimePresenceUser[] {
    const members = this.connections.get(documentId)
    if (!members) return []

    const unique = new Map<string, RealtimePresenceUser>()
    for (const connection of members.values()) {
      const existing = unique.get(connection.user.id)
      if (existing) {
        existing.connections += 1
        if (connection.lastActiveAt > existing.lastActiveAt) existing.lastActiveAt = connection.lastActiveAt
        continue
      }

      unique.set(connection.user.id, {
        ...connection.user,
        isOnline: true,
        lastActiveAt: connection.lastActiveAt,
        connections: 1,
      })
    }

    return [...unique.values()].sort((left, right) => left.name.localeCompare(right.name))
  }
}
