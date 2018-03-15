import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Item } from './Item';
import translations from './i18n';
import './Notifications.less';

class Notifications extends Component
{
    static propTypes = {
        items : PropTypes.arrayOf(PropTypes.shape({
            icon : PropTypes.string,
            label : PropTypes.node,
            date : PropTypes.string,
            type : PropTypes.string
        }))
    }

    static contextTypes = {
        i18n : PropTypes.object.isRequired
    }

    constructor(props, context)
    {
        super(props);

        context.i18n.register('Menu.Notifications', translations);
    }

    render()
    {
        const { items, children } = this.props;
        const { i18n } = this.context;

        return(
            <div className="oc-notifications">
                <div className="header">{i18n.getMessage('Menu.Notifications.newNotifications')}</div>
                <div className="items-container">
                    {
                        items && items.length ?
                            items.map((item, i) => <Item key={i} {...item} />)
                        : <Item label={i18n.getMessage('Menu.Notifications.noNewNotifications')} />
                    }
                </div>

                {children}
            </div>
        );
    }
}

export default Notifications;
