# คู่มือการติดตั้งระบบ Student Affairs Asset Management Platform (ด้วย Docker)

ไฟล์ในโฟลเดอร์นี้เตรียมไว้สำหรับการนำระบบไปติดตั้งบน Server (Production) ที่มี Docker และ Docker Compose รันอยู่เรียบร้อยแล้วครับ

## 📌 สิ่งที่ต้องมีบน Server
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (สำหรับ Docker เวอร์ชันใหม่ๆ จะมาพร้อมกันในคำสั่ง `docker compose`)

---

## 🚀 ขั้นตอนการติดตั้ง

1. **นำโฟลเดอร์ `DOCKER-NEW` ทั้งหมดนี้ไปวางบน Server** 
   คุณสามารถเปลี่ยนชื่อโฟลเดอร์ได้ตามต้องการ เช่น เปลี่ยนเป็น `asset-management-system`

2. **(ตัวเลือกเสริม) แก้ไขรหัสผ่านในไฟล์ `.env`**
   ในโฟลเดอร์นี้มีไฟล์ `.env` ซ่อนอยู่ คุณสามารถเปิดไฟล์นี้เพื่อเปลี่ยนรหัสผ่านฐานข้อมูล (Database) และ `SESSION_SECRET` เพิ่มเติมเพื่อความปลอดภัยสูงสุดได้

3. **สั่งรันระบบ (Build & Start)**
   เปิด Terminal และเข้าไปยังโฟลเดอร์ที่คุณนำไปวางไว้ แล้วใช้คำสั่งนี้:
   ```bash
   docker-compose up -d --build
   ```
   *ระบบจะทำการดาวน์โหลด MySQL และทำการ Build Node.js Image ซึ่งอาจใช้เวลาสักครู่*

4. **ตั้งค่าฐานข้อมูลครั้งแรก (Setup & Seed Data)**
   เมื่อรัน Container สำเร็จแล้ว ให้ใช้คำสั่งนี้เพื่อสร้างตารางและสร้างบัญชีแอดมินเบื้องต้น:
   ```bash
   docker exec -it asset-mgmt-app node setup.js
   ```

5. **เพิ่มคอลัมน์สำหรับการลบแบบกู้คืนได้ (Soft Delete Migration)**
   เพื่อให้ระบบฐานข้อมูลอัปเดตฟังก์ชัน "กู้คืนผู้ใช้" ให้รันสคริปต์นี้เพิ่มเติมครับ:
   ```bash
   docker exec -it asset-mgmt-app node update_db.js
   ```

---

## ✅ การเข้าใช้งาน
เมื่อเสร็จสิ้นทุกขั้นตอนแล้ว คุณสามารถเข้าใช้งานระบบได้ที่เบราว์เซอร์ผ่าน IP ของ Server บน Port 80 (หรือ Domain ที่คุณชี้ไว้)

**บัญชีเริ่มต้น (Default Admin):**
- **Username:** `admin`
- **Password:** `admin123`
*(กรุณาเปลี่ยนรหัสผ่านทันทีหลังจากการเข้าสู่ระบบครั้งแรก)*

---

## 🛠 คำสั่งที่มีประโยชน์ (ใช้งานในโฟลเดอร์ระบบ)
- **ปิดระบบ:** `docker-compose down`
- **ดู Logs ของ App:** `docker logs asset-mgmt-app --tail 50 -f`
- **ดู Logs ของ Database:** `docker logs asset-mgmt-db --tail 50 -f`
- **Restart ระบบแค่ App:** `docker-compose restart app`
