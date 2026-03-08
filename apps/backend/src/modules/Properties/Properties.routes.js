import express from 'express'
import {
    createProperty,
    deleteProperty,
    getAllProperties,
    getMyProperties,
    getPropertyById,
    updateProperty,
} from './Properties.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'

export const propertiesRouter = express.Router()
    .get('/properties', getAllProperties)
    .get('/properties/my', verifyToken, getMyProperties)
    .get('/properties/:id', getPropertyById)
    .post('/properties', verifyToken, createProperty)
    .put('/properties/:id', verifyToken, updateProperty)
    .delete('/properties/:id', verifyToken, deleteProperty)
