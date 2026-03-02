import express from 'express'
import multer from 'multer'
import { storage } from './middleware/upload.js'
import userRouter from './router/user.routes.js'

const PORT = 4000
const HOST ='localhost'

const app = express();
app.use(express.json());

const upload = multer({storage:storage});
app.post('/upload',upload.single('fileupload'),(req,res) => {
    // if(!upload) ไว้ก่อน ลืม
    res.send('complete '+ req.file.originalname);
    
});

app.use('/', userRouter)

app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} is running`)
});