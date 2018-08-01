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

    constructor(props)
    {
        super(props);

        const { id, icon, label, date, type, url } = props;
        const item = { id, icon, label, date, type, url };

        this.state = { item };
    }

    componentWillReceiveProps(nextProps)
    {
        const { id, icon, label, date, type, url } = nextProps;
        const item = { id, icon, label, date, type, url };

        this.state = { item };
    }

    handleOnClick(e)
    {
        e.preventDefault();

        this.props.onClick(this.state.item);
    }

    render()
    {
        const { icon, label, date, type, url } = this.state.item;

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
