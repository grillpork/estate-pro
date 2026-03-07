import express from 'express';

import { deleteUser, getAllUsers, updateUser , getUserById} from './user.controller.js';

export const userRouter = express.Router()
.get('/users',getAllUsers)
.get('/user/:id', getUserById)
.patch('/user/:id', updateUser)
.delete('/user/:id',deleteUser)

