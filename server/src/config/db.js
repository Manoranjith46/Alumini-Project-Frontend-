import mongoose from 'mongoose';

let gfsBucket;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`🛰️  MongoDB Connected: ${conn.connection.host}`);

        gfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
            bucketName: 'uploads',
        });
    } catch (error) {
        console.error(`🛰️  Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export const getGridFSBucket = () => gfsBucket;

export default connectDB;