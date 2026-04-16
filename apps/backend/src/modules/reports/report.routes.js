import express from 'express';
import { createReport } from './report.controller.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

export const reportRouter = express.Router()
    .post('/reports', verifyToken, createReport);
