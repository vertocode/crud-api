import {Crud as CrudType} from "../types/Crud";
import Crud from "../models/Crud";
import CrudItems from "../models/CrudItems";
import {CrudItemField} from "../types/CrudItem";

export async function createCrud(data: CrudType) {
    return Crud.create(data)
}

export async function deleteCrud(crudId: string) {
    const crudObject = await Crud.findById(crudId) as unknown as CrudType

    if (!crudObject) {
        throw new Error('Crud not found')
    }

    const items = await CrudItems.find({ crudId })
    items.forEach(item => item.deleteOne().catch(e => {
        throw new Error(e)
    }))

    return Crud.findByIdAndDelete(crudId)
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
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 10;
    const search = options?.search || '';

    const crudObject = await Crud.findById(crudId) as unknown as CrudType;

    if (!crudObject) {
        throw new Error('Crud not found');
    }

    if (search) {
        const indexInfo = await CrudItems.collection.indexes();

        const textIndexExists = indexInfo.some(index =>
            index.key && index.key._fts === 'text' && (index.weights && index.weights['fields.value'] || index.weights && index.weights['fields.label'])
        );

        if (!textIndexExists) {
            try {
                await CrudItems.collection.createIndex({ "fields.value": "text" });
            } catch (error) {
                throw error;
            }
        }
    }



    const searchFilter = search
        ? { crudId, $text: { $search: search } }
        : { crudId };

    const skip = (page - 1) * pageSize;

    const items = await CrudItems.find(searchFilter).skip(skip).limit(pageSize);

    return {
        items,
        name: crudObject?.name,
        fields: crudObject?.fields
    };
}

export async function getCrudItem(params: { itemId: string }) {
    const { itemId } = params

    const item = await CrudItems.findById(itemId)
    if (!item) {
        throw new Error(`Item with id ${itemId} not found`)
    }

    return item
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

interface EditCrudData {
    crudId: string
    name: string
    fields: {
        label: string
        type: string
        required: boolean
        options?: string[]
    }[]
}

export async function updateCrud(params: EditCrudData) {
    const { crudId, name, fields } = params

    const crud = await getCrudById(crudId)
    if (!crud) {
        throw new Error(`CRUD with id ${crudId} not found`)
    }

    return crud.updateOne({
        $set: {
            name,
            fields
        }
    })
}

interface EditCrudItemData {
    crudId: string
    itemId: string
    fields: {
        label: string
        value: string | number | boolean
        required?: boolean
        options?: any[]
    }[]
}

export async function updateCrudItem(params: EditCrudItemData) {
    const { crudId, itemId, fields } = params

    const crudData = await getCrudById(crudId)
    if (!crudData) {
        throw new Error(`CRUD with id ${crudId} not found`)
    }

    const item = await CrudItems.findById(itemId)
    if (!item) {
        throw new Error(`Item with id ${itemId} not found`)
    }

    const fieldsMap = new Map(fields.map(field => [field.label, field]))

    return item.updateOne({
        $set: {
            fields: item.fields.map((field: any) => {
                if (fieldsMap.has(field.label)) {
                    const fieldData = fieldsMap.get(field.label)
                    const { value, required, options, label } = fieldData!
                    if (label) field.label = label
                    if (value) field.value = value
                    if (required) field.required = required
                    if (options) field.options = options
                }
                return field
            })
        }
    })
}

export async function deleteCrudItem(itemId: string) {
    return CrudItems.findByIdAndDelete(itemId)
}