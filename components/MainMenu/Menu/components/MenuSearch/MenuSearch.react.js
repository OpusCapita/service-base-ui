import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './MenuSearch.less';
import { SVG } from '@opuscapita/react-svg';
import MenuIcon from '../MenuIcon';

const searchSVG = require('!!raw-loader!@opuscapita/svg-icons/lib/search.svg');

class MenuSearch extends Component
{
    static propPropTypes = {
        isMinimized: PropTypes.bool,
        onFocus: PropTypes.func,
        placeholder: PropTypes.string,
        onChange: PropTypes.func
    }
    
    static defaultProps = {
        isMinimized: false,
        onFocus: () => {},
        placeholder: '',
        onChange: () => {}
    }

    state = {
        isOpen: false
    }

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

    handleSearchIconClick()
    {
        this.showAutocomplete();
        (this.inputRef && this.inputRef).focus();
    }

    handleInputFocus(e)
    {
        this.showAutocomplete();
        this.props.onFocus(e);
    }

    handleBodyClick(event)
    {
        const clickedOutside = !this.containerRef.contains(event.target);

        if(clickedOutside)
            this.hideAutocomplete();
    }

    handleBodyKeyDown(event)
    {
        // TAB or ESC key
        if(event.which === 9 || event.which === 27)
            this.hideAutocomplete();
    }

    showAutocomplete()
    {
        this.setState({ isOpen: true });
    }

    hideAutocomplete()
    {
        this.setState({ isOpen: false });
    }

    render()
    {
        const { children, isMinimized, onFocus, ...restProps } = this.props;
        const { isOpen } = this.state;

        if(isMinimized)
        {
            return(
                <div
                    ref={ref => this.containerRef = ref}
                    className="oc-menu-search"
                    data-test="oc-menu-search">
                    <div
                        className="search-icon"
                        onClick={this.handleSearchIconClick}>
                        <MenuIcon svg={searchSVG} />
                        {isOpen ? children : null}
                    </div>
                </div>
            );
        }

        return(
            <div
                ref={ref => (this.containerRef = ref)}
                className="oc-menu-search"
                data-test="oc-menu-search">
                <div className="search-container">
                    <div
                        className="search-icon"
                        onClick={this.handleSearchIconClick}>
                        <SVG svg={searchSVG} />
                    </div>
                    <input
                        ref={ref => this.inputRef = ref}
                        className="input"
                        data-test="input"
                        onFocus={this.handleInputFocus}
                        { ...restProps } />
                </div>
                {isOpen ? children : null}
            </div>
        );
    }
}

export default MenuSearch;
