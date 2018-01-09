import React from 'react';
import PropTypes from 'prop-types';
import extend from 'extend';
import ContextComponent from '../ContextComponent.react';

import './bootstrap-datepicker';
import './bootstrap-datepicker-i18n';
import './date-picker.css';

class DatePicker extends ContextComponent
{
    static propTypes = {
        showIcon : PropTypes.bool.isRequired,
        // Possible options: https://bootstrap-datepicker.readthedocs.io/en/latest/options.html
        // additionally you can receive 'events' [{ name: 'hide', fn: () => {} }, ...]
        // Possible events: https://bootstrap-datepicker.readthedocs.io/en/latest/events.html
        value : PropTypes.string,
        format : PropTypes.string,
        onChange : PropTypes.func.isRequired,
        onBlur : PropTypes.func.isRequired,
        disabled : PropTypes.bool.isRequired
    };

    static defaultProps = {
        showIcon : true,
        value : '',
        onChange : () => null,
        onBlur : () => null,
        disabled : false
    };

    state = {
        value : null,
        disabled : false
    };

    static defaultOptions = {
        autoclose : true,
        todayHighlight : true,
        todayBtn : 'linked',
        forceParse : false,
        showAnim : 'fold',
        showButtonPanel : true,
        clearBtn : true,
        language : 'en'
    }

    constructor(props, context)
    {
        super(props);

        this.state.value = props.value;
        this.state.disabled = props.disabled;

        this.container = null;
        this.picker = null;
        this.lastValue = null;
    }

    componentDidMount()
    {
        this.init();
    }

    componentWillUnmount()
    {
        this.dispose();
    }

    init()
    {
        const contextFormat = this.context.i18n.dateFormat.toLowerCase();

        let pickerOptions = {
            showIcon : this.props.showIcon,
            format : this.props.format || contextFormat,
            language : this.context.locale
        }

        pickerOptions = extend(true, { }, DatePicker.defaultOptions, pickerOptions);

        const element = this.container || this.picker;

        $(element).datepicker(pickerOptions).on('changeDate', e =>
        {
            const dateString = e.date && e.date.toString();

            if(dateString !== this.state.value)
            {
                const payload = { date : e.date, dateString : dateString, timestamp : e.timeStamp };

                if(dateString !== this.lastValue)
                {
                    this.props.onChange(payload);
                    this.setState({ value : dateString });
                }

                this.lastValue = dateString;
            }
        });

        if(this.state.value !== this.lastValue)
        {
            if(!this.state.value || this.state.value === '')
                $(element).datepicker('update', '');
            else
                $(element).datepicker('update', new Date(this.state.value));
        }

        $(element).prop('disabled', this.state.disabled);
    }

    dispose()
    {
        $(this.container || this.picker).datepicker('remove');
    }

    componentWillReceiveProps(nextProps, nextContext)
    {
        this.dispose();

        this.setState({
            value : nextProps.value,
            disabled : nextProps.disabled
        },
        () => this.init());
    }

    setDisabled(disabled)
    {
        this.dispose();
        this.setState({ disabled }, () => this.init());
    }

    reset()
    {
        this.dispose();
        this.setState({ value : '' }, () => this.init());
    }

    render()
    {
        const { showIcon, onBlur } = this.props;

        return(
                (showIcon &&
                    <div className="input-group date" ref={node => this.container = node}>
                        <input className="form-control" onBlur={() => onBlur()} ref={node => this.picker = node}  />
                        <span className="input-group-addon" ref="toggleBtn">
                            <span className="glyphicon glyphicon-calendar"></span>
                        </span>
                    </div>)
                ||
                    <input className="form-control" onBlur={() => onBlur()} ref={node => this.picker = node} />

        );
    }
}

export default DatePicker
