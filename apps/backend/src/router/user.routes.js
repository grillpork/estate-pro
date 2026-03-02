import jwt from 'jsonwebtoken';
import { Router } from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../database/schema/index.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET

const userRouter = Router();

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

//create new user
userRouter.post('/register', async (req, res) => {
    let { name, age, email, password } = req.body;
    //validate
    if (
        name === undefined ||
        age === undefined ||
        email === undefined ||
        password === undefined ||
        name.trim() === "" ||

        email.trim() === "" ||
        password.trim() === "" ||
        isNaN(Number(age))
    )
        return res.status(400).json({
            message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
        })
    //process
    //set default value
    name = name.trim();
    email = email.trim();
    password = password.trim();
    age = Number(age);

    async function createUser(name, age, email, password) {
        //hash pass
        const hashPassword = await bcrypt.hash(password, 10);
        //insert 2 db
        const rows = await db.insert(schema.users).values({
            name,
            age,
            email,
            password: hashPassword
        });
        return rows;
    }

    const rows = await createUser(name, age, email, password)

    return res.json(rows);
})

export default userRouter;