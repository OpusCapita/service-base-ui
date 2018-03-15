import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SVG } from '@opuscapita/react-svg';
import './MenuDropdownGrid.less';

class MenuDropdownGrid extends Component
{
    static propPropTypes = {
        activeItem: PropTypes.number,
        items: PropTypes.arrayOf(PropTypes.shape({
            svg: PropTypes.string,
            label: PropTypes.string,
            href: PropTypes.string
        }))
    }

    static defaultProps = {
        activeItem: null,
        items: [ ]
    }

    render()
    {
        const { activeItem, items } = this.props;

        return (
            <div className="oc-menu-dropdown-grid">
                <div className="items">
                {
                    items.map((item, i) =>
                    {
                        if(item)
                        {
                            const { svg, label, href, ...restProps } = item;

                            return (
                                <a key={i} className={`item-container`} data-test={`item-container`} href={href || 'javascript: void(0)'} {...restProps}>
                                    <div className={`item ${activeItem === i ? 'item--active' : ''}`}>
                                        <div className="item-image">
                                            <SVG svg={svg || ''} />
                                        </div>
                                        <div className="item-label">{label || ''}</div>
                                    </div>
                                </a>
                            );
                        }
                        else
                        {
                            return (
                                <div key={i} className={`item-container`}></div>
                            );
                        }
                    })
                }
                </div>
            </div>
        );
    }
}

export default MenuDropdownGrid;
