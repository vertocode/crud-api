import User from '../models/User'
import { AuthParams, User as UserType } from '../types/User'
import {uuid} from "uuidv4";

export async function getUsers() {
    return User.find()
}

export async function createUser(data: UserType) {
    return User.create(data)
}

function generateToken() {
    return uuid()
}

export async function auth(data: AuthParams): Promise<UserType | { error: string }> {
    const filters = {
        email: { $eq: data.email },
        password: { $eq: data.password }
    }
    const response = await User.find(filters)
    if (response.length) {
        const { _id, name, email, password, createdAt } = response.at(0) as unknown as UserType
        return {
            _id,
            name,
            email,
            password,
            createdAt,
            activeToken: generateToken(),
            activeTokenExpires: new Date(Date.now() + 86400000)
        }
    } else {
        return { error: 'User not found' }
    }
}