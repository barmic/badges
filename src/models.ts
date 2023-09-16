export interface BadgeParams {
    firstname: string,
    lastname: string,
    type: 'staff' | 'speaker' | 'sponsor' | 'attendee',
    barcode: string,
    univ1?: string,
    univ2?: string,
}

export type TypesConfig = {[k: string]: {name: string, color: string}};

export type ColumnsConfig = {[k in keyof BadgeParams]: number}
