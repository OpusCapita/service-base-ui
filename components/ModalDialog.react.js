import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from './ContextComponent.react';
import extend from 'extend';
import System from '../system';

class ModalDialog extends ContextComponent
{
    static propTypes = {
        visible : PropTypes.bool.isRequired,
        title : PropTypes.string.isRequired,
        message : PropTypes.string.isRequired,
        size : PropTypes.oneOf([null, 'small', 'large']),
        buttons : PropTypes.object.isRequired,
        buttonsDisabled : PropTypes.array.isRequired,
        allowClose: PropTypes.bool.isRequired,
        showFooter: PropTypes.bool.isRequired,
        onButtonClick : PropTypes.func.isRequired,
        onClose : PropTypes.func.isRequired,
    }

    static defaultProps = {
        visible : false,
        title : '',
        message : '',
        size : null,
        buttons : { 'ok' : 'OK', 'cancel' : 'Cancel' },
        buttonsDisabled : [ ],
        allowClose : true,
        showFooter: true,
        onButtonClick : () => { },
        onClose : () => { },
    }

    static sizes = {
        small : 'modal-sm',
        large : 'modal-lg'
    }

    constructor(props)
    {
        super(props);

        this.dialog = null;
        this.manualProps = { }
        this.state = extend(false, { }, ModalDialog.defaultProps, props);
    }

    componentWillReceiveProps(nextProps)
    {
        this.setState(extend(false, { }, nextProps, this.manualProps), () =>
        {
            if(this.state.visible)
                this.show();
            else
                this.hide();
        });
    }

    componentDidMount()
    {
        if(this.state.visible)
            this.show();
    }

    handleButtonClick = (e, type) =>
    {
        e.preventDefault();

        const clickResult = this.state.onButtonClick(type);

        // Workaround for possible race conditions if setState is called inside the callback above.
        setTimeout(() =>
        {
            if(clickResult && clickResult.then)
                clickResult.then(result => result !== false && this.hide());
            else if(clickResult !== false)
                this.hide();
        }, 100);
    }

    show(title, message, onButtonClick, buttons, buttonsDisabled)
    {
        if(title)
            this.manualProps.title = title;
        if(message)
            this.manualProps.message = message;
        if(buttons)
            this.manualProps.buttons = buttons;
        if(onButtonClick)
            this.manualProps.onButtonClick = onButtonClick;
        if(buttonsDisabled)
            this.manualProps.buttonsDisabled = buttonsDisabled;
        
        this.manualProps.visible = true;

        if(Object.keys(this.manualProps).length)
            this.setState(extend(false, { }, this.state, this.manualProps));

        $(this.dialog).modal({
            show: true,
            backdrop: this.props.allowClose ? true : 'static',
        })
        .on('hidden.bs.modal', () =>
        {
            const closeResult = this.state.onClose();

            // Workaround for possible race conditions if setState is called inside the callback above.
            setTimeout(() =>
            {
                if(closeResult && closeResult.then)
                    closeResult.then(result => result !== false && this.hide());
                else if(closeResult !== false)
                    this.hide();
                else
                    this.show();
            }, 100);
        });
    }

    reload()
    {
        $(this.dialog).modal('handleUpdate');
    }

    hide()
    {
        delete this.manualProps.visible;
        this.setState({ visible : false }, () => $(this.dialog).modal('hide'));
    }

    setButtons(buttons)
    {
        this.setState({ buttons });
    }

    setButtonState(button, enabled)
    {
        const { buttonsDisabled } = this.state;
        const foundIndex = buttonsDisabled && buttonsDisabled.indexOf(button);

        if(enabled && foundIndex > -1)
        {
            delete buttonsDisabled[foundIndex];
            this.setState({ buttonsDisabled : Object.values(buttonsDisabled) });
        }
        else if(!enabled && foundIndex === 1)
        {
            buttonsDisabled.push(button);
            this.setState({ buttonsDisabled });
        }
    }

    enableButton(button)
    {
        this.setButtonState(button, true);
    }

    disableButton(button)
    {
        this.setButtonState(button, false);
    }

    render()
    {
        const state = this.state;
        const { size, buttons, buttonsDisabled } = state;
        const modalClasses = 'modal-dialog ' + (size && ModalDialog.sizes[size]) || '';
        const buttonKeys = buttons && Object.keys(buttons);
        const primaryButtonKey = buttons && buttonKeys[0];
        const primaryButton = buttons && buttons[primaryButtonKey];

        delete buttonKeys[0];

        return(
                <div className="modal fade" role="dialog" ref={node => this.dialog = node}>
                      <div className={modalClasses} style={{ zIndex : 10000 }}>
                            <div className="modal-content">
                                  <div className="modal-header">
                                        {
                                            state.allowClose
                                                && <button type="button" className="close" data-dismiss="modal">&times;</button>
                                        }
                                        <h4 className="modal-title">{state.title}</h4>
                                  </div>
                                  <div className="modal-body">
                                        {
                                            state.message &&
                                                <p>{System.UI.nl2br(state.message)}</p>
                                        }
                                        {
                                            this.props.children
                                        }
                                  </div>
                                  {
                                      this.state.showFooter &&
                                          <div className="modal-footer">
                                              {
                                                  buttonKeys.map(key =>
                                                  {
                                                       return <button key={key} disabled={buttonsDisabled.indexOf(key) !== -1} className="btn btn-link" onClick={e => this.handleButtonClick(e, key)}>{buttons[key]}</button>
                                                  })
                                              }
                                              {
                                                  primaryButton &&
                                                      <button disabled={buttonsDisabled.indexOf(primaryButtonKey) !== -1} className="btn btn-primary" onClick={e => this.handleButtonClick(e, primaryButtonKey)}>{primaryButton}</button>
                                              }
                                        </div>
                                  }
                            </div>

                      </div>
                </div>
        );
    }
}

export default ModalDialog;
