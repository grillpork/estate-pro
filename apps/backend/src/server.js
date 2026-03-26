import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import swaggerUi from 'swagger-ui-express'
import { storage } from './middleware/upload.js'
import { swaggerDocument } from './docs/swagger.js'
import authRouter from './modules/auth/auth.routes.js'
import { userRouter } from './modules/users/user.routes.js'
import { propertiesRouter } from './modules/Properties/Properties.routes.js'
import { brandsRouter } from './modules/brands/brands.routes.js'
import { landmarkRouter } from './modules/landmarks/landmark.routes.js'
import { conversationsRouter } from './modules/conversations/conversations.routes.js'
import { favoritesRouter } from './modules/favorites/favorites.routes.js'
import { membershipPlansRouter } from './modules/membershipPlans/membershipPlans.routes.js'
import uploadTestRouter from './modules/upload-test.routes.js'

const PORT = 4000

const app = express()
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
}))
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.get('/api-docs.json', (req, res) => {
    res.json(swaggerDocument)
})
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Testing routes
app.use('/', uploadTestRouter)

// Auth routes
app.use('/auth', authRouter)

// User routes
app.use('/api', userRouter)

// Properties routes 
app.use('/', propertiesRouter)

// Brands routes
app.use('/', brandsRouter)

// Landmarks (train stations) routes
app.use('/', landmarkRouter)

// Conversations routes
app.use('/', conversationsRouter)

// Favorites routes
app.use('/', favoritesRouter)

// Membership Plans routes
app.use('/', membershipPlansRouter)

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`)
})