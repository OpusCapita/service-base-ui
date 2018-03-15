import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './MenuLogo.less';

class MenuLogo extends Component
{
    static propPropTypes = {
        logoSrc: PropTypes.string,
        logoHref: PropTypes.string,
        logoTitle: PropTypes.string,
        labelText: PropTypes.string,
        labelLinkText: PropTypes.string,
        labelLinkHref: PropTypes.string,
        showLabel: PropTypes.bool
    }

    static defaultProps = {
        logoSrc: '',
        logoTitle: '',
        logoHref: '#',
        labelText: '',
        labelLinkText: '',
        labelLinkHref: '#',
        showLabel: true
    }

    render()
    {
        const { logoSrc, logoHref, logoTitle, labelText, labelLinkText, labelLinkHref, showLabel } = this.props;

        return (
            <div className="oc-menu-logo" data-test="oc-menu-logo">
                <a className="link" href={logoHref}><img className="image" title={logoTitle} src={logoSrc} /></a>
                <div className={`label ${showLabel ? '' : 'label--hidden' }`}>
                    <span className="label-text">{labelText}</span>
                    <a className="label-link" href={labelLinkHref}>{labelLinkText}</a>
                </div>
            </div>
        );
    }
}

export default MenuLogo;
