import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { storage } from './middleware/upload.js'
import authRouter from './modules/auth/auth.routes.js'
import { userRouter } from './modules/users/user.routes.js'

const PORT = 4000

const app = express()
app.use(cors())
app.use(express.json())

const upload = multer({ storage: storage })
app.post('/upload', upload.single('fileupload'), (req, res) => {
    res.send('complete ' + req.file.originalname)
})

// Auth routes
app.use('/auth', authRouter)

// User routes
app.use('/api', userRouter)

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})