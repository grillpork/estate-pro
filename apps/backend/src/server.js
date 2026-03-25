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

const PORT = 4000

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.get('/api-docs.json', (req, res) => {
    res.json(swaggerDocument)
})
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const upload = multer({ storage: storage })
app.post('/upload', upload.single('fileupload'), (req, res) => {
    res.send('complete ' + req.file.originalname)
})

// Auth routes
app.use('/auth', authRouter)

// User routes
app.use('/api', userRouter)

// Properties routes 
app.use('/', propertiesRouter)

// Brands routes
app.use('/', brandsRouter)

// Landmarks (train stations) routes
app.use('/landmarks', landmarkRouter)

// Conversations routes
app.use('/', conversationsRouter)

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`)
})