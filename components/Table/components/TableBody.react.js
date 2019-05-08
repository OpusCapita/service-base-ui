import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from '../../ContextComponent.react';

import { TableField } from './TableField.react';

import '../Table.css';

export class TableBody extends ContextComponent
{
    static propTypes = {
        groupBy: PropTypes.func,
        rows: PropTypes.array,
        columns: PropTypes.array,
        selectedItems: PropTypes.array,
        items: PropTypes.array,
        showEditMenu: PropTypes.bool,
        showRowNumber: PropTypes.bool,
    };

    static defaultProps = {
        rows: [  ],
        items: [  ],
        columns: [  ],
        selectedItems: [  ],
        showEditMenu: false,
        showRowNumber: false,
    };

    constructor(props, context)
    {
        super(props);
    };

    handleSelectionChange = (index) =>
    {
        this.props.handleSelectionChange(index);
    };

    handleListValueChange = (columnKey, columnType, event, columnId) =>
    {
        this.props.handleListValueChange(columnKey, columnType, event, columnId);
    };

    render()
    {
        const { rows, columns, selectedItems, showEditMenu, showRowNumber, items } = this.props;

        return(
            <tbody>
            {
                rows.map((row, index) => ([
                    (
                        // normal row
                        <tr
                            key={ index }
                            className={ `${ selectedItems.indexOf(row._id) >= 0 ? 'info' : '' } ${ showEditMenu ? 'row-selected' : '' }` }
                        >
                            {
                                // Row: Checkmark.
                                showEditMenu &&
                                <td>
                                    <label className="dlk">
                                        <input
                                            type="checkbox"
                                            checked={ selectedItems.indexOf(row._id) >= 0 ? 'checked' : '' }
                                            onClick={ this.handleSelectionChange.bind(this, row._id) }
                                        />
                                        {
                                            selectedItems.indexOf(row._id) >= 0 ?
                                                <i className="fa fa-times glyphicon glyphicon-remove"/>
                                                :
                                                <i className="fa fa-check glyphicon glyphicon-ok"/>
                                        }
                                    </label>
                                </td>
                            }
                            {
                                // Row: Number.
                                showRowNumber &&
                                <td>
                                    {
                                        showEditMenu ?
                                            <input
                                                className="table-input"
                                                type="text"
                                                value={ index + 1 }
                                                readOnly={ true }
                                            />
                                            :
                                            <span>{ index + 1 }</span>
                                    }
                                </td>
                            }
                            {
                                // Row: Content.
                                columns.map(col => (
                                    <TableField
                                        key={ col.key }
                                        isInEditMode={ showEditMenu }
                                        column={ col }
                                        row={ row }
                                        items={ items }
                                        fixed={ true }
                                        handleValueChange={ this.handleListValueChange.bind(this) }
                                    />
                                ))
                            }
                        </tr>
                    )
                ]))
            }
            </tbody>
        )
    }
}

/*
// Render Group indicator

after "<tr>{"

{
    this.props.groupBy &&
    <td
        style={{
            textAlign: 'center',
            width: '3.5rem'
        }}
        onClick={ e =>
            {
                item.__showAll = !item.__showAll;
                this.setState({ renderItems });
            }
        }
    >
        {
            item.__showAll ?
            <span>&nbsp;<i className="fa fa-caret-down fa-lg"/></span>
            :
            <span>&nbsp;<i className="fa fa-caret-right fa-lg"/></span>
        }
    </td>
}

// Render Group content:
after "</tr>),("

item.__showAll && (item.__subItems || [  ]).map((item, itemIndex) => (
    <tr>
        <td/>
        <td>{ index + 1 }.{ itemIndex + 1 }</td>
            {
                columns.map((col) => (
                <td
                    key={ col.key }
                    className={ col.className }
                    style={{
                        overflow: (fixed && !col.showOverflow) ? 'hidden' : 'visible',
                        textOverflow: !col.disableEllipsis && 'ellipsis'
                    }}
                >
                    <span
                        style={{ 'whiteSpace': 'nowrap' }}
                        data-placement='auto'
                        data-toggle={ 'tooltip' }
                        data-html="true"
                        title={
                            typeof (col.value ? col.value(item) : item[ col.key ]) === 'string' &&
                            col.value ? col.value(item) : item[ col.key ]
                        }
                    >
                        {
                            col.subItemValue ?
                            col.subItemValue(item)
                            :
                            col.value ? col.value(item)
                            :
                            item[ col.key ]
                        }
                    </span>
                </td>
            ))
        }
    </tr>
))
 */
