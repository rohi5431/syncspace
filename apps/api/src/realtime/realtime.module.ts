import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { DatabaseModule } from '../database/database.module'
import { DocumentsModule } from '../documents/documents.module'
import { YjsService } from './collaboration/yjs.service'
import { DocumentPersistenceService } from './persistence/document-persistence.service'
import { PresenceService } from './presence/presence.service'
import { RealtimeGateway } from './realtime.gateway'
import { RealtimeService } from './realtime.service'

@Module({
  imports: [AuthModule, DatabaseModule, DocumentsModule],
  providers: [
    YjsService,
    DocumentPersistenceService,
    PresenceService,
    RealtimeService,
    RealtimeGateway,
  ],
  exports: [RealtimeService],
})
export class RealtimeModule {}
