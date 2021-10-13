
export type ItemSizeGetter = (index: number) => number;
export type ItemSize = number | number[] | ItemSizeGetter;

export interface SizeAndPosition {
    size: number;
    offset: number;
}

export type ItemPosition = 'absolute' | 'sticky';

export type ItemStyle = {
    position: ItemPosition;
    top?: number;
    left: number;
    width?: string | number;
    height?: string | number;
    marginTop?: number;
    marginLeft?: number;
    marginRight?: number;
    marginBottom?: number;
    zIndex?: number;
}

export interface RowInfo {
    row: number;
    cells: React.ReactNode[];
    style: ItemStyle;
}

export interface CellInfo {
    row: number;
    column: number;
    style: ItemStyle;
}
