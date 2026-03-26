import express from 'express'
import {
    createFavorite,
    deleteFavorite,
    getAllFavorites,
    getFavoriteById,
    updateFavorite,
} from './favorites.controller.js'

export const favoritesRouter = express.Router()
    .get('/favorites', getAllFavorites)
    .get('/favorites/:id', getFavoriteById)
    .post('/favorites', createFavorite)
    .delete('/favorites/:id', deleteFavorite)
