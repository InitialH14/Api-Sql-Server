# API untuk Migrasi Data dari SQL Server ke TimescaleDB

## 📌 Deskripsi

API ini digunakan untuk mengambil data realtime dari SQL Server dan menyimpannya ke dalam TimescaleDB menggunakan Node.js. API ini memungkinkan migrasi data historis maupun real-time dari SQL Server ke TimescaleDB, yang dirancang untuk menyimpan dan mengelola data time-series dengan efisien. Selain itu, API ini juga dapat digunakan untuk membuat snapshot di SQL Server.

Untuk migrasi data dari SQL Server ke TimescaleDB, API ini memiliki 3 mode berikut.

1. Buffer menggunakan Kafka
2. Realtime streaming menggunakan Websocket
3. Request - Response

## 🚀 Teknologi yang Digunakan

- **Node.js** (Backend)
- **Express.js** (Framework API)
- **mssql** (Koneksi ke SQL Server)
- **pg (node-postgres)** (Koneksi ke TimescaleDB/PostgreSQL)
- **dotenv** (Manajemen konfigurasi)
- **Kafka** (Event streaming platform)
- **Websocket** (Real-time communication)

---

## 📡 Instalasi

1. **Clone repository**

   ```sh
   https://github.com/InitialH14/Api-Sql-Server.git
   cd Api-Sql-Server
   ```

2. **Install dependencies**

   ```sh
   npm install
   ```

3. **Buat file konfigurasi `.env`** dan isi dengan informasi koneksi database:

   ```env
   SQL_SERVER_USER=your_sql_user
   SQL_SERVER_PASSWORD=your_sql_password
   SQL_SERVER_HOST=your_sql_host
   SQL_SERVER_DATABASE=your_sql_database


   DB_USER_TIMESCALE=your_timescale_user
   DB_SERVER_TIMESCALE=your_timescale_host
   DB_NAME_TIMESCALE=your_timescale_database
   DB_PASS_TIMESCALE=your_timescale_password
   ```

4. **Install dan Jalankan Kafka dengan Docker (Untuk Mode Buffer menggunakan Kafka)**

   Coming Soon

5. **Jalankan server**
   ```sh
   node server.js [command] [options] argument
   ```

---

## 📌 API Command

Comming Soon

---

## ⚡ Struktur Proyek

Coming Soon

---

## 🔗 Lisensi

Proyek ini menggunakan lisensi **MIT**. Bebas digunakan untuk keperluan pribadi maupun komersial.

---

## 💬 Kontak

Jika ada pertanyaan atau masalah, silakan hubungi:
📧 Email: blaxxramadhan@gmail.com
