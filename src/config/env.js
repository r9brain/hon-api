import dotenv from 'dotenv';
dotenv.config();

export const SECRET = process.env.JWT_SECRET || 'secret';