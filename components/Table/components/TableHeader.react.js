import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from '../../ContextComponent.react';

import { TableHeaderField } from './TableHeaderField.react';

import '../Table.css';

export class TableHeader extends ContextComponent
{
    static propTypes = {
        groupBy: PropTypes.func,
        showOpenEditMenu: PropTypes.bool,
        showRowNumber: PropTypes.bool,
        columns: PropTypes.array,
        sorting: PropTypes.object,
    };

    static defaultProps = {
        showOpenEditMenu: true,
        showRowNumber: true,
        columns: [  ],
        sorting: {  },
    };

    constructor(props, context)
    {
        super(props);
    };

    handleApplySorting = (k) => this.props.handleApplySorting(k);

    render()
    {
        const { groupBy, showOpenEditMenu, showRowNumber, columns, sorting } = this.props;

        return(
            <thead className="thead">
                <tr>
                    { groupBy && <th style={{ width: '3.5rem' }}/> }
                    { showOpenEditMenu && <th style={{ width: '3.5rem' }}/> }
                    { showRowNumber && <th style={{ width: '5rem' }}/> }
                    {
                        columns.map(col =>
                        {
                            return (
                                <TableHeaderField
                                    key={ col.key }
                                    sorting={ sorting }
                                    column={ col }
                                    handleApplySorting={ this.handleApplySorting.bind(this) }
                                />
                            )
                        })
                    }
                </tr>
            </thead>
        )
    }
}
