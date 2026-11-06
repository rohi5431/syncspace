import { PasswordService } from './password.service'

describe('PasswordService', () => {
  const service = new PasswordService()

  it('hashes and verifies passwords with bcrypt', async () => {
    const hash = await service.hash('correct-horse-123')

    expect(hash).not.toBe('correct-horse-123')
    await expect(service.verify('correct-horse-123', hash)).resolves.toBe(true)
    await expect(service.verify('wrong-password', hash)).resolves.toBe(false)
  })
})
