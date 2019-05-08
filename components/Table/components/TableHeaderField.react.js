import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from '../../ContextComponent.react';

import '../Table.css';

export class TableHeaderField extends ContextComponent
{
    static propTypes = {
        sorting: PropTypes.object,
        column: PropTypes.object,
    };

    static defaultProps = {
        sorting: {  },
        column: {  },
    };

    constructor(props, context)
    {
        super(props);
    };

    handleApplySorting = (k) => this.props.handleApplySorting(k);

    render()
    {
        const { sorting, column } = this.props;

        return(
            <th
                className={ sorting.key === column.key && 'sorting' }
                key={ column.key }
                style={{ width: column.width }}
            >
                <a onClick={ e =>
                {
                    e.preventDefault();
                    this.handleApplySorting(column.key);
                }
                }>
                    { column.name }
                    {
                        sorting.key === column.key && (
                            sorting.order === 'asc' ?
                            <span>&nbsp;<i className="fa fa-caret-down"/></span>
                            :
                            <span>&nbsp;<i className="fa fa-caret-up"/></span>
                        )

                    }
                </a>
            </th>
        )
    }
}
