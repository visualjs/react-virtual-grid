import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CellInfo, RowInfo, VirtualGrid } from '../src';

import './example.css';

class Example extends React.Component {

    protected getRowHeight = (index: number): number => {
        if ((index % 2) === 0) {
            return 35;
        }

        return 50;
    }

    protected getColumnWidth = (index: number): number => {
        return 60 + index * 2;
    }

    private renderRow = ({ style, row, cells }: RowInfo) => {
        return (
            <div key={row} className="row" style={style}>
                {cells}
            </div>
        );
    }

    private renderCell = ({ style, row, column }: CellInfo) => {
        return (
            <div key={column} className="cell" style={style}>
                r{row}, c{column}
            </div>
        );
    }

    render() {
        return (
            <div className="root">
                <VirtualGrid
                    width={800}
                    height={450}
                    className="virtual-grid"
                    rowCount={10000}
                    rowHeight={this.getRowHeight}
                    columnCount={100}
                    columnWidth={this.getColumnWidth}
                    overscanRowCount={10}
                    overscanColumnCount={10}
                    renderRow={this.renderRow}
                    renderCell={this.renderCell}
                />
            </div>
        );
    }
}

ReactDOM.render(<Example />, document.querySelector('#root'));
