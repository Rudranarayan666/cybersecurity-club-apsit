"""
Infrastructure security documentation for the Cybersecurity Club project.

This file documents the required cloud infrastructure security setup.
Actual infrastructure is deployed via Terraform or cloud-provider console.
"""

INFRASTRUCTURE_CHECKLIST = """
# Cloud Infrastructure Security Checklist

## 1. VPC / Network Isolation
- [ ] Create dedicated VPC for the application
- [ ] Backend subnet: private (no public IP)
- [ ] Database subnet: private, separate from backend
- [ ] Public subnet: only for load balancer / Nginx

Security Group Rules:
- Load Balancer: inbound 80, 443 from 0.0.0.0/0
- Backend: inbound 8000 from LB security group only
- Database: inbound 5432 from backend security group only

## 2. DDoS Protection
- Enable Cloudflare CDN/Proxy (orange cloud)
- Enable "Under Attack Mode" during incidents
- Configure rate limiting in Cloudflare dashboard:
  - /api/auth/login: 5 req/min per IP
  - /api/registrations: 10 req/min per IP
  - /api/hackathon-teams: 5 req/min per IP

## 3. WAF Rules (Cloudflare)
Enable Cloudflare Managed Ruleset, add custom rules:
  - Block requests with SQL injection patterns in query/body
  - Block requests with XSS patterns
  - Block requests with path traversal patterns (../../../)
  - Country whitelist: India only (if applicable)

## 4. Encrypted Volumes
- Enable EBS encryption (AWS) or Persistent Disk encryption (GCP)
- Use AES-256 provider key
- Verify: aws ec2 describe-volumes | grep Encrypted

## 5. Database Backups
- Enable automated backups (RDS: 7-day retention minimum)
- Encrypt backups with customer-managed key
- Test restore procedure monthly
- Store point-in-time recovery enabled

## 6. Secrets Management
Replace .env with one of:
  - AWS Secrets Manager: aws secretsmanager get-secret-value --secret-id prod/cybersec
  - HashiCorp Vault: vault kv get secret/cybersec
  - GCP Secret Manager: gcloud secrets versions access latest --secret=JWT_SECRET_KEY

## 7. TLS
- Use certificates from Let's Encrypt (free) or ACM (AWS)
- Enforce TLS 1.3 (see nginx.conf)
- HSTS with preload submitted to: https://hstspreload.org

## 8. Monitoring
Recommended free/cheap stack:
  - Logs: Cloudwatch (AWS) or Cloud Logging (GCP) 
  - Metrics: Grafana Cloud free tier
  - Alerts: Grafana Alerting or PagerDuty
  - Uptime: UptimeRobot (free)

## 9. Compliance Notes (GDPR)
- User data stored only what is necessary (PoLP)
- Provide data deletion endpoint for member data upon request
- Data processing agreement with any third-party services
- Data retention: Purge registrations after each academic year
"""
