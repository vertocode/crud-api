import mongoose from 'mongoose'

const crudSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    fields: {
        type: Array,
        required: true
    },
    creatorUserEmail: {
        type: String,
        required: true
    },
    userWithAccess: {
        type: Array,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('Crud', crudSchema)