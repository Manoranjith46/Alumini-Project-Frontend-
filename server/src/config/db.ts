import mongoose from 'mongoose';
import dns from 'node:dns';

let gfsBucket: mongoose.mongo.GridFSBucket | undefined;

const configureMongoSrvDns = (mongoUri: string | undefined): void => {
    if (!mongoUri?.startsWith('mongodb+srv://')) {
        return;
    }

    const dnsServers = (process.env.MONGO_DNS_SERVERS || '8.8.8.8,1.1.1.1')
        .split(',')
        .map((server) => server.trim())
        .filter(Boolean);

    if (dnsServers.length > 0) {
        dns.setServers(dnsServers);
    }
};

const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGO_URI?.trim();

        configureMongoSrvDns(mongoUri);

        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        const conn = await mongoose.connect(mongoUri);
        console.log(`🛰️  MongoDB Connected: ${conn.connection.host}`);

        gfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
            bucketName: 'uploads',
        });
    } catch (error) {
        console.error(`🛰️  Database Connection Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
};

export const getGridFSBucket = (): mongoose.mongo.GridFSBucket | undefined => gfsBucket;

export default connectDB;
