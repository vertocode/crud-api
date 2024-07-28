import {Crud as CrudType} from "../types/Crud";
import Crud from "../models/Crud";
import CrudItems from "../models/CrudItems";
import {CrudItemField} from "../types/CrudItem";

export async function createCrud(data: CrudType) {
    return Crud.create(data)
}

export async function getCrudById(crudId: string) {
    return Crud.findById(crudId)
}

export async function getCrudList(userEmail: string) {
    return Crud.find({ creatorUserEmail: userEmail })
}

interface GetCrudItemOptions {
    page: number
    pageSize: number
    search: string
}

export async function getCrudItemList(crudId: string, options?: GetCrudItemOptions) {
    const page = options?.page || 1
    const pageSize = options?.pageSize || 10
    const search = options?.search || ''

    const crudObject = await Crud.findById(crudId) as unknown as CrudType

    if (!crudObject) {
        throw new Error('Crud not found')
    }

    const searchFilter = search
        ? { crudId, $text: { $search: search } }
        : { crudId };

    const skip = (page - 1) * pageSize;

    const items = await CrudItems.find(searchFilter).skip(skip).limit(pageSize)

    return {
        items,
        name: crudObject?.name,
        fields: crudObject?.fields
    }
}

interface CrudItemAddition {
    label: string
    value: string | number | boolean
}

interface CrudItemData {
    crudId: string
    fields: CrudItemAddition[]
}

export async function createCrudItem(data: CrudItemData) {
    const crudData = await getCrudById(data.crudId)

    data.fields.forEach(field => {
        const crudField = crudData?.fields.find(f => f.label === field.label)
        if (crudData && !crudField) {
            throw new Error(`Field ${field.label} not found in crud`)
        }

        if (crudField.required && !field?.value) {
            throw new Error(`Field ${field.label} is required`)
        }
    })

    const fields = crudData?.fields.map(field => {
        const value = data.fields.find(f => f.label === field.label)?.value
        return {
            label: field.label,
            type: field.type,
            required: field.required,
            options: field.options,
            value
        } as CrudItemField
    })

    return CrudItems.create({ ...data, fields })
}