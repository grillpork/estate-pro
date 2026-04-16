import express from 'express'
import {
    createFavorite,
    deleteFavorite,
    getAllFavorites,
    getFavoriteById,
    getMyFavorites,
    toggleFavorite
} from './favorites.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'

export const favoritesRouter = express.Router()
    .get('/favorites', getAllFavorites)
    .get('/favorites/my', verifyToken, getMyFavorites)
    .get('/favorites/:id', getFavoriteById)
    .post('/favorites', verifyToken, createFavorite)
    .post('/favorites/toggle', verifyToken, toggleFavorite)
    .delete('/favorites/:id', verifyToken, deleteFavorite)
