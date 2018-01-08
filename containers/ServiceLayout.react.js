import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Router, Route, useRouterHistory } from 'react-router';
import { createHistory } from 'history';
import { ModalDialog, LogInForm } from '../components';
import NotificationSystem from 'react-notification-system';
import { I18nManager } from '@opuscapita/i18n';
import InnerLayout from './InnerLayout.react';
import { Auth, Users } from '../api';
import { ResetTimer } from '../system';
import { AjaxExtender } from '../system/ui';
import translations from './i18n';
import systemTranslations from './i18n/system';
import formatters from './i18n/formatters';
import ajax from 'superagent';

import './static/css/bootstrap-3.3.7.min.css';
import './static/css/ocui-bootstrap-bundle-0.1.2.min.css';
import './static/js/bootstrap-3.3.7.min.js';
import './static/css/Main.min.css';

class ServiceLayout extends Component
{
    static propTypes = {
        serviceName : PropTypes.string.isRequired,
        component : PropTypes.func,
        size : PropTypes.oneOf([ null, '', 'default', 'full-width', 'full-screen' ]),
    }

    static childContextTypes = {
        router : PropTypes.object.isRequired,
        showNotification : PropTypes.func.isRequired,
        hideNotification : PropTypes.func.isRequired,
        clearNotifications : PropTypes.func.isRequired,
        showModalDialog: PropTypes.func.isRequired,
        hideModalDialog: PropTypes.func.isRequired,
        userData : PropTypes.object.isRequired,
        userProfile : PropTypes.object.isRequired,
        refreshUserData : PropTypes.func.isRequired,
        refreshUserProfile : PropTypes.func.isRequired,
        i18n : PropTypes.object.isRequired,
        locale : PropTypes.string.isRequired,
        setLocale : PropTypes.func.isRequired,
        showSpinner : PropTypes.func.isRequired,
        hideSpinner : PropTypes.func.isRequired,
        setPageTitle : PropTypes.func.isRequired,
        logOutUser : PropTypes.func.isRequired,
        setLayoutSize : PropTypes.func.isRequired,
        getLayoutSize : PropTypes.func.isRequired,
        showLogInDialog : PropTypes.func.isRequired,
        hideLogInDialog : PropTypes.func.isRequired
    };

    constructor(props)
    {
        super(props);

        this.fixDocumentOrigin();

        this.state = {
            isReady : false,
            userData : null,
            userProfile : null,
            i18n : this.getI18nManager('en'),
            locale : 'en',
            size : this.normalizeLayoutSize(props.size)
        }

        this.notificationSystem = null;
        this.modalDialog = null;
        this.logInDialog = null;
        this.logInForm = null;
        this.router = null;
        this.progressValue = 0;
        this.ajaxExtender = null;
        this.registeredTranslations = { };
        this.history = useRouterHistory(createHistory)({ basename : '/' + props.serviceName });
        this.authApi = new Auth();
        this.usersApi = new Users();
        this.systemSpinnerCount = 0;

        this.watchAjax();
        this.watchSession();
    }

    componentWillMount()
    {
        this.refreshUserData();
    }

    componentDidMount()
    {
        this.showSystemSpinner();
    }

    getI18nManager(locale)
    {
        const manager = new I18nManager({ locale, fallbackLocale : 'en', localeFormattingInfo : formatters });
        const oldRegister = manager.register.bind(manager);

        manager.register('ServiceLayout', translations);
        manager.register('System', systemTranslations);

        for(const key in this.registeredTranslations)
            manager.register(key, this.registeredTranslations[key]);

        manager.register = (...args) =>
        {
            this.registeredTranslations[args[0]] = args[1];
            return oldRegister(...args);
        }

        return manager;
    }

    getChildContext()
    {
        return {
            router : this.router || { },
            showNotification : this.showNotification.bind(this),
            hideNotification : this.hideNotification.bind(this),
            clearNotifications : this.clearNotifications.bind(this),
            showModalDialog: this.showModalDialog.bind(this),
            hideModalDialog: this.hideModalDialog.bind(this),
            userData : this.state.userData || { },
            userProfile : this.state.userProfile || { },
            refreshUserData : this.refreshUserData.bind(this),
            refreshUserProfile : this.refreshUserData.bind(this),
            i18n : this.state.i18n,
            locale : this.state.locale,
            setLocale : this.setLocale.bind(this),
            showSpinner : this.showSystemSpinner.bind(this),
            hideSpinner : this.hideSystemSpinner.bind(this),
            setPageTitle : this.setPageTitle.bind(this),
            logOutUser : this.logOutUser.bind(this),
            setLayoutSize : this.setLayoutSize.bind(this),
            getLayoutSize : this.getLayoutSize.bind(this),
            showLogInDialog : this.showLogInDialog.bind(this),
            hideLogInDialog : this.hideLogInDialog.bind(this)
        }
    }

    fixDocumentOrigin()
    {
        const origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? (':' + window.location.port) : '');

        if(!window.origin)
            window.origin = origin;
        if(!window.location.origin)
            window.location.origin = origin;
        if(!document.origin)
            document.origin = origin;
        if(!document.location.origin)
            document.location.origin = origin;
    }

    setLocale(locale)
    {
        const id = this.state.userData.id;

        return this.usersApi.updateUserProfile(id, { languageId : locale })
            .then(() => this.refreshUserData());
    }

    refreshUserData()
    {
        this.showSystemSpinner();

        return this.authApi.refreshIdToken().then(() => this.authApi.getUserData())
        .then(userData =>
        {
            return this.usersApi.getUserProfile(userData.id)
                .then(userProfile => ({ userData, userProfile }));
        })
        .then(({ userData, userProfile }) =>
        {
            this.setState({
                userData,
                userProfile,
                locale : userData.languageid,
                i18n : this.getI18nManager(userData.languageid)
            })
        })
        .catch(e => this.showNotification(e.message, 'error', 10))
        .finally(() => this.hideSystemSpinner());
    }

    showNotification(message, level = 'info', duration = 4, buttonLabel = null, onButtonClick = null)
    {
        if(this.notificationSystem)
        {
            const action = buttonLabel && {
                label : buttonLabel,
                callback : onButtonClick
            }

            return this.notificationSystem.addNotification({ message, level, autoDismiss : duration, position : 'tr', action });
        }
    }

    hideNotification(handle, duration = 1)
    {
        if(this.notificationSystem)
            setTimeout(() => this.notificationSystem.removeNotification(handle), duration * 1000);
    }

    clearNotifications()
    {
        if(this.notificationSystem)
            this.notificationSystem.clearNotifications();
    }

    showModalDialog(title, message, onButtonClick, buttons)
    {
        if(this.modalDialog)
            this.modalDialog.show(title, message, onButtonClick, buttons);
    }

    hideModalDialog()
    {
        if(this.modalDialog)
            this.modalDialog.hide();
    }

    watchAjax()
    {
        const spinnerTimer = new ResetTimer();
        const onRequestStart = (requestId) => null;
        const onProgress = (progress) =>
        {
            this.setSystemProgressValue(progress);
            spinnerTimer.reset(() => this.setSystemProgressValue(0), 2000);
        }

        const onRequestEnd = (err, requestId, req) =>
        {
            if(err)
                return this.showSystemError(err.message);
            //else if(req.status === 401)
                //this.showLogInDialog(true);
        };

        this.ajaxExtender = new AjaxExtender({ onRequestStart, onProgress, onRequestEnd });
        this.ajaxExtender.run();
    }

    watchSession()
    {
        let expireNoitification = null;

        setInterval(() =>
        {
            this.authApi.getUserData().then(userData =>
            {
                if(userData && typeof userData === 'object')
                {
                    const now = new Date();
                    const secondsRemaining = userData.exp - Math.floor(now / 1000) + (now.getTimezoneOffset() * 60);

                    if(!expireNoitification && secondsRemaining <= 300)
                    {
                        const message = this.state.i18n.getMessage('Main.notification.sessionExpiring');
                        const buttonLabel = this.state.i18n.getMessage('Main.notification.button.renewSession');
                        const buttonClick = () =>
                        {
                            this.authApi.refreshIdToken().then(() => this.refreshUserData());
                            expireNoitification = null;
                        }

                        expireNoitification = this.showNotification(message, 'warning', secondsRemaining, buttonLabel, buttonClick);
                    }
                    else if(expireNoitification && secondsRemaining > 300)
                    {
                        expireNoitification = this.hideNotification(expireNoitification);
                    }
                }
                else if(this.state.userData)
                {
                    document.location.reload(true);
                }
            })
            .catch(e => null);

        }, 30000);
    }

    showSystemError(message)
    {
        const errorEl = $('#system-error-message');
        errorEl.find('.system-error-text').text(message);

        if(!errorEl.is(':visible'))
            errorEl.slideDown(500);
    }

    hideSystemError()
    {
        const errorEl = $('#system-error-message');

        if(errorEl.is(':visible'))
            errorEl.slideUp(500);
    }

    setSystemProgressValue(value)
    {
        this.progressValue = value <= 0 ? 0 : (value > 1 ? 1 : value);
        const progressBar = $('#system-progress-bar .progress-bar');

        if(this.progressValue === 0)
            progressBar.css({ transition : 'none' });
        else
            progressBar.css({ transition : 'width 1s ease 0s' })

        progressBar.css({ width : (this.progressValue * 100) + '%' });
    }

    incrementSystemProgressValue(value)
    {
        this.setSystemProgressValue(this.progressValue + value);
    }

    showSystemSpinner()
    {
        if(this.systemSpinnerCount === 0)
            $('#system-spinner').fadeIn();

        this.systemSpinnerCount++;
    }

    hideSystemSpinner()
    {
        if(this.systemSpinnerCount > 0)
        {
            if(this.systemSpinnerCount === 1)
                $('#system-spinner').fadeOut();

            this.systemSpinnerCount--;
        }
    }

    setPageTitle(title)
    {
        $('#system-title').html(title);
    }

    logOutUser(backToUrl)
    {
        if(backToUrl)
            document.location.replace(`/auth/logout?backTo=${backToUrl}`);
        else
            document.location.replace('/auth/logout');
    }

    normalizeLayoutSize(size)
    {
        size = size && size.toLocaleLowerCase();

        if(size === 'full-width' || size === 'full-screen')
            return size;
        else if(!size || size === '' || size === 'default')
            return 'default';
        else
            throw new Error('Invalid size value provided.');
    }

    setLayoutSize(size)
    {
        this.setState({ size : this.normalizeLayoutSize(size) });
    }

    getLayoutSize()
    {
        return this.state.size;
    }

    showLogInDialog()
    {
        const { i18n } = this.state;
        const buttons = {
            ok : i18n.getMessage('ServiceLayout.LogInDialog.button.signIn'),
            cancel : i18n.getMessage('System.cancel')
        }

        const onButtonClick = (button) =>
        {
            if(button === 'ok')
                return this.logInForm.doLogIn();
            else
                this.logInForm.clearForm();
        }

        this.logInDialog.show(i18n.getMessage('ServiceLayout.LogInDialog.title'), undefined, onButtonClick, buttons);
        setTimeout(() => this.logInForm.focus(), 500);
    }

    hideLogInDialog()
    {
        this.logInDialog.hide();
        this.logInForm.clearForm();
    }

    setApplicationReady(isReady)
    {
        if(this.state.isReady !== isReady)
            this.setState({ isReady });
    }

    render()
    {
        const { isReady, i18n, userData, userProfile, size } = this.state;

        const applicationIsReady = isReady || (i18n && userData && userProfile && true);
        const contentWidthClass = size === 'default' ? 'col-xs-12 col-sm-offset-1 col-sm-10' : 'col-xs-12';
        const InnerComponent = this.props.component || ((props) => (<div>{props.children}</div>));

        if(applicationIsReady)
            setTimeout(() => this.hideSystemSpinner(), 1000);

        return(
            <div id="react-root">
                {
                    applicationIsReady &&
                    <div id="main">
                        <div id="system-error-message" className="alert alert-warning text-center alert-dismissable">
                            <a href="#" className="close" data-dismiss="alert" aria-label="close" onClick={e => { e.preventDefault(); this.hideSystemError(); }}>×</a>
                            <strong>{i18n.getMessage('Main.systemError.title')}</strong>: <span className="system-error-text"></span>
                        </div>

                        {
                            size === 'full-screen' ? null :
                            <div id="system-progress-bar" className="progress">
                                <div className="progress-bar oc-progress-bar" role="progressbar"></div>
                            </div>
                        }
                        <section className="content">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className={contentWidthClass}>
                                        <Router ref={node => this.router = node} history={this.history}>
                                            <Route component={InnerLayout}>
                                                <Route component={InnerComponent}>
                                                    {this.props.children}
                                                </Route>
                                            </Route>
                                        </Router>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <NotificationSystem ref={node => this.notificationSystem = node} />
                        <ModalDialog ref={node => this.modalDialog = node} />
                        <ModalDialog ref={node => this.logInDialog = node}>
                            <p>{i18n.getMessage('ServiceLayout.LogInDialog.description')}<br />&nbsp;</p>
                            <LogInForm
                                ref={node => this.logInForm = node}
                                username={this.state.userData.id}
                                displayLogInButton={false} />
                        </ModalDialog>
                    </div>
                }
                <div id="system-spinner" className="text-center">
                    <div className="inner text-center">
                        <i className="fa fa-cog fa-spin fa-3x fa-fw" />
                    </div>
                </div>
            </div>
        );
    }
}

export default ServiceLayout;
