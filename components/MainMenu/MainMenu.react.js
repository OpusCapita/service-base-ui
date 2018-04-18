import React from 'react';
import PropTypes from 'prop-types';
import ConditionalRenderComponent from '../ConditionalRenderComponent.react';
import { ResetTimer } from '../../system';
import { Menu, MenuIcon, MenuDropdownGrid, Notifications, MenuAccount, MenuSelect } from './Menu';
import translations from './i18n';
import navItems from './data/navItems';

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
            recentNotifications : [ ],
            activeMenuItem : 0,
            navItems : [ ]
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
            items = navItems.supplier[locale];
        else if(customerid)
            items = navItems.customer[locale];

        if(roles && roles.indexOf('admin') > -1)
            items = this.recursiveMergeNavItems(items, navItems.admin[locale])

        return items;
    }

    recursiveMergeNavItems(items, overlays)
    {
        const results = [ ];

        items.forEach(item =>
        {
            const overlay = overlays.find(overlay => overlay.key === item.key);

            if(overlay)
            {
                const overlayCopy = Object.assign({ }, overlay);
                overlayCopy.children = this.recursiveMergeNavItems(item.children || [ ], overlay.children || [ ])

                results.push(overlayCopy);
            }
            else
            {
                results.push(item);
            }
        });

        overlays.forEach(overlay =>
        {
            const found = items.reduce((all, item) => all || item.key === overlay.key, false);

            if(!found)
                results.push(overlay);
        });

        return results;
    }

    loadNavItems()
    {
        const { router } = this.context;

        const filterItem = (item) =>
        {
            if(item.link)
            {
                const url = this.parseUrl(item.link);

                if(url.isExternal)
                    return true;

                const resources = this.context.bouncer.findResource(url.serviceName, url.path, 'GET');

                return resources.length > 0;
            }

            return true;
        }

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
                result['subItems'] = item.children.filter(filterItem).map(mapItem);

                if(result['subItems'].length === 0)
                    result['subItems'] = null;
            }

            return result;
        }

        return this.getNavItems().filter(filterItem).map(mapItem).filter(item => item.href || item.onClick || item.target || item.subItems);
    }

    parseUrl(url)
    {
        const element = document.createElement('a');
        element.href = url;

        const { protocol, hostname, port, pathname, href, search, hash } = element;
        const isExternal = url.startsWith(protocol) || url.startsWith('//');

        let serviceName;
        let path;

        if(!isExternal)
        {
            const firstSlash = pathname.indexOf('/');
            const secondSlash = firstSlash > -1 ? pathname.indexOf('/', firstSlash + 1) : -1;

            if(firstSlash > -1 && secondSlash > firstSlash)
            {
                serviceName = pathname.substr(firstSlash + 1, secondSlash - 1);
                path = pathname.substr(secondSlash);
            }
            else if(firstSlash > -1)
            {
                serviceName = pathname.substr(firstSlash + 1);
                path = '/';
            }
            else
            {
                serviceName = null;
                path = pathname;
            }
        }

        return { protocol, hostname, port, serviceName, path, search, hash, href, isExternal };
    }

    render()
    {
        const { i18n, userData, router } = this.context;
        const { activeMenuItem, newNotifications, recentNotifications, navItems } = this.state;

        const applicationItems = [{
            label : 'Business Network',
            icon : this.getIcon('app_business_network_portal'),
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
                logoSrc={this.logoImage}
                logoTitle="OpusCapita"
                logoHref="http://www.opuscapita.com"
                showSearch={true}
                searchProps={{
                    placeholder : i18n.getMessage('MainMenu.search'),
                    onChange : (e) => this.handleSearch(e)
                }}
                navigationItems={this.loadNavItems()}
                iconsBarItems={[(
                    <MenuIcon
                        svg={this.getIcon('apps')}
                        title={i18n.getMessage('MainMenu.applications')}
                        hideDropdownArrow={true}>
                        <MenuDropdownGrid
                            activeIndex={0}
                            items={applicationItems}/>
                    </MenuIcon>
                ), (
                    <MenuIcon
                        onClick={() => console.log('click!')}
                        svg={this.getIcon('notifications')}
                        supTitle={newNotifications.length}
                        title={i18n.getMessage('MainMenu.notifications')}
                        hideDropdownArrow={true}>
                        <Notifications>
                        </Notifications>
                    </MenuIcon>
                ), (
                    <MenuIcon label={userData.firstname}>
                        <MenuAccount
                        firstName={userData.firstname}
                        lastName={userData.lastname}
                        userName={userData.id}
                        avatarSrc={userData.profileImage || './static/avatar.jpg'}
                        actions={[{
                            label : i18n.getMessage('MainMenu.profile'),
                            onClick : () => this.showProfile()
                        }, {
                            label : i18n.getMessage('MainMenu.logout'),
                            onClick : () => this.handleLogout()
                        }]}
                        bottomElement={(
                            <div>
                                <div className="select-item">
                                    <span><strong>{i18n.getMessage('MainMenu.support')}:</strong> +49 231 3967 350<br /><a href="mailto:customerservice.de@opuscapita.com">customerservice.de@opuscapita.com</a></span>
                                </div>
                                <div className="select-item">
                                    <span><strong>{i18n.getMessage('MainMenu.manual')}:</strong> <a href="#" onClick={e => this.handleManualClick(e)}>{i18n.getMessage('MainMenu.download')}</a></span>
                                </div>

                                <div className="select-item">
                                    <span className="select-item-label">{i18n.getMessage('MainMenu.language')}</span>
                                    <MenuSelect className="select-item-select" defaultValue={userData.languageid} onChange={e => this.handleLanguageChange(e)}>
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
