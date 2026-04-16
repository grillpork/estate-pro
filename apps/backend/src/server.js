import 'dotenv/config'
console.log('>>> BACKEND STARTING...');
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import { swaggerDocument } from './docs/swagger.js'
import authRouter from './modules/auth/auth.routes.js'
import { userRouter } from './modules/users/user.routes.js'
import { propertiesRouter } from './modules/Properties/Properties.routes.js'
import { brandsRouter } from './modules/brands/brands.routes.js'
import { landmarkRouter } from './modules/landmarks/landmark.routes.js'
import { conversationsRouter } from './modules/conversations/conversations.routes.js'
import { favoritesRouter } from './modules/favorites/favorites.routes.js'
import { membershipPlansRouter } from './modules/membershipPlans/membershipPlans.routes.js'
import { userSubscriptionsRouter } from './modules/userSubscriptions/userSubscriptions.routes.js'
import uploadTestRouter from './modules/upload-test.routes.js'
import adminRouter from './modules/admin/admin.routes.js'
import { reportRouter } from './modules/reports/report.routes.js'

const PORT = 4000

const app = express()

// Middleware สำหรับ Log Request แบบละเอียดมาก (Apache style)
app.use(morgan('dev'))

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

// Reports routes
app.use('/', reportRouter)

// Membership Plans routes
app.use('/', membershipPlansRouter)

// User Subscriptions routes
app.use('/', userSubscriptionsRouter)

// Admin routes
app.use('/admin', adminRouter)

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                message: 'Unexpected field name for upload',
                code: err.code,
                foundField: err.field,
                expectedField: 'image'
            })
        }
        return res.status(400).json({ message: `Multer upload error: ${err.message}`, code: err.code })
    }

    console.error('Unhandled error:', err)
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    })
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`)
})