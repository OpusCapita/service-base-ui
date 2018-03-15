import React, { Component } from 'react';
import './Notifications.less';

class Notifications extends Component
{
    render()
    {
        const { children } = this.props;

        return(
            <div className="oc-notifications">
                <div
                    ref={ref => (this.containerRef = ref)}
                    className="items-container">
                    {children}
                </div>
            </div>
        );
    }
}

export default Notifications;
