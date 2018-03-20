import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SVG } from '@opuscapita/react-svg';
import './NavigationBar.less';

const dropdownSVG = require('!!raw-loader!@opuscapita/svg-icons/lib/arrow_drop_down.svg');

class NavigationBar extends Component
{
    static propPropTypes = {
        activeItem: PropTypes.number,
        openedItem: PropTypes.number,
        navigationItems: PropTypes.arrayOf(PropTypes.shape({
            children: PropTypes.node,
            href: PropTypes.string,
            subItems: PropTypes.arrayOf(PropTypes.shape({
                children: PropTypes.node,
                href: PropTypes.string,
                onClick: PropTypes.func
            }))
        }))
    };

    static defaultProps = {
        openedItem: null,
        activeItem: null,
        navigationItems: []
    };

    state = {
        openedItem: null
    };

    componentDidMount()
    {
        document.body.addEventListener('click', this.handleBodyClick.bind(this));
        document.body.addEventListener('keydown', this.handleBodyKeyDown.bind(this));
    }

    componentWillUnmount()
    {
        document.body.removeEventListener('click', this.handleBodyClick.bind(this));
        document.body.removeEventListener('keydown', this.handleBodyKeyDown.bind(this));
    }

    handleBodyClick(event)
    {
        const clickedOutside = !this.containerRef.contains(event.target);

        if(clickedOutside)
            this.hideTopLevelItem();
    }

    handleBodyKeyDown(event)
    {
        // TAB or ESC key
        if(event.which === 9 || event.which === 27)
            this.hideTopLevelItem();
    }

    showTopLevelItem(key)
    {
        this.setState({ openedItem : key });
    }

    hideTopLevelItem()
    {
        this.setState({ openedItem : null });
    }

    handleTopLevelItemClick(key)
    {
        if(this.state.openedItem === key)
            this.hideTopLevelItem();
        else
            this.showTopLevelItem(key);
    }

    renderClickableElement(item, key, className)
    {
        const { href, children, subItems, onClick, ...restProps } = item;
        const dropdownIcon = item.subItems ? <div className="dropdown-icon"><SVG svg={dropdownSVG} /></div> : null;

        return (
            <div key={key} className="clickable-element-container">
                {<a href={href || '#'} onClick={onClick || (e => href || e.preventDefault())} className={`clickable-element ${dropdownIcon ? 'clickable-element--with-dropdown' : ''}`} {...restProps}>{children}</a>}
                {dropdownIcon}
            </div>
        );
    }

    renderTopLevelItem(navigationItem, key)
    {
        const isActive = this.props.activeItem === key;
        const isOpened = this.state.openedItem === key;

        return(
            <li
                key={key}
                data-test="top-level-item"
                className={`
                    top-level-item
                    ${isActive ? 'top-level-item--active' : ''}
                    ${isOpened ? 'top-level-item--opened' : ''}
                    ${'top-level-item--light-overlay'}
                `}
                onClick={() => this.handleTopLevelItemClick(key)}>
                <div className={`top-level-clickable-item ${isActive ? 'top-level-clickable-item--active' : '' }`}>
                    {this.renderClickableElement(navigationItem, key)}
                </div>

                {
                    navigationItem.subItems && isOpened ?
                        <ul className="sub-items-container">
                            {
                                navigationItem.subItems.map((subItem, key) =>
                                {
                                    return (
                                        <li key={key} className="sub-item" data-test="sub-item">
                                            {this.renderClickableElement(subItem, key)}
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    : null
                }
            </li>
        );
    }

    render()
    {
        const { navigationItems } = this.props;

        return(
            <ul ref={ref => (this.containerRef = ref)} className="oc-navigation-bar" data-test="oc-navigation-bar">
                {navigationItems.map((item, i) => this.renderTopLevelItem(item, i))}
            </ul>
        );
    }
}

export default NavigationBar;
