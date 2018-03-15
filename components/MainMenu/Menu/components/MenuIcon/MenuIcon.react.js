
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TitledButton } from '@opuscapita/react-buttons';
import { SVG } from '@opuscapita/react-svg';
import './MenuIcon.less';

const dropdownSVG = require('!!raw-loader!@opuscapita/svg-icons/lib/arrow_drop_down.svg');

class MenuIcon extends Component
{
    static propPropTypes = {
        svg: PropTypes.string,
        supTitle: PropTypes.string,
        title: PropTypes.string,
        label: PropTypes.string,
        hideDropdownArrow: PropTypes.bool,
        onClick: PropTypes.func
    }

    static defaultProps = {
        svg: '',
        supTitle: '',
        label: '',
        title: '',
        hideDropdownArrow: false,
        onClick: () => { }
    }

    state = {
        isOpen: false
    }

    componentDidMount()
    {
        document.body.addEventListener('click', this.handleBodyClick.bind(this));
        document.body.addEventListener('keydown', this.handleBodyKeyDown.bind(this));
    }

    shouldComponentUpdate(nextProps, nextState)
    {
        return this.props.svg !== nextProps.svg ||
            this.props.supTitle !== nextProps.supTitle ||
            this.props.title !== nextProps.title ||
            this.props.label !== nextProps.label ||
            this.props.hideDropdownArrow !== nextProps.hideDropdownArrow ||
            this.state.isOpen !== nextState.isOpen;
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
            this.hideChildren();
    }

    handleBodyKeyDown(event)
    {
        // TAB or ESC key
        if(event.which === 9 || event.which === 27)
            this.hideChildren();
    }

    showChildren()
    {
        this.setState({ isOpen: true });
    }

    hideChildren()
    {
        this.setState({ isOpen: false });
    }

    handleClick()
    {
        if(this.state.isOpen)
            this.hideChildren();
        else
            this.showChildren();

        this.props.onClick();
    }

    render()
    {
        const { svg, supTitle, title, label, hideDropdownArrow, onClick, children, ...restProps } = this.props;
        const { isOpen } = this.state;
        const showDropdownArrow = children && !hideDropdownArrow;

        return(
            <div ref={ref => (this.containerRef = ref)} className="oc-menu-icon" onClick={() => this.handleClick()} {...restProps}>
                <div className="icon-container">
                    <TitledButton
                        className={`button ${showDropdownArrow ? 'button--with-dropdown' : ''} ${supTitle ? 'button--with-suptitle' : ''} ${'button--light-overlay'}`}
                        svg={svg}
                        title={isOpen ? '' : title}
                        label={label}
                        contentPosition="before" />
                    {supTitle ?  <div className="sup-title">{supTitle}</div> : null}
                    {showDropdownArrow ? <div className="dropdown-icon"><SVG svg={dropdownSVG} /></div> : null}
                    {children && isOpen ? <div className="children-arrow"></div> : null}
                </div>
            {
                children && isOpen ?
                    <div className={` sub-items-container ${showDropdownArrow ? 'sub-items-container--with-dropdown' : ''}`} onClick={e => e.stopPropagation()}>
                        {children}
                    </div>
                    : null
            }
          </div>
        );
    }
}

export default MenuIcon;
