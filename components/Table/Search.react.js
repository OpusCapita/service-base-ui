import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from './../ContextComponent.react';
import translations from './i18n';

import './Table.css';

export class Search extends ContextComponent
{
    static propTypes =
        {
            filtertext: PropTypes.string
        };

    static defaultProps =
        {
            filtertext: ''
        };

    handleSearchInput = () => this.props.handleSearchInput();

    constructor(props, context)
    {
        super(props);

        context.i18n.register('Table', translations);
    };

    handleSearchInput = (filter) => this.props.handleSearchInput(filter);

    render()
    {
        const { i18n } = this.context;
        const { filtertext } = this.props;

        return(
            <span className="table-search">
                <input
                    className="table-search-input"
                    type="text"
                    placeholder={ i18n.getMessage('Table.search.placeholder') }
                    value={ filtertext }
                    onChange={ this.handleSearchInput.bind(this) }
                />
                <span className="glyphicon glyphicon-search" aria-hidden="true"/>
            </span>
        )
    }
}
