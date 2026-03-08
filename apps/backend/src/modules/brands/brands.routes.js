import express from 'express'
import {
    createBrand,
    deleteBrand,
    getAllBrands,
    getBrandById,
    updateBrand,
} from './brands.controller.js'

export const brandsRouter = express.Router()
    .get('/brands', getAllBrands)
    .get('/brands/:id', getBrandById)
    .post('/brands', createBrand)
    .put('/brands/:id', updateBrand)
    .delete('/brands/:id', deleteBrand)
