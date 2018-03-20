import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import './MenuDropdownList.less';

class MenuDropdownList extends Component
{
    static propPropTypes = {
        items: PropTypes.arrayOf(PropTypes.node)
    }

    static defaultProps = {
        items: [ ]
    }

    render()
    {
        const { items } = this.props;

        return (
            <ul className="oc-menu-dropdown-list">
                {
                    Children.toArray(items).map((item, i) =>
                    {
                        return (
                            <li key={i} className="common-item" >
                                {item}
                            </li>
                        );
                    })
                }
            </ul>
        );
    }
}

export default MenuDropdownList;
