export interface Crud {
    name: string
    fields: CrudField[]
    creatorUserEmail: string
    usersWithAccess: CrudUserAccess[]
}

export interface CrudField {
    label: string
    type: FieldType
    required: boolean
    options?: string[]
}

interface CrudUserAccess {
    email: string
    accessLevel: AccessLevel
}

enum AccessLevel {
    READONLY = 'readonly',
    ADMIN = 'admin'
}

enum FieldType {
    TEXT = 'text',
    NUMBER = 'number',
    OPTIONS = 'options',
    AUTOCOMPLETE = 'autocomplete',
    MULTIPLE_OPTIONS = 'multipleOptions',
    DATE = 'date',
    RADIO_GROUP = 'radioGroup',
    CPF = 'cpf',
    CNPJ = 'cnpj',
    PHONE = 'phone',
}