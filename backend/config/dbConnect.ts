import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL2,
  ssl: { rejectUnauthorized: false },
});

export const connectToPostgres = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL connected successfully!");
    client.release();
  } catch (err) {
    console.error("❌ PostgreSQL connection error:", err);
  }
};

export default pool;

// import mongoose from "mongoose";

// const dbConnect = async () => {
//   if (mongoose.connection.readyState >= 1) {
//     return;
//   }

//   let DB_URI: string = "";

//   if (process.env.NODE_ENV === "development")
//     DB_URI = process.env.DB_LOCAL_URI!;
//   if (process.env.NODE_ENV === "production") DB_URI = process.env.DB_URI!;

//   await mongoose.connect(DB_URI);
//   console.log("Connected to database!")
// };

// export default dbConnect;

// import { Pool } from 'pg';

// const pool = new Pool({
//   host: process.env.PGHOST,
//   database: process.env.PGDATABASE,
//   user: process.env.PGUSER,
//   password: process.env.PGPASSWORD,
//   port: 5432, // default port for PostgreSQL
//   ssl: {
//     rejectUnauthorized: false, // Required for Neon
//   },
// });

// const dbConnect = async () => {
//   try {
//     const client = await pool.connect();
//     console.log('✅ PostgreSQL connected successfully');
//     client.release(); // release back to pool
//   } catch (err) {
//     console.error('❌ PostgreSQL connection error:', err);
//   }
// };

// export default { dbConnect, pool };
