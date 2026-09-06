import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'schoolmate-super-secret-jwt-key-2026',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./schoolmate.db',
  AI_PROVIDER: process.env.AI_PROVIDER || 'nvidia',
  AI_BASE_URL: process.env.AI_BASE_URL || 'https://integrate.api.nvidia.com/v1',
  AI_MODEL: process.env.AI_MODEL || 'meta/llama-3.3-70b-instruct',
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_TEMPERATURE: parseFloat(process.env.AI_TEMPERATURE || '0.4'),
};
