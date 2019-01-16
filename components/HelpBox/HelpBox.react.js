import React from 'react';

import './HelpBox.css';

class HelpBox extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state =
        {
            num: Math.floor((Math.random() * 50000) + 1),
            selected: 0,
            active: "item_0"
        };

        this.handleChange = this.handleChange.bind(this);
        this.checkIfActive = this.checkIfActive.bind(this);
    }

    handleChange(event)
    {
        this.setState({
            active: event.target.value
        });
    }

    checkIfActive(event)
    {
        if(this.state.active === event.target.value && event.target.className.indexOf("multiple") >= 0)
        {
            this.setState({
                active: false
            });
        }
    }

    renderHelpItem(child, multipleItems, index)
    {
        const classAppendix = multipleItems ? "multiple" : "single";

        return(
            <li key={index}>
                <input
                    id={`item-${this.state.num}-${index}`}
                    className={`header-check ${classAppendix}`}
                    name={`helpboxitems-${this.state.num}`}
                    type="radio"
                    value={"item_" + index}
                    checked={this.state.active === "item_" + index}
                    onChange={this.handleChange}
                    onClick={this.checkIfActive}
                />
                <label className={`header ${classAppendix}`} htmlFor={`item-${this.state.num}-${index}`}>
                    <span className={"text"}>
                        {child.props.title}
                    </span>
                </label>
                <article>
                    {child}
                </article>
            </li>
        );
    }

    render()
    {
        return (
            <ul className="help-box">
                {
                    Array.isArray(this.props.children) ?
                        this.props.children.map((child, index) => this.renderHelpItem(child, true, index)) : this.renderHelpItem(this.props.children, false, 0)
                }
            </ul>
        )
    }
}

export default HelpBox;
