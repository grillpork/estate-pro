import express from 'express'
import multer from 'multer'
import {
    createProperty,
    deleteProperty,
    getAllProperties,
    getMyProperties,
    getPropertyById,
    updateProperty,
    updatePropertyImage,
} from './Properties.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'
import { storage } from '../../middleware/upload.js'

const upload = multer({ storage })

export const propertiesRouter = express.Router()
    .get('/properties', getAllProperties)
    .get('/properties/my', verifyToken, getMyProperties)
    .get('/properties/:id', getPropertyById)
    .post('/properties', verifyToken, createProperty)
    .put('/properties/:id', verifyToken, updateProperty)
    .put('/properties/:id/image', verifyToken, upload.single('fileupload'), updatePropertyImage)
    .delete('/properties/:id', verifyToken, deleteProperty)
