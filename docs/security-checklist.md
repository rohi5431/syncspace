# Security checklist

- Store JWT secrets, database URLs, SSH keys, and registry credentials in GitHub/Vercel secret stores.
- Keep only public `NEXT_PUBLIC_*` configuration in the browser bundle.
- Require protected environments and review approvals for production.
- Review dependency, CodeQL, Gitleaks, and Trivy reports before release.
- Rotate refresh-token signing secrets and deployment keys on a documented schedule.
- Use additive migrations and preserve backups before destructive changes.
