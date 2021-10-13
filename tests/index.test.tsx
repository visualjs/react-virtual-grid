/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import { render } from 'react-dom';

import { CellInfo, RowInfo, VirtualGrid } from '../src';

const HEIGHT = 100;
const WIDTH = 200;
const ROW_HEIGHT = 10;
const COLUMN_WIDTH = 20;

describe('VirtualGrid', () => {
    let node: HTMLDivElement;

    function renderRow({ row, style, cells }: RowInfo) {
        return (
            <div className="row" key={row} style={style}>
                {cells}
            </div>
        );
    }

    function renderCell({ style, row, column }: CellInfo) {
        return (
            <div key={column} className="cell" style={style}>
                r{row}, c{column}
            </div>
        );
    }

    function getComponent(props = {}) {
        return (
            <VirtualGrid
                height={HEIGHT}
                width={WIDTH}
                overscanColumnCount={0}
                overscanRowCount={0}
                rowHeight={ROW_HEIGHT}
                columnWidth={COLUMN_WIDTH}
                rowCount={500}
                columnCount={100}
                renderRow={renderRow}
                renderCell={renderCell}
                {...props}
            />
        );
    }

    beforeEach(() => {
        node = document.createElement('div');
    });

    describe('number of rendered children', () => {
        it('renders enough children to fill the view', () => {
            render(getComponent(), node);

            expect(node.querySelectorAll('.row')).toHaveLength(HEIGHT / ROW_HEIGHT);
            expect(node.querySelectorAll('.cell')).toHaveLength((HEIGHT / ROW_HEIGHT) * (WIDTH / COLUMN_WIDTH));
        });

        it('does not render more children than available if the list is not filled', () => {
            render(getComponent({ rowCount: 5, columnCount: 10 }), node);

            expect(node.querySelectorAll('.row')).toHaveLength(5);
            expect(node.querySelectorAll('.cell')).toHaveLength(5 * 10);
        });

        it('handles dynamically updating the number of items', () => {
            for (let rowCount = 0; rowCount < 5; rowCount++) {
                render(getComponent({ rowCount }), node);
                expect(node.querySelectorAll('.row')).toHaveLength(rowCount);
            }
        });
    });

    /** Test scrolling via initial props */
    describe('scrollToIndex', () => {
        it('scrolls to the left top', () => {
            render(getComponent({ scrollToRowIndex: 0, scrollToColumnIndex: 0 }), node);

            expect(node.textContent).toContain('r0, c0');
        });

        it('scrolls to the middle', () => {
            render(getComponent({ scrollToRowIndex: 49, scrollToColumnIndex: 50 }), node);

            expect(node.textContent).toContain('r49, c50');
        });

        it('scrolls to the correct position for :scrollToRowAlignment "start"', () => {
            render(
                getComponent({
                    scrollToRowAlignment: 'start',
                    scrollToRowIndex: 49,
                }),
                node,
            );

            // 100 items * 10 item height = 1,000 total item height; 10 items can be visible at a time.
            expect(node.textContent).toContain('r49, c0');
            expect(node.textContent).toContain('r58, c0');
        });

        it('scrolls to the correct position for :scrollToRowAlignment "end"', () => {
            render(
                getComponent({
                    scrollToRowIndex: 99,
                }),
                node,
            );
            render(
                getComponent({
                    scrollToRowAlignment: 'end',
                    scrollToRowIndex: 49,
                }),
                node,
            );

            // 100 items * 10 item height = 1,000 total item height; 10 items can be visible at a time.
            expect(node.textContent).toContain('r40, c0');
            expect(node.textContent).toContain('r49, c0');
        });

        it('scrolls to the correct position for :scrollToRowAlignment "center"', () => {
            render(
                getComponent({
                    scrollToRowIndex: 99,
                }),
                node,
            );
            render(
                getComponent({
                    scrollToRowAlignment: 'center',
                    scrollToRowIndex: 49,
                }),
                node,
            );

            // 100 items * 10 item height = 1,000 total item height; 11 items can be visible at a time (the first and last item are only partially visible)
            expect(node.textContent).toContain('r44, c0');
            expect(node.textContent).toContain('r54, c0');
        });
    });

    describe('property updates', () => {
        it('updates :scrollToRowIndex position when :rowHeight changes', () => {
            render(getComponent({ scrollToRowIndex: 50 }), node);
            expect(node.textContent).toContain('r50, c0');

            // Making rows taller pushes name off/beyond the scrolled area
            render(getComponent({ scrollToRowIndex: 50, rowHeight: 20 }), node);
            expect(node.textContent).toContain('r50, c0');
        });

        it('updates :scrollToRowIndex position when :height changes', () => {
            render(getComponent({ scrollToRowIndex: 50 }), node);
            expect(node.textContent).toContain('r50, c0');

            // Making the list shorter leaves only room for 1 item
            render(getComponent({ scrollToRowIndex: 50, height: 20 }), node);
            expect(node.textContent).toContain('r50, c0');
        });

        it('updates :scrollToRowIndex position when :scrollToRowIndex changes', () => {
            render(getComponent(), node);
            expect(node.textContent).not.toContain('r50, c0');

            render(getComponent({ scrollToRowIndex: 50 }), node);
            expect(node.textContent).toContain('r50, c0');
        });

        it('updates scroll position if size shrinks smaller than the current scroll', () => {
            render(getComponent({ scrollToRowIndex: 500 }), node);
            render(getComponent({ scrollToRowIndex: 500, itemCount: 10 }), node);

            expect(node.textContent).toContain('r9, c0');
        });
    });
});
