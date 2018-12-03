import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Item } from './Item';

import './MenuDropdownGrid.less';

class MenuDropdownGrid extends Component
{
    static propPropTypes = {
        activeIndex : PropTypes.number,
        items: PropTypes.arrayOf(PropTypes.shape({
            icon : PropTypes.string,
            label : PropTypes.string,
            href : PropTypes.string,
            onClick : PropTypes.function
        }))
    }

    static defaultProps = {
        activeIndex : -1,
        items : [ ]
    }

    render()
    {
        const { activeIndex, items } = this.props;

        return (
            <div className="oc-menu-dropdown-grid">
                <div className="items">
                    {items.map((item, i) => <Item key={item.id} {...item} isActive={activeIndex === i} />)}
                </div>
            </div>
        );
    }
}

export default MenuDropdownGrid;
