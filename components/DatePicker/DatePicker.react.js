import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from '../ContextComponent.react';

import './bootstrap-datepicker';
import './bootstrap-datepicker-i18n';
import './date-picker.css';

// https://bootstrap-datepicker.readthedocs.io
class DatePicker extends ContextComponent
{
    static propTypes = {
        showIcon : PropTypes.bool.isRequired,
        value : PropTypes.any,
        format : PropTypes.string,
        onChange : PropTypes.func.isRequired,
        onFocus : PropTypes.func.isRequired,
        onBlur : PropTypes.func.isRequired,
        disabled : PropTypes.bool.isRequired
    };

    static defaultProps = {
        showIcon : true,
        value : null,
        onChange : () => null,
        onFocus : () => null,
        onBlur : () => null,
        disabled : false
    };

    defaultOptions = {
        autoclose : true,
        todayHighlight : true,
        todayBtn : 'linked',
        forceParse : false,
        showAnim : 'fold',
        showButtonPanel : true,
        clearBtn : true,
        format : 'yyyy-mm-dd'
    }

    state = {
        disabled : false,
        value : null
    };

    constructor(props, context)
    {
        super(props, context);

        this.picker = null;
    }

    componentWillReceiveProps(nextProps, nextContext)
    {
        if(this.context.locale !== nextContext.locale)
        {
            this.context = nextContext;

            this.dispose();
            this.init();
        }
        else
        {
            this.setDisabled(nextProps.disabled);
            this.setValue(this.parseValue(nextProps.value));
        }
    }

    componentDidMount()
    {
        this.init();
        this.setDisabled(this.props.disabled);
        this.setValue(this.parseValue(this.props.value));
    }

    parseValue(value)
    {
        try
        {
            if(value && typeof(value) === 'string')
                return new Date(value);
            else if(value && value.constructor  && value.constructor.name === 'Date')
                return value;
            else if(!value)
                return '';
            else
                throw new Error(`The provided value "${value}" property cannot be processed`);
        }
        catch(e)
        {
            console.warn('Could not parse input date value:', e);
            return e;
        }
    }

    init()
    {
        const pickerOptions = {
            ...this.defaultOptions,
            showIcon : this.props.showIcon,
            language : this.context.locale,
            format : this.props.format || this.context.i18n.dateFormat.toLowerCase()
        }

        $(this.picker).datepicker(pickerOptions).on('changeDate', e =>
        {
            if(this.setValue(e.date))
                this.props.onChange({ date : e.date, dateString : e.date && e.date.toString(), timestamp : e.timeStamp });
        });
    }

    dispose()
    {
        $(this.picker).datepicker('destroy');
    }

    reset()
    {
        this.setValue(null);
    }

    setValue(value)
    {
        if(value === this.state.value)
            return false;

        this.setState({ value }, () => $(this.picker).datepicker('update', value ? new Date(value) : ''));

        return true;
    }

    setDisabled(disabled)
    {
        if(disabled !== this.state.disabled)
            this.setState({ disabled }, () => $(this.picker).prop('disabled', disabled ? true : false));
    }

    getValue()
    {
        return this.state.value;
    }

    render()
    {
        const { showIcon, onFocus, onBlur } = this.props;

        return (
            showIcon ?
                <div className="input-group date"  ref={node => this.picker = node}>
                    <input className="form-control" onFocus={() => onFocus()} onBlur={() => onBlur()} />
                    <span className="input-group-addon" ref="toggleBtn">
                        <span className="glyphicon glyphicon-calendar"></span>
                    </span>
                </div>
            :
                <input className="form-control" onFocus={() => onFocus()} onBlur={() => onBlur()} ref={node => this.picker = node} />
        );
    }
}

export default DatePicker;
