import * as React from 'react';
import * as ReactDOM from 'react-dom';

class Example extends React.Component {
    
    render() {
        return (
            <div>Example</div>
        );
    }
}

ReactDOM.render(<Example />, document.querySelector('#root'));
