import React from 'react';
import PropTypes from 'prop-types';
import ConditionalRenderComponent from '../ConditionalRenderComponent.react';
import { ResetTimer } from '../../system';
import { Menu, MenuIcon, MenuDropdownGrid, Notifications as NotificationsUI , Notification, MenuAccount, MenuSelect } from '@opuscapita/react-navigation';
import translations from './i18n';
import navItems from './data/navItems';
import {Notifications} from '../../api';

class MainMenu extends ConditionalRenderComponent
{
    static propTypes = {
        onLanguageChange : PropTypes.func.isRequired,
        onSearch : PropTypes.func.isRequired
    }

    static defaultProps = {
        onLanguageChange : (locale) => null,
        onSearch : (term) => null
    }

    constructor(props, context)
    {
        super(props);

        this.state = {
            newNotifications : [ ],
            notificationCount: 0,
            activeMenuItem : 0
        }

        const oldPush = context.router.push;

        context.router.push = (path) =>
        {
            const location = this.context.router.location;

            if(path.startsWith(location.basename))
                oldPush.call(this.context.router, path.substr(location.basename.length));
            else
                document.location.replace(path);
        }

        context.i18n.register('MainMenu', translations);

        this.logoImage = 'data:image/svg+xml,' + encodeURIComponent(require('!!raw-loader!./img/oc-logo-white.svg'));
        this.searchTimer = new ResetTimer();

        this.notifications = new Notifications();
        this.loadNotifications();
    }


    loadNotifications(){
        return Promise.all([
            this.Notifications.getNotificationCount(),
            this.Notifications.getNotifications(5)
        ])
        .then(values => this.setState({newNotifications : values[1], notificationCount : values[0]}));
    }

    notificationClicked(args,sender){
        return this.Notifications.acknowledge(args)
            .then(() => this.loadNotifications());
    }


    componentDidMount()
    {
        const { router, routes } = this.context;
        const location = router.location;

        this.switchMenuItemByPath(location.basename + location.pathname);
        router.listen(item => this.switchMenuItemByPath(item.basename + item.pathname));
    }

    switchMenuItemByPath(pathname)
    {
        if(pathname.endsWith('/'))
            pathname = pathname.substr(0, pathname.length - 1);

        const navItems = this.getNavItems();
        const findPath = (items) => items.reduce((all, item) => all || item.link === pathname || (item.children && findPath(item.children)), false);

        let activeMenuItem = 0;

        for(const i in navItems)
        {
            if(findPath([ navItems[i] ]))
            {
                activeMenuItem = parseInt(i);
                break;
            }
        }

        this.setState({ activeMenuItem });
    }

    handleSearch(e)
    {
        const value = e.target.value;
        this.searchTimer.reset(() => this.props.onSearch(value), 500);
    }

    showProfile()
    {
        this.context.router.push(`/bnp/users/${this.context.userData.id}`);
    }

    handleLogout()
    {
        const { i18n } = this.context;

        const title = i18n.getMessage('MainMenu.logoutDialog.title');
        const message = i18n.getMessage('MainMenu.logoutDialog.message');
        const buttons = { 'no' : i18n.getMessage('System.no'), 'yes' : i18n.getMessage('System.yes'), };
        const onButtonClick = (button) =>
        {
            if(button === 'yes')
                document.location.replace('/auth/logout?backTo=/bnp');
        }

        this.context.showModalDialog(title, message, onButtonClick, buttons);
    }

    handleManualClick(e)
    {
        e.preventDefault();

        const manualName = this.context.i18n.getMessage('MainMenu.manualName');
        const url = '/blob/public/api/opuscapita/files/public/docs/' + manualName;

        document.location.replace(url);
    }

    handleLanguageChange(e)
    {
        this.props.onLanguageChange(e.target.value);
    }

    getIcon(icon)
    {
        return require(`!!raw-loader!@opuscapita/svg-icons/lib/${icon}.svg`);
    }

    getNavItems()
    {
        const { supplierid, customerid, roles } = this.context.userData;
        const { locale } = this.context;

        let items = [ ];

        if(supplierid)
            items = navItems['supplier'][locale];
        else if(customerid)
            items = navItems['customer'][locale];
        else if(roles && roles.indexOf('admin') > -1)
            items = navItems['admin'][locale];
        else
            items = [ ];

        return items;
    }

    mapNavItems()
    {
        const { router } = this.context;

        const mapItem = (item) =>
        {
            const result = { children : item.label };

            if(item.link)
            {
                if(item.target)
                {
                    result['href'] = item.link;
                    result['target'] = item.target;
                }
                else
                {
                    result['onClick'] = () => router.push(item.link);
                }
            }
            else if(item.children)
            {
                result['subItems'] = item.children.map(mapItem);
            }

            return result;
        }

        return this.getNavItems().map(mapItem);
    }

    render()
    {
        const { i18n, userData, router } = this.context;
        const { activeMenuItem, newNotifications,notificationCount } = this.state;

        const applicationItems = [{
            label : 'Business Network',
            svg : this.getIcon('app_business_network_portal'),
            onClick : () => router.push('/bnp')
        }];
        /*const applicationItems = [{
            label : 'Analytics',
            svg : this.getIcon('link')
        }, {
            label : 'Business Network Portal',
            svg : this.getIcon('app_business_network_portal')
        }, {
            label : 'Catalog Portal',
            svg : this.getIcon('app_catalog_portal')
        }, {
            label : 'Contracts',
            svg : this.getIcon('app_contracts')
        }];*/

        return(
            <Menu
                appName="Business Network"
                activeItem={activeMenuItem}
                alwaysAtTop={true}
                className="oc-menu--opuscapita-dark-theme"
                logoSrc={this.logoImage}
                logoTitle="OpusCapita"
                logoHref="http://www.opuscapita.com"
                showSearch={true}
                searchProps={{
                    placeholder : i18n.getMessage('MainMenu.search'),
                    onChange : (e) => this.handleSearch(e)
                }}
                navigationItems={this.mapNavItems()}
                iconsBarItems={[(
                    <MenuIcon
                        svg={this.getIcon('apps')}
                        title={i18n.getMessage('MainMenu.applications')}
                        hideDropdownArrow={true}>
                        <MenuDropdownGrid
                            activeItem={0}
                            items={applicationItems}/>
                    </MenuIcon>
                ), (
                    <MenuIcon
                        onClick={() => console.log('click!')}
                        svg={notificationCount > 0 ?this.getIcon('notifications_active'):this.getIcon('notifications')}
                        supTitle={notificationCount}
                        title={i18n.getMessage('MainMenu.notifications')}
                        hideDropdownArrow={true}>
                        <NotificationsUI>
                            <div className="oc-notifications__header">{i18n.getMessage('MainMenu.newNotifications')}</div>
                            {
                                newNotifications && newNotifications.length ?
                                newNotifications.map(item => (<Notification key={item.id} data-key={item.id} onClick={this.notificationClicked.bind(this,item.id)} svg={this.getIcon('info')} svgClassName="fill-info" message={item.title} dateTime={i18n.formatDateTime(item.changedOn)}/>))
                                :
                                <div className="oc-notification">
                                    <div className="oc-notification__text-contaniner">
                                        <div className="oc-notification__message">
                                            <span>{i18n.getMessage('MainMenu.noNewNotifications')}</span>
                                        </div>
                                    </div>
                                </div>
                            }
                        </NotificationsUI>
                    </MenuIcon>
                ), (
                    <MenuIcon label={userData.firstname}>
                        <MenuAccount
                        firstName={userData.firstname}
                        lastName={userData.lastname}
                        userName={userData.id}
                        avatarSrc="./static/avatar.jpg"
                        actions={[{
                            label : i18n.getMessage('MainMenu.profile'),
                            onClick : () => this.showProfile()
                        }, {
                            label : i18n.getMessage('MainMenu.logout'),
                            onClick : () => this.handleLogout()
                        }]}
                        bottomElement={(
                            <div>
                                <div className="oc-menu-account__select-item">
                                    <span><strong>{i18n.getMessage('MainMenu.support')}:</strong> +49 231 3967 350<br /><a href="mailto:customerservice.de@opuscapita.com">customerservice.de@opuscapita.com</a></span>
                                </div>
                                <div className="oc-menu-account__select-item">
                                    <span><strong>{i18n.getMessage('MainMenu.manual')}:</strong> <a href="#" onClick={e => this.handleManualClick(e)}>{i18n.getMessage('MainMenu.download')}</a></span>
                                </div>

                                <div className="oc-menu-account__select-item">
                                    <span className="oc-menu-account__select-item-label">{i18n.getMessage('MainMenu.language')}</span>
                                    <MenuSelect className="oc-menu-account__select-item-select" defaultValue={userData.languageid} onChange={e => this.handleLanguageChange(e)}>
                                        <option value="en">{i18n.getMessage('MainMenu.laguage.english')}</option>
                                        <option value="de">{i18n.getMessage('MainMenu.laguage.german')}</option>
                                    </MenuSelect>
                                </div>
                            </div>
                        )}/>
                    </MenuIcon>
                )]}/>
        )
    }
}

export default MainMenu;
