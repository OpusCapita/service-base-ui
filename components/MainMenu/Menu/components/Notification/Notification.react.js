import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SVG } from '@opuscapita/react-svg';

import './Notification.less';

class Notification extends Component
{
    static propPropTypes = {
        svg: PropTypes.string,
        svgClassName: PropTypes.string,
        message: PropTypes.node,
        dateTime: PropTypes.string,
        className: PropTypes.string
    }

    static defaultProps = {
        svg: '',
        svgClassName: '',
        message: '',
        dateTime: '',
        className: ''
    }

    render()
    {
        const { svg, svgClassName, message, dateTime, className, ...restProps } = this.props;

        return(
            <div className={`oc-notification ${className}`} { ...restProps }>
                <div className={`icon`}>
                    <SVG svg={svg} className={svgClassName} />
                </div>

                <div className="text-contaniner">
                    <div className={`message`}>
                        {message}
                    </div>

                    <div className={`date-time`}>
                        {dateTime}
                    </div>
                </div>
            </div>
        );
    }
}

export default Notification;
