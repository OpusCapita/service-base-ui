import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SVG } from '@opuscapita/react-svg';
import './Item.less';

class Item extends Component
{
    static propPropTypes = {
        id : PropTypes.object,
        icon : PropTypes.object,
        label : PropTypes.node,
        date : PropTypes.string,
        type : PropTypes.oneOf([ 'success', 'info', 'warning', 'error' ]),
        url :  PropTypes.string,
        onClick : PropTypes.func.isRequired
    }

    static defaultProps = {
        icon : '',
        label : '',
        date : '',
        type : 'info',
        url : '',
        onClick : () => null
    }

    typeClassMap = {
        success : 'fill-success',
        info : 'fill-info',
        warning : 'fill-warning',
        error : 'fill-error'
    }

    handleOnClick(e)
    {
        e.preventDefault();

        const { id, icon, label, date, type, url } = this.props;
        const item = { id, icon, label, date, type, url };

        this.props.onClick(item);
    }

    render()
    {
        const { icon, label, date, type, url } = this.props;

        return(
            <div className="oc-notification" onClick={e => this.handleOnClick(e)}>
                <div className="icon">
                    <SVG svg={icon} className={this.typeClassMap[type]} />
                </div>
                <div className="text-contaniner">
                    <div className="label">
                        {label}
                    </div>
                    <div className="date-time">
                        {date}
                    </div>
                </div>
            </div>
        );
    }
}

export default Item;
