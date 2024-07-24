import mongoose from 'mongoose'

const crudItemsSchema = new mongoose.Schema({
    crudId: {
        type: String,
        required: true
    },
    fields: {
        type: Array,
        required: true
    },
    creatorUserEmail: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('CrudItem', crudItemsSchema)