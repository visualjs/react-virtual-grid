import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CellInfo, RowInfo, VirtualGrid, AutoSizer, ALIGNMENT } from '../src';

import './example.css';

interface State {
    scrollToRowIndex: number;
    scrollToColumnIndex: number;
    scrollToColumnAlignment: ALIGNMENT;
    scrollToRowAlignment: ALIGNMENT;
}

class Example extends React.Component<{}, State> {

    readonly state: State = {
        scrollToRowIndex: 0,
        scrollToColumnIndex: 0,
        scrollToColumnAlignment: ALIGNMENT.START,
        scrollToRowAlignment: ALIGNMENT.START,
    };

    protected getRowHeight = (index: number): number => {
        return Math.min(30 + index * 2, 60);
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

    private handleScrollToRowChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            scrollToRowIndex: Number(ev.target.value)
        });
    }

    private handleScrollToColumnChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            scrollToColumnIndex: Number(ev.target.value)
        });
    }

    private handleScrollToColumnAlignmentChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            scrollToColumnAlignment: ev.target.value as ALIGNMENT
        });
    }

    private handleScrollToRowAlignmentChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            scrollToRowAlignment: ev.target.value as ALIGNMENT
        });
    }

    render() {
        return (
            <div className="root">
                <div className="controls">
                    <input
                        type="number"
                        placeholder="scroll to row"
                        className="number-input control"
                        value={this.state.scrollToRowIndex}
                        onChange={this.handleScrollToRowChange}
                    />
                    <div className="select control">
                        <label>Alignment For Row</label>
                        <span>
                            {this.state.scrollToRowAlignment}
                            <select value={this.state.scrollToRowAlignment} onChange={this.handleScrollToRowAlignmentChange}>
                                <option value="start">start</option>
                                <option value="center">center</option>
                                <option value="end">end</option>
                                <option value="auto">auto</option>
                            </select>
                        </span>
                    </div>
                    <input
                        type="number"
                        placeholder="scroll to column"
                        className="number-input control"
                        value={this.state.scrollToColumnIndex}
                        onChange={this.handleScrollToColumnChange}
                    />
                    <div className="select control">
                        <label>Alignment For Column</label>
                        <span>
                            {this.state.scrollToColumnAlignment}
                            <select value={this.state.scrollToColumnAlignment} onChange={this.handleScrollToColumnAlignmentChange}>
                                <option value="start">start</option>
                                <option value="center">center</option>
                                <option value="end">end</option>
                                <option value="auto">auto</option>
                            </select>
                        </span>
                    </div>
                </div>
                <div className="grid">
                    <AutoSizer>
                        {
                            ({ width, height }) => (
                                <VirtualGrid
                                    width={width}
                                    height={height}
                                    className="virtual-grid"
                                    rowCount={10000}
                                    rowHeight={this.getRowHeight}
                                    columnCount={200}
                                    columnWidth={this.getColumnWidth}
                                    renderRow={this.renderRow}
                                    renderCell={this.renderCell}
                                    scrollToRowIndex={this.state.scrollToRowIndex}
                                    scrollToRowAlignment={this.state.scrollToRowAlignment}
                                    scrollToColumnIndex={this.state.scrollToColumnIndex}
                                    scrollToColumnAlignment={this.state.scrollToColumnAlignment}
                                />
                            )
                        }
                    </AutoSizer>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<Example />, document.querySelector('#root'));
