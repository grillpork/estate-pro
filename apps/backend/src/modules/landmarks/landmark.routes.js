import { Router } from 'express'
import { getNearbyLandmarks, getAllLandmarks } from './landmark.controller.js'

export const landmarkRouter = Router()

// GET /landmarks?type=MRT|BTS
landmarkRouter.get('/landmarks', getAllLandmarks)

// GET /landmarks/nearby?lat=13.74&lng=100.55&radius=1000&type=MRT
landmarkRouter.get('/landmarks/nearby', getNearbyLandmarks)
