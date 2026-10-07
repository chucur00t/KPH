# DISASTER RECOVERY & BACKUP PLAN
**KPH Public Intelligence System**  
**RTO (Recovery Time Objective):** < 15 minutes  
**RPO (Recovery Point Objective):** < 24 hours  

---

## 1. Automated Snapshot Architecture

- Daily automated backups create full JSON and SQL dump archives of the `/data` directory.
- Each snapshot is stamped with ISO-8601 timestamp and SHA-256 integrity checksum.
- Automated restore tests run immediately after each backup to verify record counts and schema structure.

## 2. Recovery Procedures

### 2.1 Database & Staging Recovery
1. Locate latest verified backup archive with matching SHA-256 hash.
2. Stop active collector workers to prevent conflicting writes.
3. Replace `/data/*.json` or execute `psql -f backup.sql`.
4. Run `BackupService.createAndVerifyBackup()` to confirm integrity.
5. Restart backend service (`npm start` or container restart).

### 2.2 Re-indexing & Worker Recovery
1. Trigger `SchedulerService.triggerJob('SOURCE_HEALTH')` to verify external connectivity.
2. Trigger `SchedulerService.triggerJob('CORRELATION')` to recalculate spatial intersections.
3. Verify System Health page (`/system/readiness`) displays all gates as **PASS**.
