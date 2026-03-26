import express from 'express';

import { deleteUser, getAllUsers, updateUser , getUserById} from './user.controller.js';

export const userRouter = express.Router()
.get('/users',getAllUsers)
.get('/users/:id', getUserById)
.patch('/users/:id', updateUser)
.delete('/users/:id',deleteUser)

