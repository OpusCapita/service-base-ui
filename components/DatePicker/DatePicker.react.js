import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from '../ContextComponent.react';
import extend from 'extend';

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
        format : PropTypes.string.isRequired,
        onChange : PropTypes.func.isRequired,
        onBlur : PropTypes.func.isRequired,
    };

    static defaultProps = {
        showIcon : true,
        value : '',
        format : 'dd.mm.yyyy',
        onChange : () => null,
        onBlur : () => null
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

    constructor(props)
    {
        super(props);

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
        let pickerOptions = {
            showIcon : this.props.showIcon,
            format : this.props.format,
            language : this.context.locale
        }

        pickerOptions = extend(true, DatePicker.defaultOptions, pickerOptions);

        const element = this.container || this.picker;

        $(element).datepicker(pickerOptions).on('changeDate', e =>
        {
            const dateString = e.date.toString();

            if(dateString != this.lastValue)
            {
                const payload = { date : e.date, dateString : dateString, timestamp : e.timeStamp };
                this.lastValue = dateString
                this.props.onChange(payload);
            }
        });

        if(this.props.value != this.lastValue)
            $(element).datepicker('update', new Date(this.props.value));
    }

    dispose()
    {
        $(this.container || this.picker).datepicker('remove');
    }

    componentWillReceiveProps(nextProps, nextContext)
    {
        let propsChanged = false;

        for(let key in nextProps)
        {
            if(nextProps[key] != this.props[key])
            {
                propsChanged = true;
                break;
            }

        }

        if(propsChanged)
        {
            this.dispose();

            this.props = nextProps;
            this.context = nextContext;

            this.init();
        }
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
