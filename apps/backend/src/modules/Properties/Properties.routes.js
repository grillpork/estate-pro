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
    uploadPropertyImages,
    loadPropertyName,
    updateImageById,
    loadPropertyNameByImageId,
} from './Properties.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'
import { requireSubscription } from '../../middleware/requireSubscription.middleware.js'
import { upload, optimizeImage, optimizeImages, setUploadFolder } from '../../middleware/upload.js'

export const propertiesRouter = express.Router()
    .get('/properties', getAllProperties)
    .get('/properties/my', verifyToken, getMyProperties)
    .get('/properties/:id', getPropertyById)
    .post('/properties', verifyToken, requireSubscription, setUploadFolder('property'), upload.any(), optimizeImages, createProperty)
    .put('/properties/:id', verifyToken, updateProperty)
    // สำหรับอัปโหลดรูปภาพ (รองรับทั้งเดียวและหลายรูป)
    .put('/properties/:id/image', verifyToken, setUploadFolder('property'), upload.any(), loadPropertyName, optimizeImages, updatePropertyImage)
    // สำหรับแก้ไขรูปภาพตามไอดี
    .put('/properties/images/:imageId', verifyToken, setUploadFolder('property'), upload.any(), loadPropertyNameByImageId, optimizeImages, updateImageById)
    // สำหรับอัปโหลดหลายรูป
    .post('/properties/:id/images', verifyToken, setUploadFolder('property'), upload.array('images', 10), loadPropertyName, optimizeImages, uploadPropertyImages)
    .delete('/properties/:id', verifyToken, deleteProperty)

