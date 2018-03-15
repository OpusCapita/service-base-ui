import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './MenuAccountIcon.less';

class MenuAccountIcon extends Component
{
    static propPropTypes = {
        initials: PropTypes.string,
        avatarSrc: PropTypes.string,
        onClick: PropTypes.func,
        style: PropTypes.object
    }

    static defaultProps = {
        initials: '',
        avatarSrc: '',
        onClick: () => { },
        style: PropTypes.object
    }

    render()
    {
        const { initials, avatarSrc, onClick, style } = this.props;

        return(
            <div className="oc-menu-account-icon" onClick={onClick} style={{ ...style, backgroundImage: `url(${avatarSrc})` }}>
                {avatarSrc ? null : initials}
            </div>
        );
    }
}

export default MenuAccountIcon;
