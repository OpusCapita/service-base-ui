import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from '../ContextComponent.react';

import './bootstrap-datepicker';
import './bootstrap-datepicker-i18n';
import './date-picker.css';

class DatePicker extends ContextComponent
{
    static propTypes = {
        showIcon : PropTypes.bool.isRequired,
        value : PropTypes.string,
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
        language : 'en',
        format : 'yyyy-mm-dd'
    }

    state = {
        value : null
    };

    constrcutor(props, context)
    {
        super(props, context);

        this.container = null;
        this.picker = null;

        if(typeof(props.value) === 'string')
            this.state.value = new Date(props.value);
        else if(!props.value)
            this.state.value = new Date();
    }

    componentWillReceiveProps(nextProps, nextContext)
    {
        this.setState({ });
    }

    componentDidMount()
    {
        this.init();
    }

    init()
    {

    }

    dispose()
    {
        $(this.container || this.picker).datepicker('remove');
    }

    reset()
    {
        this.setState({ value : null });
    }

    render()
    {
        const { showIcon, onFocus, onBlur } = this.props;

        return (
            showIcon ?
                <div className="input-group date"  ref={node => this.container = node}>
                    <input className="form-control" onFocus={() => onFocus()} onBlur={() => onBlur()} ref={node => this.picker = node}  />
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
