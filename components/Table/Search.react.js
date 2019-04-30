import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from './../ContextComponent.react';
import translations from './i18n';

import './Table.css';

export class Search extends ContextComponent
{
    static propTypes =
    {
        filterText: PropTypes.string
    };

    static defaultProps =
    {
        filterText: ''
    };

    constructor(props, context)
    {
        super(props);

        context.i18n.register('Table', translations);
    };

    /**
     * Passes the seach input to parent.
     *
     * @function handleSearchInput
     */
    handleSearchInput = () => this.props.handleSearchInput();

    /**
     * Passes the filtered search input to parent.
     *
     * @function handleSearchInput
     */
    handleSearchInput = (filter) => this.props.handleSearchInput(filter);

    render()
    {
        const { i18n } = this.context;
        const { filterText } = this.props;

        return(
            <span className="table-search">
                <input
                    className="table-search-input"
                    type="text"
                    placeholder={ i18n.getMessage('Table.search.placeholder') }
                    value={ filterText }
                    onChange={ this.handleSearchInput.bind(this) }
                />
                <span className="glyphicon glyphicon-search" aria-hidden="true"/>
            </span>
        )
    }
}
