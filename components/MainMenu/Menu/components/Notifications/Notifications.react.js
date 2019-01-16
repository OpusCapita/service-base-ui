import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Item } from './Item';
import translations from './i18n';
import './Notifications.less';

class Notifications extends Component
{
    static propTypes = {
        items : PropTypes.arrayOf(PropTypes.shape({
            id : PropTypes.any,
            icon : PropTypes.string,
            label : PropTypes.node,
            date : PropTypes.string,
            type : PropTypes.string,
            url :  PropTypes.string
        })),
        onClick : PropTypes.func.isRequired,
        onMarkAll : PropTypes.func.isRequired
    }

    static defaultProps = {
        onClick : () => null,
        onMarkAll : () => null
    }

    static contextTypes = {
        i18n : PropTypes.object.isRequired
    }

    constructor(props, context)
    {
        super(props);

        this.state = {
            items : props.items
        }

        context.i18n.register('Menu.Notifications', translations);
    }

    componentWillReceiveProps(nextProps)
    {
        this.setState({ items : nextProps.items });
    }

    handleItemClick(item)
    {
        this.props.onClick(item);
    }

    handleMarkAllClick(e)
    {
        e.preventDefault();
        this.props.onMarkAll(this.props.items);
    }

    render()
    {
        const { children } = this.props;
        const { items } = this.state;
        const { i18n } = this.context;

        return(
            <div className="oc-notifications">
                <div className="header">{i18n.getMessage('Menu.Notifications.newNotifications')} <a href="#" className="function" onClick={e => this.handleMarkAllClick(e)}><small>{i18n.getMessage('Menu.Notifications.markAllRead')}</small></a><a href="/notification/settings" className="function"><small>{i18n.getMessage('Menu.Notifications.settings')}</small></a></div>
                <div className="items-container">
                    {
                        items && items.length ? items.map((item, i) => <Item key={i} {...item} onClick={item => this.handleItemClick(item)} />)
                            : <Item label={i18n.getMessage('Menu.Notifications.noNewNotifications')} />
                    }
                </div>

                {children}
            </div>
        );
    }
}

export default Notifications;
