import {Crud as CrudType} from "../types/Crud";
import Crud from "../models/Crud";

export async function createCrud(data: CrudType) {
    return Crud.create(data)
}

export async function getCrudList(userEmail: string) {
    return Crud.find({ creatorUserEmail: userEmail })
}