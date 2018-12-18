import React from 'react'

import './HelpBox.css';

class HelpBoxItem extends React.Component
{
    render()
    {
        return(
            <div>
                <div className="content">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default HelpBoxItem;