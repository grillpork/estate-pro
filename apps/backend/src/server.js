import express from 'express'
import {userRouter} from './modules/users/user.routes.js'

const PORT = 4000
const app = express();
app.use(express.json());


app.use('/api', userRouter)

app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} is running`)
});