import React from 'react';
import PropTypes from 'prop-types';
import ConditionalRenderComponent from '../ConditionalRenderComponent.react';
import ModalDialog from '../ModalDialog.react';
import { ResetTimer } from '../../system';
import { Menu, MenuIcon, MenuDropdownGrid, Notifications, MenuAccount, MenuSelect } from './Menu';
import { Users as UsersApi, Auth as AuthApi, Notifications as NotificationsApi } from '../../api';
import translations from './i18n';
import navItems from './data/navItems';
import './MainMenu.css'

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
            recentNotifications : [ ],
            activeMenuItem : 0,
            navItems : [ ],
            tenantSwitchMode : ''
        }

        this.usersApi = new UsersApi();
        this.authApi = new AuthApi();
        this.notificationsApi = new NotificationsApi();

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

        this.BusinessPartnerDropdown = context.loadComponent({
            serviceName: 'business-partner',
            moduleName: 'business-partner-autocomplete',
            jsFileName: 'business-partner-autocomplete-bundle'
        });
    }

    componentDidMount()
    {
        const { router, userData, bouncer } = this.context;
        const location = router.location;

        this.loadNotifications();
        this.switchMenuItemByPath(location.basename + location.pathname);

        const displayInvoiceIcon = bouncer.getUserResourceGroups('invoice').length > 0;
        const displayTntIcon = bouncer.getUserResourceGroups('tnt').length > 0;
        const displayArchiveIcon = bouncer.getUserResourceGroups('archive').length > 0;
        const displayReportingIcon = bouncer.getUserResourceGroups('reporting').length > 0;
        
        this.setState({ displayInvoiceIcon, displayTntIcon, displayArchiveIcon, displayReportingIcon });

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

        const { supplierid, languageid } = this.context.userData;
        const manualName = (supplierid ? "SupplierManual_" : "BuyerManual_") + languageid + ".pdf";
        const url = '/blob/public/api/opuscapita/files/public/docs/' + manualName;

        window.open(url, '_blank');
    }

    handleLanguageChange(e)
    {
        if(this.accountIcon)
            this.accountIcon.hideChildren();

        this.props.onLanguageChange(e.target.value);
    }

    showSwitchTenantDialog()
    {
        this.setState({ tenantSwitchMode : '' }, () => this.switchTenantModal.show());
    }

    handleTenantSwitch(button)
    {
        if(button === 'proceed')
        {
            const { tenantSwitchMode, tenantSwitchValue } = this.state;
            const { id } = this.context.userData;
            const customerId = tenantSwitchMode === 'customer' ? tenantSwitchValue.id : null;
            const supplierId = tenantSwitchMode === 'supplier' ? tenantSwitchValue.id : null;

            if(tenantSwitchValue && (customerId || supplierId))
            {
                this.context.showSpinner();

                this.usersApi.updateUser(id, { customerId, supplierId }).then(() => this.authApi.refreshIdToken())
                    .then(() => document.location.reload(true)).catch(e => this.context.showNotification(e.message, 'error', 10));
            }
            else
            {
                this.context.showNotification(this.context.i18n.getMessage('MainMenu.tenantSwitch.generalError'), 'warning');
            }
        }

        this.setState({ tenantSwitchMode : '', tenantSwitchValue : '' });
    }

    getIcon(icon)
    {
        return require(`!!raw-loader!@opuscapita/svg-icons/lib/${icon}.svg`);
    }

    getNavItems()
    {
        const { businessPartner, roles } = this.context.userData;
        const { locale, environment } = this.context;

        let items = [ ];

        if(businessPartner.issupplier)
            items = navItems.supplier[locale] || navItems.supplier['en'];
        else if(businessPartner.iscustomer)
            items = navItems.customer[locale] || navItems.customer['en'];

        if(roles && roles.indexOf('admin') > -1)
            items = this.recursiveMergeNavItems(items, navItems.admin[locale] || navItems.admin['en'])

        return items.filter(item => !item.environments || item.environments.includes(environment));
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

                const resources = this.context.bouncer.findResources(url.serviceName, url.path, 'GET');

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

    loadNotifications()
    {
        return this.notificationsApi.getNotifications('new').then(items =>
        {
            const notifications = items.map(item =>
            {
                return {
                    id : item.id,
                    type : 'info',
                    date : this.context.i18n.formatDateTime(item.createdOn),
                    label : item.title,
                    icon : this.getIcon('info'),
                    url : item.link
                };
            });

            this.setState({ notifications });
        })
        .catch(e => this.context.showNotification(e.message, 'error', 10));
    }

    handleNotificationClick(item)
    {
        this.notificationsApi.acknowledgeNotification(item.id).then(() => document.location = item.url)
            .catch(e => this.context.showNotification(e.message, 'error', 10));
    }

    handleMarkAllNotifications(items)
    {
        Promise.all(items.map(item => this.notificationsApi.acknowledgeNotification(item.id)))
            .then(() => this.loadNotifications())
            .catch(e => this.context.showNotification(e.message, 'error', 10));
    }

    render()
    {
        const { i18n, userData, userProfile, router } = this.context;
        const { activeMenuItem, displayInvoiceIcon, displayTntIcon, displayArchiveIcon, displayReportingIcon, tenantSwitchMode, tenantSwitchValue, notifications } = this.state;
        const tenantId = userData.customerid ? `c_${userData.customerid}` : `s_${userData.supplierid}`;
        const tenantProfileLink = userData.customerid ? '/bnp/buyerInformation' : (userData.supplierid ? '/bnp/supplierInformation' : null);
        const profileImageLink = userProfile.profileImagePath ? `/blob/public/api/${tenantId}/files/${userProfile.profileImagePath}` : './static/avatar.jpg';

        const actions = [ {
            label : i18n.getMessage('MainMenu.profile'),
            onClick : () => this.showProfile()
        }, {
            label : i18n.getMessage('MainMenu.logout'),
            onClick : () => this.handleLogout()
        } ];

        if(userData.roles.includes('admin') || userData.roles.includes('impersonator'))
        {
            actions.push({
                label : i18n.getMessage('MainMenu.switchTenant'),
                onClick : () => this.showSwitchTenantDialog()
            });
        }

        const applicationItems = [{
            label : 'Business Network',
            icon : this.getIcon('app_business_network_portal'),
            onClick : () => router.push('/bnp'),
            id : '/bnp'
        }];

        if(displayInvoiceIcon)
        {
            applicationItems.push({
                label : 'Invoice',
                icon : this.getIcon('app_invoice'),
                onClick : () => router.push('/invoice'),
                id : '/invoice'
            });
        }

        if(displayTntIcon)
        {
            applicationItems.push({
                label : 'Track & Trace',
                icon : this.getIcon('import_export'),
                onClick : () => router.push('/tnt'),
                id : '/tnt'
            });
        }

        if(displayArchiveIcon)
        {
            applicationItems.push({
                label : 'Archive',
                icon : this.getIcon('folder_open'),
                onClick : () => router.push('/archive'),
                id : '/archive'
            });
        }

        if(displayReportingIcon)
        {
            applicationItems.push({
                label : 'Reporting',
                icon : this.getIcon('show_chart'),
                onClick : () => router.push('/reporting'),
                id : '/reporting'
            });
        }

        const activeAppIndex = applicationItems.findIndex(item => router.location.basename.startsWith(item.id));

        return (
            <div>
                <Menu
                    appName="Business Network"
                    activeItem={activeMenuItem}
                    alwaysAtTop={true}
                    logoSrc={this.logoImage}
                    logoTitle="OpusCapita"
                    logoHref="/bnp"
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
                                activeIndex={activeAppIndex}
                                items={applicationItems}/>
                        </MenuIcon>
                    ), (
                        <MenuIcon
                            svg={this.getIcon('notifications')}
                            supTitle={notifications && notifications.length}
                            title={i18n.getMessage('MainMenu.notifications')}
                            hideDropdownArrow={true}>
                            <Notifications
                                items={notifications}
                                onClick={item => this.handleNotificationClick(item)}
                                onMarkAll={items => this.handleMarkAllNotifications(items)} />
                        </MenuIcon>
                    ), (
                        <MenuIcon ref={node => this.accountIcon = node} label={userData.firstname}>
                            <MenuAccount
                            firstName={userData.firstname}
                            lastName={userData.lastname}
                            userName={userData.id}
                            tenantName={userData.tenantname}
                            tenantProfileLink={tenantProfileLink}
                            avatarSrc={profileImageLink}
                            actions={actions}
                            bottomElement={(
                                <div>
                                    <div className="row horizontal-gap">
                                        <div className="col-xs-3">
                                            {i18n.getMessage('MainMenu.manual')}
                                        </div>
                                        <div className="col-xs-9">
                                            <a href="#" onClick={e => this.handleManualClick(e)}>{i18n.getMessage('MainMenu.download')}</a>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-xs-3">
                                            {i18n.getMessage('MainMenu.support')}
                                        </div>
                                        <div className="col-xs-9">
                                            {i18n.getMessage('MainMenu.support.PhoneNumber')}
                                        </div>
                                    </div>
                                    <div className="row horizontal-gap">
                                        <div className="col-xs-3"></div>
                                        <div className="col-xs-9">
                                            <a href={`mailto:${i18n.getMessage('MainMenu.support.EmailAddress')}`}>{i18n.getMessage('MainMenu.support.EmailAddress')}</a>
                                        </div>
                                    </div>

                                    <div className="select-item">
                                        <span className="select-item-label">{i18n.getMessage('MainMenu.language')}</span>
                                        <MenuSelect className="select-item-select" defaultValue={userData.languageid} onChange={e => this.handleLanguageChange(e)}>
                                            <option value="de">Deutsch</option>
                                            <option value="en">English</option>
                                            <option value="es">Español</option>
                                            <option value="fr">Français</option>
                                            <option value="it">Italiano</option>
                                            <option value="pt">Português</option>
                                            <option value="fi">Suomi</option>
                                            <option value="sv">Svenska</option>
                                        </MenuSelect>
                                    </div>
                                </div>
                            )}/>
                        </MenuIcon>
                    )]}/>
                <ModalDialog title={i18n.getMessage('MainMenu.tenantSwitch.modal.title')} buttons={{ proceed : i18n.getMessage('MainMenu.tenantSwitch.modal.button.proceed'), cancel : i18n.getMessage('System.cancel') }} buttonsDisabled={tenantSwitchValue ? [ ] : [ 'proceed' ]} onButtonClick={btn => this.handleTenantSwitch(btn)} ref={node => this.switchTenantModal = node}>
                    <div className="tenant-switch">
                        <div className="row">
                            <div className="col-lg-12">
                                <p>{i18n.getMessage('MainMenu.tenantSwitch.modal.text', userData)}</p>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12">
                                <select onChange={e => this.setState({ tenantSwitchMode : e.target.value, tenantSwitchValue : '' })} value={tenantSwitchMode}>
                                    <option value="" disabled>{i18n.getMessage('MainMenu.tenantSwitch.modal.label.placeholder')}</option>
                                    <option value="customer">{i18n.getMessage('MainMenu.tenantSwitch.modal.label.customer')}</option>
                                    <option value="supplier">{i18n.getMessage('MainMenu.tenantSwitch.modal.label.supplier')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12">
                                { tenantSwitchMode === 'customer' && <this.BusinessPartnerDropdown onChange={value => this.setState({ tenantSwitchValue : value })} onFilter={bPartner => Boolean(bPartner.isCustomer)} /> }
                                { tenantSwitchMode === 'supplier' && <this.BusinessPartnerDropdown onChange={value => this.setState({ tenantSwitchValue : value })} onFilter={bPartner => Boolean(bPartner.isSupplier)} /> }
                         </div>
                        </div>
                    </div>
                </ModalDialog>
            </div>
        )
    }
}

export default MainMenu;
