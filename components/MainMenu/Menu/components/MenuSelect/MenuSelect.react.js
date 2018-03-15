import React, { Component } from 'react';
import Types from 'prop-types';
import { SVG } from '@opuscapita/react-svg';
import './MenuSelect.less';

const dropdownSVG = require('!!raw-loader!@opuscapita/svg-icons/lib/arrow_drop_down.svg');

class MenuSelect extends Component
{
    static propTypes = {
        className: Types.string
    };

    static defaultProps = {
        className: ''
    };

    render()
    {
        const { className, ...restProps } = this.props;

        return(
            <div className={`oc-menu-select ${className || ''}`}>
                <div className="dropdown-icon">
                    <SVG
                        svg={dropdownSVG}
                        style={{ fill: '#333' }} />
                </div>
                <select className="select" {...restProps}>
                    {this.props.children}
                </select>
            </div>
        );
    }
}

export default MenuSelect;
