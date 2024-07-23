import type { Express } from 'express'
import express, { Response } from 'express'
import cors from 'cors'
import {auth, checkUserExists, createUser, getUsers} from './services/user'
import * as mongoose from "mongoose"
import dotenv from 'dotenv'
import {createCrud, getCrudItemList, getCrudList} from "./services/crud";

dotenv.config()

const app: Express = express()
const port: number = 3000
app.use(cors({ origin: '*' }))
app.use(express.json())

app.get('/', (_, res: Response): void => {
    res.send({ status: 'OK' })
})

app.get('/auth/login', async (req, res: Response): Promise<void> => {
    try {
        const { email, password } = req.query
        if (!email || !password) {
            throw new Error('Invalid body, email and password are required.')
        }

        const response = await auth({
            email: email as string,
            password: password as string
        })
        res.status(200).send(response)
    } catch (error) {
        const errorMessage = `Error logging in: ${error}`
        console.error(errorMessage)
        res.status(500).send({ error: errorMessage })
    }
})

app.get('/users', async (_, res: Response): Promise<void> => {
    try {
        const response = await getUsers()
        res.status(200).send(response)
    } catch (error) {
        const errorMessage = `Error getting users: ${error}`
        res.status(500).send({ error: errorMessage })
    }
})

app.post('/users', async (req, res: Response): Promise<void> => {
    try {
        if (!req.body.name || !req.body.email || !req.body.password) {
            throw new Error('Invalid body, name, email and password are required.')
        }
        const userAlreadyExists = await checkUserExists(req.body.email)
        if (userAlreadyExists && userAlreadyExists.length) {
            res.status(200).send({ error: 'User already exists.', errorCode: 'user_already_exists' })
            return
        }
        const response = await createUser(req.body)
        console.log(`User created successfully: ${response.name} | ${response?._id}`)
        res.status(201).send(response)
    } catch (error) {
        const errorMessage = `Error creating user: ${error}`
        console.error(errorMessage)
        res.status(400).send({ error: errorMessage, errorCode: 'unexpected_error' })
    }
})

app.post('/cruds', async (req, res: Response): Promise<void> => {
  try {
      if (!req.body?.name || !req.body?.fields) {
          throw new Error('Invalid body, name and fields are required.')
      }
      const response = await createCrud(req.body)
      console.log(`Crud created successfully: ${response.name} | ${response?._id}`)
      res.status(201).send(response)
  } catch (error) {
        const errorMessage = `Error creating crud: ${error}`
        res.status(400).send({ error: errorMessage, errorCode: 'unexpected_error' })
  }
})

app.get('/cruds', async (req, res: Response): Promise<void> => {
    try {
        const { email } = req.query
        if (!email) {
            throw new Error('Invalid body, email is required.')
        }
        const response = await getCrudList(email as string)
        res.status(200).send(response)
    } catch (error) {
        const errorMessage = `Error getting cruds by user email: ${error}`
        console.error(errorMessage)
        res.status(500).send({ error: errorMessage })
    }
})

app.get('/crud/:crudId/list', async (req, res: Response): Promise<void> => {
    try {
        const { crudId } = req.params
        const { search } = req.query
        if (!crudId) {
            throw new Error('Invalid body, id is required.')
        }
        const response = await getCrudItemList(crudId, {
            search: search as string,
            page: 1,
            pageSize: 10
        })
        res.status(200).send(response)
    } catch (error) {
        const errorMessage = `Error getting crud item list by id: ${error}`
        console.error(errorMessage)
        res.status(500).send({ error: errorMessage })
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