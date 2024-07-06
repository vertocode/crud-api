import type { Express } from 'express'
import express, { Response } from 'express'
import cors from 'cors'
import { auth, createUser, getUsers } from './services/user'
import * as mongoose from "mongoose"
import dotenv from 'dotenv'

dotenv.config()

const app: Express = express()
const port: number = 3000
app.use(cors({ origin: '*' }))
app.use(express.json())

app.get('/', (_, res: Response): void => {
    res.send({ status: 'OK' })
})

app.get('/auth', async (req, res: Response): Promise<void> => {
    try {
        if (!req.body.email || !req.body.password) {
            throw new Error('Invalid body, email and password are required.')
        }

        const response = await auth(req.body)
        if (response.length) {
            res.status(200).send(response)
        } else {
            res.status(404).send({ error: 'User not found' })
        }
    } catch (error) {
        console.error(`Error logging in: ${error}`)
        res.status(500).send({ error })
    }
})

app.get('/users', async (_, res: Response): Promise<void> => {
    try {
        const response = await getUsers()
        res.status(200).send(response)
    } catch (error) {
        console.error(`Error getting users: ${error}`)
        res.status(500).send({ error })
    }
})

app.post('/users', async (req, res: Response): Promise<void> => {
    try {
        if (!req.body.name || !req.body.email || !req.body.password) {
            throw new Error('Invalid body, name, email and password are required.')
        }
        const response = await createUser(req.body)
        console.log(`User created successfully: ${response.name} | ${response?._id}`)
        res.status(201).send(response)
    } catch (error) {
        console.error(`Error creating user: ${error}`)
        res.status(400).send({ error })
    }
})

const mongoUsername = process.env.MONGO_USERNAME
const mongoPassword = process.env.MONGO_PASSWORD
const mongoAppName = process.env.MONGO_APP_NAME
const mongoURI = `mongodb+srv://${mongoUsername}:${mongoPassword}@cluster0.wioncds.mongodb.net/?retryWrites=true&w=majority&appName=${mongoAppName}`

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err))

app.listen(port, (): void => {
    console.log(`Imports API running on port: ${port}`)
})

module.exports = app