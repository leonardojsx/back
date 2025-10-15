import express from "express";
import { router } from "./src/routes/routes.js";
import cors from 'cors'
import 'dotenv/config'

const app = express()
app.use(express.json())

app.use(cors())

app.use(router)

export default app
