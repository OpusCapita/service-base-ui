import React from 'react'

import './HelpBox.css';

class HelpBoxItem extends React.Component
{
    render()
    {
        return(
            <div className="content">
                {this.props.children}
            </div>
        );
    }
}

export default HelpBoxItem;
