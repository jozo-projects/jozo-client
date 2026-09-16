import { MongoClient } from "mongodb";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

const host = process.env.VPS_IP || "127.0.0.1";
const port = process.env.VPS_PORT || "27017";
const dbName = process.env.DB_NAME || "jozo";
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const authSource = process.env.VPS_AUTH_SOURCE || "admin";

const uri =
  user && password
    ? `mongodb://${user}:${password}@${host}:${port}/${dbName}?authSource=${authSource}`
    : `mongodb://${host}:${port}/${dbName}`;

if (!host || !port || !dbName) {
  throw new Error("Please add your MongoDB config to .env");
}

if (process.env.NODE_ENV === "development") {
  // Caching client in development
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // Always create a new client in production
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

/**
 * Kiểm tra trạng thái kết nối MongoDB
 */
export async function checkMongoConnection() {
  try {
    const client = await clientPromise;
    await client.db("admin").command({ ping: 1 });
    return true; // Kết nối thành công
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    return false; // Kết nối thất bại
  }
}

export default clientPromise;

export const getDatabaseName = () => process.env.DB_NAME || "jozo";

if (process.env.NODE_ENV === "development") {
  ensureIndexes().catch(console.error);
}

export async function ensureIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("jozo");
    const collection = db.collection("users");

    await collection.createIndex(
      { phone_number: 1 },
      {
        unique: true,
        partialFilterExpression: { phone_number: { $type: "string" } },
      },
    );

    await collection.createIndex(
      { email: 1 },
      { unique: true, sparse: true }, // sparse: true cho phép null
    );
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
}
