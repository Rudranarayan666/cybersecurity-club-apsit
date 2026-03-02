# GDPR Data Processing & Privacy Compliance
## Cybersecurity Club APSIT — Data Policy Document

---

## 1. Data Controller

**Organization**: Cybersecurity Club, APSIT (Atharva Principal College of Engineering)  
**Contact**: cybersec@apsit.edu.in  
**Purpose**: This document describes how the club collects, processes, and protects personal data for its events and activities.

---

## 2. Data We Collect

### 2.1 Event Registrations (`registrations` table)
| Field | Purpose | Retention |
|---|---|---|
| `operative_name` | Identify attendee | Until event + 1 year |
| `moodle_id` | Verify APSIT student status | Until event + 1 year |
| `event_id` | Link registration to event | Until event + 1 year |
| `timestamp` | Prevent duplicate registrations | Until event + 1 year |

### 2.2 Hackathon Team Registrations (`hackathon_teams` + `team_members`)
| Field | Purpose | Retention |
|---|---|---|
| `name` | Team identification | Until competition + 6 months |
| `email` | Team communication | Until competition + 6 months |
| `moodle_id`, `roll_no` | Student verification | Until competition + 6 months |
| `mobile` | Emergency contact | Until competition + 6 months |
| `division`, `department`, `year` | Eligibility verification | Until competition + 6 months |

### 2.3 Admin Accounts (`users` table)
| Field | Purpose | Retention |
|---|---|---|
| `username`, `password_hash` | Authentication | Duration of employment/role |
| `last_login` | Security monitoring | 1 year |

### 2.4 Audit Logs (`audit_logs` table)
| Field | Purpose | Retention |
|---|---|---|
| `ip_address`, `action`, `timestamp` | Security audit trail | 90 days |

---

## 3. Legal Basis for Processing

All data is processed under the following legal bases:
- **Legitimate Interest**: Event management and student safety
- **Contract**: Participation in club events
- **Legal Obligation**: APSIT institutional requirements

---

## 4. Data Retention Policy

| Data Type | Retention Period | Action After Expiry |
|---|---|---|
| Event registrations | 1 year from event date | Delete from database |
| Hackathon registrations | 6 months from competition | Delete from database |
| Uploaded resources | Until manually deleted by admin | — |
| Audit logs | 90 days | Auto-purge via cron job |
| Admin accounts | Until role ends | Disable + delete after 30 days |

**Implementation**: Add a scheduled task in `docker-compose.yml` to run monthly data purge.

---

## 5. Data Subject Rights

Any registered participant can request:
- **Access**: What data we hold about them
- **Deletion**: Remove their registration data
- **Rectification**: Correct inaccurate data
- **Portability**: Export their data in JSON/CSV

**Contact for requests**: cybersec@apsit.edu.in  
**Response time**: Within 30 days

---

## 6. Data Security Measures

- Passwords hashed with Argon2id (memory-hard, not reversible)
- Transport encryption via TLS 1.3
- Database access over private network only
- Audit logging of all data access
- MFA for admin accounts
- Regular encrypted backups

---

## 7. Data Sharing

Personal data is **never shared** with third parties except:
- APSIT administration (event attendance records — APSIT students only)
- Law enforcement (if legally compelled)

No data is sold, rented, or used for advertising.

---

## 8. Cookies and Tracking

The website uses:
- **CSRF cookie**: Security token, expires in 1 hour, no personal data
- **No analytics cookies**: No Google Analytics or third-party trackers

---

## 9. Implementation Checklist

- [x] Minimal data collection (only what's needed)
- [x] Argon2 password hashing
- [x] TLS 1.3 encryption in transit
- [x] Audit log for all admin actions
- [x] IP addresses stored for security purposes only (90-day retention)
- [ ] Add data deletion endpoint (DELETE /api/registrations/{id})
- [ ] Add monthly auto-purge cron job in docker-compose.yml
- [ ] Add privacy policy page to frontend
- [ ] Display data collection notice on registration forms
