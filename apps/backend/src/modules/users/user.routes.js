import express from 'express';

import { deleteUser, getAllUsers, updateUser, getUserById, uploadProfileImage } from './user.controller.js';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { upload, optimizeImage, setUploadFolder } from '../../middleware/upload.js';

export const userRouter = express.Router()
    .get('/users', verifyToken, getAllUsers)
    .get('/users/:id', getUserById)
    .patch('/users/:id', verifyToken, updateUser)
    .put('/users/:id', verifyToken, updateUser)
    .put('/users/:id/profile-image', verifyToken, setUploadFolder('user'), upload.any(), optimizeImage, uploadProfileImage)
    .delete('/users/:id', verifyToken, deleteUser)

