import React from 'react';
import PropTypes from 'prop-types';
import ConditionalRenderComponent from '../ConditionalRenderComponent.react';
import translations from './i18n';
import ajax from 'superagent-bluebird-promise';

class LogInForm extends ConditionalRenderComponent
{
    static propTypes = {
        username : PropTypes.string.isRequired,
        displayLogInButton : PropTypes.bool.isRequired,
        onSuccess : PropTypes.func.isRequired,
        onError : PropTypes.func.isRequired
    }

    static defaultProps = {
        username : '',
        displayLogInButton : true,
        onSuccess : () => null,
        onError : (err) => null
    }

    state = {
        errors : [ ],
        username : '',
        password : ''
    }

    constructor(props, context)
    {
        super(props);

        context.i18n.register('LogInForm', translations);

        this.state.username = props.username;

        this.usernameInput = null;
        this.passwordInput = null;
    }

    componentWillReceiveProps(nextProps)
    {
        this.props = nextProps;
    }

    onFieldChange(e, field)
    {
        this.setState({ [field] : e.target.value });
    }

    focus()
    {
        if(this.state.username)
            this.passwordInput.focus();
        else
            this.usernameInput.focus();
    }

    validateForm()
    {
        const { i18n } = this.context;
        const { username, password } = this.state;
        const errors = [ ];

        if(!username || username === '')
            errors.push(i18n.getMessage('LogInForm.error.email.required'));
        if(!password || password === '')
            errors.push(i18n.getMessage('LogInForm.error.password.required'));

        this.setState({ errors });

        return errors.length === 0;
    }

    clearForm()
    {
        this.setState({ username : '', password : '', errors : [ ] });
    }

    doLogIn()
    {
        if(true || this.validateForm())
        {
            const { username, password } = this.state;

            return ajax.post('/auth/api/backend/login').send({ username, password})
            .then(console.log)

            this.props.onSuccess();

            return true;
        }

        return false;
    }

    render()
    {
        const { i18n } = this.context;
        const { errors } = this.state;

        return(
            <div className="row">
                <div className="col-sm-12">
                    {
                        errors && errors.length > 0 ?
                        <div className="alert alert-danger" role="alert">
                            <ul>
                                { errors.map((error, key) => (<li key={key}>{error}</li>)) }
                            </ul>
                        </div>
                        : null
                    }
                    <form className="form-horizontal" onSubmit={e => { this.doLogIn(); e.preventDefault(); }}>
                        <div className="form-group required">
                            <label className="col-sm-3 control-label">{i18n.getMessage('LogInForm.label.email')}</label>
                            <div className="col-sm-9">
                                <input ref={node => this.usernameInput = node} onChange={e => this.onFieldChange(e, 'username')} type="text" className="form-control" name="username" placeholder={i18n.getMessage('LogInForm.placeholder.email')} value={this.state.username} />
                            </div>
                        </div>
                        <div className="form-group required">
                            <label className="col-sm-3 control-label">{i18n.getMessage('LogInForm.label.password')}</label>
                            <div className="col-sm-9">
                                <input ref={node => this.passwordInput = node} onChange={e => this.onFieldChange(e, 'password')} type="password" className="form-control" name="password" placeholder={i18n.getMessage('LogInForm.placeholder.password')} value={this.state.password} />
                            </div>
                        </div>
                        {
                            this.props.displayLogInButton ?
                            <div className="form-submit text-right">
                                <input type="submit" className="btn btn-primary" value={i18n.getMessage('LogInForm.button.logIn')} name="submit" />
                            </div>
                            : null
                        }
                    </form>
                </div>
            </div>
        )
    }
}

export default LogInForm;
