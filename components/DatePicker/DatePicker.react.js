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

        this.container = null;
        this.picker = null;
        this.lastValue = null;
        this.disabled = props.disabled;
    }

    componentDidMount()
    {
        this.init();
    }

    componentWillUnmount()
    {
        this.dispose();
    }

    init(initialValue)
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

            if(dateString != this.lastValue)
            {
                const payload = { date : e.date, dateString : dateString, timestamp : e.timeStamp };
                this.lastValue = dateString
                this.props.onChange(payload);
            }
        });

        if(initialValue)
            $(element).datepicker('update', new Date(initialValue));
        else if(!this.props.value || this.props.value === '')
            this.reset();
        else if(this.props.value != this.lastValue)
            $(element).datepicker('update', new Date(this.props.value));

        $(element).prop('disabled', this.disabled);
    }

    dispose()
    {
        $(this.container || this.picker).datepicker('remove');
    }

    componentWillReceiveProps(nextProps, nextContext)
    {
        this.dispose();

        this.props = nextProps;
        this.context = nextContext;
        this.disabled = this.props.disabled;

        this.init(this.lastValue);
    }

    setDisabled(disabled)
    {
        this.dispose();
        this.disabled = disabled;
        this.init(this.lastValue);
    }

    reset()
    {
        $(this.container || this.picker).datepicker('clearDates');
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
