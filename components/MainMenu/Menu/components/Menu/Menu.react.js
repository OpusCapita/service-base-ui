import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import MenuLogo from '../MenuLogo';
import NavigationBar from '../NavigationBar';
import MenuIconsBar from '../MenuIconsBar';
import MenuSearch from '../MenuSearch';
import './Menu.less';
import '../theme/opuscapita-dark.less';

const menuHeight = 70;
const iconsBarWidth = 640;

class Menu extends Component
{
    static propTypes = {
        appName: PropTypes.string,
        activeItem: PropTypes.number,
        alwaysAtTop: PropTypes.bool,
        className: PropTypes.string,
        logoSrc: PropTypes.string,
        logoHref: PropTypes.string,
        logoTitle: PropTypes.string,
        labelText: PropTypes.string,
        labelLinkText: PropTypes.string,
        labelLinkHref: PropTypes.string,
        noMargin: PropTypes.bool,
        showSearch: PropTypes.bool,
        searchProps: PropTypes.object,
        navigationItems: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string,
            href: PropTypes.string,
            subItems: PropTypes.arrayOf(PropTypes.shape({
                label: PropTypes.string,
                href: PropTypes.string
            }))
        })),
        iconsBarItems: PropTypes.arrayOf(PropTypes.node)
    }

    static defaultProps = {
        appName: '',
        alwaysAtTop: false,
        activeItem: null,
        className: 'opuscapita-dark-theme',
        logoSrc: '',
        logoTitle: '',
        logoHref: '#',
        labelText: '',
        labelLinkText: '',
        labelLinkHref: '#',
        noMargin: false,
        navigationItems: [],
        showSearch: false,
        searchProps: {},
        iconsBarItems: [] 
    }

    state = {
        isMinimized: false,
        rect: null
    }

    componentDidMount()
    {
        window.addEventListener('resize', this.handleWindowResize.bind(this));
        window.addEventListener('scroll', this.handleContainerScroll.bind(this));

        this.setRect();
    }

    componentWillUnmount()
    {
        window.removeEventListener('resize', this.handleWindowResize.bind(this));
        window.removeEventListener('scroll', this.handleContainerScroll.bind(this));
    }

    setRect = () =>
    {
        this.setState({ rect: this.container.getBoundingClientRect() });
    }

    handleWindowResize = () =>
    {
        this.setRect();
    }

    handleContainerScroll = (e) =>
    {
        this.setState({ isMinimized: window.pageYOffset > menuHeight });
    }

    render()
    {
        const { appName, activeItem, alwaysAtTop, className, logoSrc, logoTitle, logoHref, labelText, labelLinkText, labelLinkHref,
            noMargin, navigationItems, showSearch, searchProps, iconsBarItems } = this.props;

        const { isMinimized } = this.state;
        const { container, iconsBarContainer, leftCol, middleColBottomRow } = this;

        const mounted = !!(container && iconsBarContainer && leftCol && middleColBottomRow);
        const minimizeSearch = mounted && (container.clientWidth - leftCol.clientWidth - middleColBottomRow.clientWidth) < iconsBarWidth;

        return(
            <div ref={ref => (this.container = ref)} data-test="oc-menu"
                className={`oc-menu ${className} ${alwaysAtTop ? 'at-top' : ''} ${isMinimized ? 'minimized' : ''} ${noMargin ? 'no-margin' : ''}`}>
                <div className="logo-container" ref={ref => (this.leftCol = ref)}>
                    <MenuLogo
                        logoSrc={logoSrc}
                        logoTitle={logoTitle}
                        logoHref={logoHref}
                        labelText={labelText}
                        labelLinkText={labelLinkText}
                        labelLinkHref={labelLinkHref}
                        showLabel={!isMinimized} />
                </div>
                <div className="middle-col">
                    <div className="middle-col-top-row">
                        <h1 className={`app-name ${isMinimized ? 'app-name--minimized' : ''}`} data-test="app-name">
                            {appName}
                        </h1>
                    </div>
                    <div className="middle-col-bottom-row" ref={ref => (this.middleColBottomRow = ref)}>
                    {
                        <div className="navigation-bar">
                            <NavigationBar activeItem={activeItem} navigationItems={navigationItems} />
                        </div>
                    }
                    </div>
                </div>

                <div className="right-col">
                    <div className="icons-bar-container" ref={ref => (this.iconsBarContainer = ref)}>
                        <MenuIconsBar>
                        {
                            showSearch ?
                                <div className="search-container">
                                    <MenuSearch isMinimized={minimizeSearch} { ...searchProps } />
                                </div>
                            : null
                        }
                        {Children.toArray(iconsBarItems)}
                    </MenuIconsBar>
                </div>
            </div>
        </div>
        );
    }
}

export default Menu;
