export interface User {
    _id: string
    name: string
    email: string
    password: string
    createdAt: Date
    token: string
}

export interface AuthParams {
    email: string
    password: string
}