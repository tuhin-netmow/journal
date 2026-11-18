import mongoose from "mongoose";

// Pre-register all Mongoose schemas so .populate() works seamlessly in Next.js Server Components
import "@/models/User";
import "@/models/Volume";
import "@/models/Issue";
import "@/models/Article";
import "@/models/Manuscript";
import "@/models/EditorialBoard";
import "@/models/JournalSettings";
import "@/models/PageContent";
import "@/models/ContactMessage";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/academic_journal";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
