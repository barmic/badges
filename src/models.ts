export type BadgeType = 'staff' | 'speaker' | 'sponsor' | 'attendee';

export interface BadgeParams {
    firstname: string,
    lastname: string,
    type: BadgeType,
    barcode: string,
    univ1?: string,
    univ2?: string,
}

export type TypesConfig = Record<BadgeType, {name: string, color: string}>;

export type ColumnsConfig = {[k in keyof BadgeParams]: number}
