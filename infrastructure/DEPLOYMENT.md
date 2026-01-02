# Phase 1 Infrastructure Deployment Guide

## Overview
This guide covers deploying the Creator Index infrastructure:
- n8n workflow automation (self-hosted)
- PostgreSQL database for n8n
- Supabase backend with CEPI schema
- Google Drive integration

## Prerequisites
- DigitalOcean account (or Hetzner)
- Supabase account
- Google Cloud project with service account
- Domain or IP address for n8n access

## Step 1: Deploy VPS

### DigitalOcean Setup
1. Create new Droplet:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic Shared CPU - $6/month (1GB RAM, 1 vCPU, 25GB SSD)
   - **Region**: San Francisco 3 (closest to PST)
   - **Authentication**: SSH keys recommended

2. Connect to your droplet:
```bash
ssh root@YOUR_DROPLET_IP
```

### Install Docker & Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

## Step 2: Deploy n8n with Docker Compose

### Create Application Directory
```bash
mkdir -p ~/creator-index && cd ~/creator-index
mkdir -p data/n8n data/postgres backups
```

### Create Environment File
```bash
nano .env
```

Add the following (replace with your values):
```env
DOMAIN=your-vps-ip-or-domain
POSTGRES_PASSWORD=strong_password_here
ENCRYPTION_KEY=your_32_character_encryption_key
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=your_secure_n8n_password

# Supabase (add after creating project)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

### Download docker-compose.yml
```bash
wget https://raw.githubusercontent.com/lilhelper-coder/creator-index-dashboard/main/infrastructure/docker-compose.yml
```

### Start Services
```bash
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f n8n
```

### Configure Firewall
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 5678/tcp # n8n
sudo ufw --force enable
```

## Step 3: Initialize Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project:
   - **Project name**: `creator-index-mvp`
   - **Database password**: Save this securely
   - **Region**: Choose closest to your location

2. Wait for project initialization (2-3 minutes)

3. Run the SQL schema:
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `creators_cepi.sql`
   - Execute the query

4. Verify tables created:
   - Go to Table Editor
   - Should see: `creators_cepi`, `data_sources`, `sync_logs`

5. Get API credentials:
   - Go to Project Settings > API
   - Copy `Project URL` and `anon public` key
   - Copy `service_role` key (keep secret!)
   - Add to your `.env` file on VPS

## Step 4: Configure Google Sheets Access

### Create Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: `creator-index-automation`
3. Enable Google Sheets API
4. Create Service Account:
   - **Name**: `n8n-sheets-access`
   - **Role**: Editor
5. Create JSON key and download

### Share Google Sheet
1. Open your Master Data Collection sheet
2. Click Share
3. Add service account email (found in JSON key)
4. Grant Editor access

### Add Credentials to n8n
1. Access n8n: `http://YOUR_DROPLET_IP:5678`
2. Login with basic auth credentials
3. Go to Credentials > New
4. Select "Google Sheets API"
5. Upload service account JSON

## Step 5: Verification Tests

### Test 1: n8n Webhook
```bash
curl -X POST http://YOUR_DROPLET_IP:5678/webhook-test/test
# Should return 404 (webhook not created yet) - this confirms n8n is running
```

### Test 2: Supabase Insert
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/rest/v1/creators_cepi \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{
    "handle": "test_creator_001",
    "full_name": "Test Creator",
    "dimension_identifiers": {"youtube": "UCtest123"},
    "dimension_monetization": {"estimated_revenue": 1000}
  }'
# Should return: 201 Created
```

### Test 3: Database Schema Check
Run in Supabase SQL Editor:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'creators_cepi' 
  AND table_schema = 'public' 
  AND column_name LIKE 'dimension_%';
-- Should return 8 rows with 'jsonb' type
```

### Test 4: Google Sheets Access
1. Create test workflow in n8n
2. Add Google Sheets node
3. Select your credentials
4. Try reading from Master Data Collection
5. Should fetch rows successfully

## Security Checklist

- [ ] Changed all default passwords in `.env`
- [ ] Firewall rules configured (UFW)
- [ ] SSH key authentication enabled
- [ ] Supabase Row Level Security enabled
- [ ] Service account JSON stored securely (not in repo)
- [ ] Regular backups configured (see backup script below)

## Backup Script

Create `~/creator-index/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/home/user/creator-index/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker exec creator-index-postgres-1 pg_dump -U n8n n8n > $BACKUP_DIR/n8n_db_$DATE.sql

# Backup n8n workflows
tar -czf $BACKUP_DIR/n8n_data_$DATE.tar.gz data/n8n/

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and add to crontab:
```bash
chmod +x backup.sh
crontab -e
# Add: 0 2 * * * /home/user/creator-index/backup.sh
```

## Troubleshooting

### n8n won't start
```bash
# Check logs
docker compose logs n8n

# Restart services
docker compose restart

# Reset (WARNING: deletes data)
docker compose down -v
docker compose up -d
```

### Supabase connection fails
- Verify API keys in `.env` match Supabase dashboard
- Check Row Level Security policies
- Ensure IP not blocked by Supabase firewall

### Google Sheets access denied
- Verify service account email is shared on sheet
- Check service account has Editor role
- Ensure Google Sheets API is enabled in Cloud Console

## Next Steps

Once deployment is verified:
1. Notify Perplexity (Research Lead) to begin data scraping
2. Create n8n workflows for:
   - Google Sheets → Supabase sync
   - Scheduled data refreshes
   - Error notifications
3. Set up monitoring and alerts

## Cost Summary
- VPS (DigitalOcean): $6/month
- Supabase: $0 (free tier)
- n8n: $0 (self-hosted)
- **Total**: $6/month ✅

## Support
For issues, check:
- [n8n Documentation](https://docs.n8n.io/)
- [Supabase Documentation](https://supabase.com/docs)
- Creator Index GitHub Issues

---

**Status**: Phase 1 Infrastructure  
**Last Updated**: January 2, 2026  
**Part of**: 24-Hour Sprint - Gemini CIO Directive
