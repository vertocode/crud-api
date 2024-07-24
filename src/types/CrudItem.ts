import {CrudField} from "./Crud";

export interface CrudItem {
    _id: string
    crudId: string
    fields: any[]
    creatorUserEmail: string
    createdAt: Date
}

export interface CrudItemField extends CrudField {
    value: string | number | boolean
}