import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    activeToken: {
        type: String,
        default: null
    },
    activeTokenExpires: {
        type: Date,
        default: null
    }
})

export default mongoose.model('User', userSchema)