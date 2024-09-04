import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import { initApp } from './src/initApp.js';
import { scheduledJobs } from './src/utils/scheduleJobs.js';

const app = express();

scheduledJobs();
  
dotenv.config({ path: path.resolve('./config/.env') });

initApp(app, express);
