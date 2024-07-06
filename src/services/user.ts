import User from '../models/User'
import { User as UserType } from '../types/User'

export async function getUsers() {
    return User.find()
}

export async function createUser(data: UserType) {
    return User.create(data)
}