# คู่มือติดตั้ง Student Affairs Asset Management Platform

## สิ่งที่ต้องติดตั้งบน Server ก่อน

- **Docker** (version 20.x ขึ้นไป)
- **Docker Compose** (version 2.x ขึ้นไป)
- **Git** (สำหรับ clone โปรเจค)

## ขั้นตอนการติดตั้ง

### 1. Clone โปรเจค
```bash
git clone https://github.com/outlet007/Student-Affairs-Asset-Management-Platform.git
cd Student-Affairs-Asset-Management-Platform
```

### 2. ตั้งค่า Environment Variables
```bash
cp .env.example .env
nano .env   # หรือ vi .env
```

**ค่าที่ต้องเปลี่ยนใน `.env`:**
| ตัวแปร | คำอธิบาย | ตัวอย่าง |
|--------|-----------|---------|
| `DB_PASSWORD` | รหัสผ่าน database user | `MyStr0ngP@ss!` |
| `DB_ROOT_PASSWORD` | รหัสผ่าน root MySQL | `MyR00tP@ss!` |
| `SESSION_SECRET` | Secret key สำหรับ session (≥32 ตัวอักษร) | `AbCdEf1234567890XyZrAnDoMsTrInG` |
| `APP_PORT` | Port ที่เปิดให้เข้าถึง (default: 8021) | `8021` |

### 3. รัน Docker Compose (Build + Start)
```bash
docker compose up -d --build
```

> ⏳ รอประมาณ 1–2 นาที ให้ MySQL พร้อมใช้งาน

### 4. สร้างข้อมูลเริ่มต้น (Seed)
```bash
docker compose exec app node seeders/seed.js
```

ระบบจะสร้าง:
- **User admin**: `admin` / `admin1234`
- **หมวดหมู่เริ่มต้น** 5 หมวด

> ⚠️ **แนะนำ**: เปลี่ยน password admin หลังจาก login ครั้งแรก

### 5. เข้าใช้งาน
```
http://<server-ip>:8021
```

---

## คำสั่งที่ใช้บ่อย

| คำสั่ง | ความหมาย |
|--------|---------|
| `docker compose up -d` | เริ่ม services ทั้งหมด |
| `docker compose down` | หยุด services |
| `docker compose logs -f app` | ดู log ของ application |
| `docker compose logs -f db` | ดู log ของ database |
| `docker compose restart app` | restart เฉพาะ app |
| `docker compose ps` | ดูสถานะ containers |

---

## การ Backup ข้อมูล

### Backup Database
```bash
docker compose exec db mysqldump -u root -p${DB_ROOT_PASSWORD} asset_management > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
docker compose exec -T db mysql -u root -p${DB_ROOT_PASSWORD} asset_management < backup_YYYYMMDD.sql
```

---

## การอัปเดตระบบ

```bash
git pull origin main
docker compose up -d --build
```

---

## โครงสร้าง Containers

| Container | Port (internal) | Port (external) | ใช้สำหรับ |
|-----------|----------------|----------------|---------|
| `asset-mgmt-app` | 3000 | 8021 | Node.js Application |
| `asset-mgmt-db` | 3306 | 3036 | MySQL Database |

## Account เริ่มต้น

| ชื่อ | Username | Password |
|------|----------|----------|
| ผู้ดูแลระบบ | `admin` | `admin1234` |

> ⚠️ **เปลี่ยน password ทันทีหลังติดตั้ง!**
