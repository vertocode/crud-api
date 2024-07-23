import {Crud as CrudType} from "../types/Crud";
import Crud from "../models/Crud";
import CrudItems from "../models/CrudItems";

export async function createCrud(data: CrudType) {
    return Crud.create(data)
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
        name: crudObject?.name
    }
}