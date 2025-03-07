# API for SQL Server to TimeScale DB Migration

## 📌 Description

This project is used for take currently SQL Server data and save it into Timescale DB use Node.js. User can migrate historical and realtime data from SQL Server to TimescaleSB, created for save and manage time-series efficiently. Moreover, user can create snapshot in SQL Server use this project.

For the migration, this API have 3 features below.

1. Buffer using Kafka
2. Realtime streaming using Websocket
3. Request - response backend

## 🚀 Tech in Project

- **Node.js** (Backend)
- **Express.js** (Framework API)
- **mssql** (Koneksi ke SQL Server)
- **pg (node-postgres)** (Koneksi ke TimescaleDB/PostgreSQL)
- **dotenv** (Manajemen konfigurasi)
- **Kafka** (Event streaming platform)
- **Websocket** (Real-time communication)

---

## 📡 Installation

### Requirements

1. Node Js
2. Docker and Docker Compose
3. SQL Server
4. Postgress with TimescaleDB

### How To Use

1. **Clone repository**

   ```sh
   https://github.com/InitialH14/Api-Sql-Server.git
   cd Api-Sql-Server
   ```

2. **Install dependencies**

   ```sh
   npm install
   ```

3. **Create configuration file `.env`** and fill with this information:

   ```env
   DB_USER=your_sql_user
   DB_PASS=your_sql_password
   DB_HOST=your_sql_host
   DB_NAME=your_sql_database


   DB_USER_TIMESCALE=your_timescale_user
   DB_SERVER_TIMESCALE=your_timescale_host
   DB_NAME_TIMESCALE=your_timescale_database
   DB_PASS_TIMESCALE=your_timescale_password
   ```

4. **Create `docker-compose.yaml` for Kafka and Zooskeeper installation**

   Fill the file with this informastion.

   ```sh
   services:
      zookeeper:
         image: confluentinc/cp-zookeeper:latest
         container_name: zookeeper
         restart: always
         environment:
            ZOOKEEPER_CLIENT_PORT: 2181
            ZOOKEEPER_TICK_TIME: 2000

      kafka:
         image: confluentinc/cp-kafka:latest
         container_name: kafka
         restart: always
         ports:
            - "9092:9092"
         environment:
            KAFKA_BROKER_ID: 1
            KAFKA_ZOOKEEPER_CONNECT: "zookeeper:2181"
            KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT://localhost:9092"
            KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
            KAFKA_DELETE_TOPIC_ENABLE: "true"
         depends_on:
            - zookeeper
   ```

5. **Install Kafka and Zooskeeper**

   Command for install or run Kafka on Docker

   ```sh
   docker-compose up -d
   ```

   Command for stop Kafka on Docker

   ```sh
   docker-compose down
   ```

6. **Run server**
   ```sh
   node server.js [command] [options] argument
   ```

---

## 📌 API Command

### Data Migration

For data migration, user can use command `get`. To use the features, there are options you can choose.

1. `stream` for realtime-streaming.
2. `event` for buffering with Kafka.
3. `request` for request-response as usual.

### Create Snapshot

User can create snapshot use command as simple as `create`.

---

## ✏️ Notes

### Realtime streaming vs Buffering, What's the Different?

This features is functionally same, to get and migrate the realtime data. But there is a different. While realtime streaming migrate data querying and pull data continually, Buffering just querying simmulatenously and save it in Kafka temporarily. So your SQL Server not receive many query and it`s so efficient for big data.

### Stay on Development

I think there are many pieces can develop in the next time. So this project is not end and maybe next i create more features.

---

## 🔗 License

This project use **MIT** License. Free to use for individual and commercial.

---

## 💬 Contact

If any proble let's contact me:
📧 Email: blaxxramadhan@gmail.com
