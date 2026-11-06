import { randomBytes } from 'node:crypto'
import { BadRequestException, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

const BCRYPT_ROUNDS = 12

@Injectable()
export class PasswordService {
  private dummyHash?: Promise<string>

  async hash(password: string) {
    this.assertSupportedLength(password)
    return bcrypt.hash(password, BCRYPT_ROUNDS)
  }

  async verify(password: string, passwordHash?: string) {
    if (Buffer.byteLength(password, 'utf8') > 72) return false

    if (passwordHash) return bcrypt.compare(password, passwordHash)

    this.dummyHash ??= bcrypt.hash(randomBytes(32).toString('hex'), BCRYPT_ROUNDS)
    await bcrypt.compare(password, await this.dummyHash)
    return false
  }

  private assertSupportedLength(password: string) {
    if (Buffer.byteLength(password, 'utf8') > 72) {
      throw new BadRequestException('Password must be no more than 72 UTF-8 bytes.')
    }
  }
}
