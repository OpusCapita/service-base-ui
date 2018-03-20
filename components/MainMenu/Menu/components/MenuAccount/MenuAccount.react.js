import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MenuAccountIcon from '../MenuAccountIcon';
import { Button } from '@opuscapita/react-buttons';
import './MenuAccount.less';

class MenuAccount extends Component
{
    static propPropTypes = {
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        userName: PropTypes.string,
        initials: PropTypes.string,
        avatarSrc: PropTypes.string,
        onAvatarClick: PropTypes.func,
        actions: PropTypes.oneOf([
        PropTypes.arrayOf(PropTypes.shape({
                label: PropTypes.string,
                svg: PropTypes.string,
                onClick: PropTypes.func
        })), PropTypes.node
        ]),
        bottomElement: PropTypes.node
    };

    static defaultProps = {
        firstName: '',
        lastName: '',
        userName: '',
        initials: '',
        avatarSrc: '',
        onAvatarClick: () => { },
        actions: [ ],
        bottomElement: null
    };

    state = { };

    render()
    {
        const { firstName, lastName, userName, initials, avatarSrc, onAvatarClick, actions, bottomElement } = this.props;

        const actionElements = actions.map((action, i) =>
        {
            const isReactNode = React.isValidElement(action);

            if(isReactNode)
                return action;

            const { label, svg, onClick, ...restProps } = action;

            return(
                <Button
                    key={i}
                    className="action-button"
                    label={label}
                    svg={svg}
                    onClick={e => onClick(e)}
                    contentPosition="before"
                    data-test="action-button"
                    {...restProps} />
            );
        });

        return(
            <div className="oc-menu-account" data-test="oc-menu-account">
                <div className="top-row">
                    <div className="account-icon-container">
                        <MenuAccountIcon
                            initials={initials}
                            avatarSrc={avatarSrc}
                            onClick={onAvatarClick} />
                    </div>
                    <div className="name-container">
                        <div className="full-name">{firstName} {lastName}</div>
                        <div className="user-name">{userName}</div>
                    </div>
                </div>
                <div className="middle-row">
                    <div className="actions-container">
                        {actionElements}
                    </div>
                </div>
                <div className="bottom-row">
                    {bottomElement}
                </div>
            </div>
        );
    }
}

export default MenuAccount;
