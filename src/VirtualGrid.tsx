import React from "react";
import { ALIGNMENT, SCROLL_CHANGE_REASON } from "./constants";
import SizeAndPositionManager from "./SizeAndPositionManager";
import { STYLE_INNER, STYLE_ITEM, STYLE_WRAPPER } from "./styles";
import { RowInfo, CellInfo, ItemSize, ItemStyle } from "./types";

const DEFAULT_OVERSCAN_ROW_COUNT = 3;
const DEFAULT_OVERSCAN_COLUMN_COUNT = 1;

const DEFAULT_ROW_HEIGHT = 50;
const DEFAULT_COLUMN_WIDTH = 100;

interface StyleCache {
    [id: number]: ItemStyle;
}

export interface Props {
    className?: string;
    style?: React.CSSProperties;
    // container width and height
    width: number;
    height: number;
    // rows
    rowCount: number;
    rowHeight: ItemSize;
    estimatedRowHeight?: number;
    // columns
    columnCount: number;
    columnWidth: ItemSize;
    estimatedColumnWidth?: number;
    // overscan count
    overscanColumnCount?: number;
    overscanRowCount?: number;
    // scroll offset
    scrollTopOffset?: number;
    scrollLeftOffset?: number;
    // scroll to
    scrollToColumnIndex?: number;
    scrollToColumnAlignment?: ALIGNMENT;
    scrollToRowIndex?: number;
    scrollToRowAlignment?: ALIGNMENT;
    // render
    renderRow(rowInfo: RowInfo): React.ReactNode;
    renderCell(cellInfo: CellInfo): React.ReactNode;
}

export interface State {
    offsetLeft: number;
    offsetTop: number;
    scrollChangeReason: SCROLL_CHANGE_REASON;
}

export class VirtualGrid extends React.PureComponent<Props, State> {

    static defaultProps = {
        overscanRowCount: DEFAULT_OVERSCAN_ROW_COUNT,
        overscanColumnCount: DEFAULT_OVERSCAN_COLUMN_COUNT,
    };

    itemSizeGetter = (itemSize: ItemSize) => {
        return (index: number) => this.getSize(index, itemSize);
    };

    private rowManager = new SizeAndPositionManager({
        itemCount: this.props.rowCount,
        itemSizeGetter: this.itemSizeGetter(this.props.rowHeight),
        estimatedItemSize: this.getEstimatedItemSize(
            this.props.estimatedRowHeight,
            this.props.rowHeight,
            DEFAULT_ROW_HEIGHT
        ),
    });

    private columnManager = new SizeAndPositionManager({
        itemCount: this.props.columnCount,
        itemSizeGetter: this.itemSizeGetter(this.props.columnWidth),
        estimatedItemSize: this.getEstimatedItemSize(
            this.props.estimatedColumnWidth,
            this.props.columnWidth,
            DEFAULT_COLUMN_WIDTH
        )
    });

    private rootNode?: HTMLElement;

    private rowStyleCache: StyleCache = {};

    private columnStyleCache: StyleCache = {};

    readonly state: State = {
        offsetLeft:
            this.props.scrollLeftOffset ||
            (this.props.scrollToColumnIndex != null &&
                this.getOffsetForColumn(this.props.scrollToColumnIndex)) ||
            0,
        offsetTop:
            this.props.scrollTopOffset ||
            (this.props.scrollToRowIndex != null &&
                this.getOffsetForRow(this.props.scrollToRowIndex)) ||
            0,
        scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
    };

    componentDidMount() {
        const {
            scrollLeftOffset, scrollToColumnIndex,
            scrollTopOffset, scrollToRowIndex,
        } = this.props;

        this.rootNode?.addEventListener('scroll', this.handleScroll, { passive: true });

        let scrollLeft = undefined;
        let scrollTop = undefined;

        if (scrollLeftOffset != undefined) {
            scrollLeft = scrollLeftOffset;
        } else if (scrollToColumnIndex != undefined) {
            scrollLeft = this.getOffsetForColumn(scrollToColumnIndex);
        }

        if (scrollTopOffset != undefined) {
            scrollTop = scrollTopOffset;
        } else if (scrollToRowIndex != undefined) {
            scrollTop = this.getOffsetForRow(scrollToRowIndex);
        }

        this.scrollTo({ left: scrollLeft, top: scrollTop });
    }

    componentWillReceiveProps(nextProps: Props) {

        const {
            estimatedRowHeight,
            estimatedColumnWidth,
            rowCount,
            columnCount,
            rowHeight,
            columnWidth,
            scrollTopOffset,
            scrollLeftOffset,
            scrollToRowAlignment,
            scrollToColumnAlignment,
            scrollToRowIndex,
            scrollToColumnIndex,
        } = this.props;

        const scrollPropsHaveChanged =
            nextProps.scrollToRowIndex !== scrollToRowIndex ||
            nextProps.scrollToColumnIndex !== scrollToColumnIndex ||
            nextProps.scrollToRowAlignment !== scrollToRowAlignment ||
            nextProps.scrollToColumnAlignment !== scrollToColumnAlignment;
        const itemPropsHaveChanged =
            nextProps.rowCount !== rowCount ||
            nextProps.columnCount !== columnCount ||
            nextProps.rowHeight !== rowHeight ||
            nextProps.columnWidth !== columnWidth ||
            nextProps.estimatedRowHeight !== estimatedRowHeight ||
            nextProps.estimatedColumnWidth !== estimatedColumnWidth;

        if (nextProps.rowHeight !== rowHeight) {
            this.rowManager.updateConfig({
                itemSizeGetter: this.itemSizeGetter(nextProps.rowHeight),
            });
        }

        if (nextProps.columnWidth !== columnWidth) {
            this.columnManager.updateConfig({
                itemSizeGetter: this.itemSizeGetter(nextProps.columnWidth),
            });
        }

        if (
            nextProps.rowCount !== rowCount ||
            nextProps.estimatedRowHeight !== estimatedRowHeight
        ) {
            this.rowManager.updateConfig({
                itemCount: nextProps.rowCount,
                estimatedItemSize: this.getEstimatedItemSize(
                    nextProps.estimatedRowHeight, nextProps.rowHeight, DEFAULT_ROW_HEIGHT
                ),
            });
        }

        if (
            nextProps.columnCount !== columnCount ||
            nextProps.estimatedColumnWidth !== estimatedColumnWidth
        ) {
            this.columnManager.updateConfig({
                itemCount: nextProps.columnCount,
                estimatedItemSize: this.getEstimatedItemSize(
                    nextProps.estimatedColumnWidth, nextProps.columnWidth, DEFAULT_COLUMN_WIDTH
                ),
            });
        }

        if (itemPropsHaveChanged) {
            this.recomputeSizes();
        }

        if (
            nextProps.scrollLeftOffset !== scrollLeftOffset ||
            nextProps.scrollTopOffset != scrollTopOffset
        ) {
            this.setState({
                offsetLeft: nextProps.scrollLeftOffset || 0,
                offsetTop: nextProps.scrollTopOffset || 0,
                scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
            });
        } else if (scrollPropsHaveChanged || itemPropsHaveChanged) {
            this.setState({
                offsetLeft: this.getOffsetForColumn(
                    nextProps.scrollToColumnIndex || 0,
                    nextProps.scrollToColumnAlignment,
                    nextProps.columnCount,
                ),
                offsetTop: this.getOffsetForRow(
                    nextProps.scrollToRowIndex || 0,
                    nextProps.scrollToRowAlignment,
                    nextProps.rowCount,
                ),
                scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
            });
        }
    }

    componentDidUpdate(_: Props, prevState: State) {
        const { offsetLeft, offsetTop, scrollChangeReason } = this.state;

        if (
            (
                prevState.offsetLeft !== offsetLeft ||
                prevState.offsetTop != offsetTop
            ) && scrollChangeReason === SCROLL_CHANGE_REASON.REQUESTED
        ) {
            this.scrollTo({ left: offsetLeft, top: offsetTop });
        }
    }

    componentWillUnmount() {
        this.rootNode?.removeEventListener('scroll', this.handleScroll);
    }

    scrollTo({ top, left }: { top?: number, left?: number }) {
        if (top != undefined && this.rootNode) {
            this.rootNode['scrollTop'] = top;
        }

        if (left != undefined && this.rootNode) {
            this.rootNode['scrollLeft'] = left;
        }
    }

    getOffsetForColumn(
        index: number,
        scrollToAlignment = this.props.scrollToColumnAlignment,
        itemCount: number = this.props.columnCount,
    ): number {
        if (index < 0 || index >= itemCount) {
            index = 0;
        }

        return this.columnManager.getUpdatedOffsetForIndex({
            align: scrollToAlignment,
            containerSize: this.props.width,
            currentOffset: (this.state && this.state.offsetLeft) || 0,
            targetIndex: index,
        });
    }

    getOffsetForRow(
        index: number,
        scrollToAlignment = this.props.scrollToRowAlignment,
        itemCount: number = this.props.rowCount,
    ): number {
        if (index < 0 || index >= itemCount) {
            index = 0;
        }

        return this.rowManager.getUpdatedOffsetForIndex({
            align: scrollToAlignment,
            containerSize: this.props.height,
            currentOffset: (this.state && this.state.offsetTop) || 0,
            targetIndex: index,
        });
    }

    recomputeSizes(startRowIndex = 0, startColumnIndex = 0) {
        this.rowStyleCache = {};
        this.columnStyleCache = {};
        this.rowManager.resetItem(startRowIndex);
        this.columnManager.resetItem(startColumnIndex);
    }

    private getEstimatedItemSize(estimatedSize?: number, itemSize?: ItemSize, defaultSize: number = 50): number {
        return (
            estimatedSize ||
            (typeof itemSize === 'number' && itemSize) ||
            defaultSize
        );
    }

    private getSize(index: number, itemSize: ItemSize): number {
        if (typeof itemSize === 'function') {
            return itemSize(index);
        }

        return Array.isArray(itemSize) ? itemSize[index] : itemSize;
    }

    private getRowStyle(index: number) {
        const style = this.rowStyleCache[index];

        if (style) {
            return style;
        }

        const { size, offset } = this.rowManager.getSizeAndPositionForIndex(index);

        return (this.rowStyleCache[index] = { ...STYLE_ITEM, height: size, top: offset });
    }

    private getColumnStyle(index: number) {
        const style = this.columnStyleCache[index];

        if (style) {
            return style;
        }

        const { size, offset } = this.columnManager.getSizeAndPositionForIndex(index);

        return (this.columnStyleCache[index] = { ...STYLE_ITEM, width: size, left: offset });
    }

    private handleScroll = (ev: Event) => {
        const offset = this.getNodeOffset();

        if (
            offset.left < 0 ||
            offset.top < 0 ||
            ev.target !== this.rootNode ||
            (
                this.state.offsetLeft === offset.left &&
                this.state.offsetTop === offset.top
            )
        ) {
            return;
        }

        this.setState({
            offsetLeft: offset.left,
            offsetTop: offset.top,
            scrollChangeReason: SCROLL_CHANGE_REASON.OBSERVED,
        });
    }

    private getNodeOffset() {
        return {
            top: this.rootNode?.scrollTop || 0,
            left: this.rootNode?.scrollLeft || 0
        };
    }

    private getRef = (node: HTMLDivElement): void => {
        this.rootNode = node;
    };

    render() {

        const {
            width,
            height,
            style,
            overscanRowCount = DEFAULT_OVERSCAN_ROW_COUNT,
            overscanColumnCount = DEFAULT_OVERSCAN_COLUMN_COUNT,
            renderRow,
            renderCell,
        } = this.props;

        const props = {
            className: this.props.className,
            children: this.props.children,
        };

        const { offsetLeft, offsetTop } = this.state;

        const rowRange = this.rowManager.getVisibleRange({
            containerSize: this.props.height,
            offset: offsetTop,
            overscanCount: overscanRowCount
        });

        const columnRange = this.columnManager.getVisibleRange({
            containerSize: this.props.width,
            offset: offsetLeft,
            overscanCount: overscanColumnCount,
        });

        const wrapperStyle = { ...STYLE_WRAPPER, ...style, height, width };
        const innerStyle = {
            ...STYLE_INNER,
            width: this.columnManager.getTotalSize(),
            height: this.rowManager.getTotalSize(),
        };

        const rows: React.ReactNode[] = [];

        if (rowRange.start != undefined && rowRange.stop != undefined) {
            for (let row = rowRange.start; row <= rowRange.stop; row++) {
                const cells: React.ReactNode[] = [];

                // render cells in a row
                if (columnRange.start != undefined && columnRange.stop != undefined) {
                    for (let column = columnRange.start; column <= columnRange.stop; column++) {
                        cells.push(renderCell({ style: this.getColumnStyle(column), row, column }));
                    }
                }

                rows.push(renderRow({ style: this.getRowStyle(row), row, cells }));
            }
        }

        return (
            <div ref={this.getRef} {...props} style={wrapperStyle}>
                <div style={innerStyle}>{rows}</div>
            </div>
        );
    }
}
