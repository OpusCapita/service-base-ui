import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SVG } from '@opuscapita/react-svg';
import './Item.less';

class Item extends Component
{
    static propPropTypes = {
        icon : PropTypes.object,
        label : PropTypes.node,
        date : PropTypes.string,
        type : PropTypes.oneOf([ 'success', 'info', 'warning', 'error' ])
    }

    static defaultProps = {
        icon : '',
        label : '',
        date : '',
        type : 'info'
    }

    typeClassMap = {
        success : 'fill-success',
        info : 'fill-info',
        warning : 'fill-warning',
        error : 'fill-error'
    }

    render()
    {
        const { icon, label, date, type } = this.props;

        return(
            <div className={`oc-notification`}>
                <div className={`icon`}>
                    <SVG svg={icon} className={this.typeClassMap[type]} />
                </div>
                <div className="text-contaniner">
                    <div className={`label`}>
                        {label}
                    </div>
                    <div className={`date-time`}>
                        {date}
                    </div>
                </div>
            </div>
        );
    }
}

export default Item;
