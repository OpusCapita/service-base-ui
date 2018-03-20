import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SVG } from '@opuscapita/react-svg';
import './Item.less';

class Item extends Component
{
    static propTypes = {
        icon : PropTypes.string.isRequired,
        label : PropTypes.string.isRequired,
        href : PropTypes.string.isRequired,
        onClick : PropTypes.func.isRequired,
        isActive : PropTypes.bool.isRequired
    }

    static defaultProps = {
        icon : '',
        label : '',
        href : '#',
        onClick : () => null,
        isActive : false
    }

    render()
    {
        const { icon, label, href, onClick, isActive } = this.props;

        return (
            <a className={`item-container`} href={href} onClick={onClick}>
                <div className={`item ${isActive ? 'item--active' : ''}`}>
                    <div className="item-image">
                        <SVG svg={icon} />
                    </div>
                    <div className="item-label">{label}</div>
                </div>
            </a>
        );
    }
}

export default Item;
