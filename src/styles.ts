import { ItemPosition, ItemStyle } from ".";

export const STYLE_WRAPPER: React.CSSProperties = {
    overflow: 'auto',
    willChange: 'transform',
    WebkitOverflowScrolling: 'touch',
};

export const STYLE_INNER: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: '100%',
};

export const STYLE_ITEM: {
    position: ItemStyle['position'];
    top: ItemStyle['top'];
    left: ItemStyle['left'];
    height: ItemStyle['height'];
    width: ItemStyle['width'];
} = {
    position: 'absolute' as ItemPosition,
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
};
