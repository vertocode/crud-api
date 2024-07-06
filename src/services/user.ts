import User from '../models/User'
import { AuthParams, User as UserType } from '../types/User'

export async function getUsers() {
    return User.find()
}

export async function createUser(data: UserType) {
    return User.create(data)
}

export async function auth(data: AuthParams) {
    const filters = {
        email: { $eq: data.email },
        password: { $eq: data.password }
    }
    return User.find(filters)
}