export type BadgeType = 'staff' | 'speaker' | 'sponsor' | 'attendee';

export interface BadgeParams {
    firstname: string,
    lastname: string,
    type?: BadgeType,
    barcode: string,
    univ1?: string,
    univ2?: string,
}

export type TypesConfig = Record<BadgeType, {name: string, color: string}>;

type Plouf<K extends keyof BadgeParams, T> = {
    [P in K]: T;
}

export type ColumnsConfig = Plouf<keyof BadgeParams, number>
