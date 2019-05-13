import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from '../../ContextComponent.react';
import translations from '../i18n';

import Common from '../utils/Common';

import '../Table.css';

export class TableField extends ContextComponent
{
    static propTypes =
    {
        isInEditMode: PropTypes.bool,
        column: PropTypes.object,
        row: PropTypes.object,
    };

    static defaultProps =
    {
        isInEditMode: false,
        column: {  },
        row: {},
    };

    constructor(props, context)
    {
        super(props);

        context.i18n.register('Table', translations);
    };

    /**
     *
     */
    handleValueChange = (columnKey, columnType, event, columnId) => this.props.handleValueChange(columnKey, columnType, event, columnId);

    /**
     * Checks field state.
     *
     * @function checkFieldState
     * @param column - Current column
     * @param item - Current item
     * @returns {string}
     */
    checkFieldState = (column, row) =>
    {
        const { items } = this.props;

        const keyValue = row[ column.key ],
              tempArray = [  ];

        if(column.required === true && keyValue === (null || ''))
        {
            return 'danger';
        }

        if(column.unique === true)
        {
            items.forEach(itx =>
            {
                if(itx[ column.key ] === keyValue) tempArray.push(keyValue);
            });

            if(tempArray.length > 1 && tempArray.indexOf(keyValue) >= 0)
            {
                return 'danger';
            }
        }

        if(row.edited && row.edited.includes(column.key))
        {
            return 'warning';
        }

        return 'default';
    };

    /**
     *
     */
    getFieldType = (columnType) =>
    {
        const { i18n } = this.context;
        const { column, row } = this.props;

        let fieldContent;

        switch(columnType)
        {
            case 'bool':
                fieldContent = (
                    <span className="table-checkbox">
                        <input
                            type="checkbox"
                            className="table-checkbox-button"
                            value={ row[ column.key ] }
                            onChange={ e => this.handleValueChange(column.key, column.type, e.target.value, row._id) }
                            disabled={ column.locked }
                            checked={ row[ column.key ] }
                        />
                        {
                            <span className={ `table-checkbox-text ${  column.locked ? 'locked' : '' }` }>
                                {
                                    row[ column.key ] ? row[ column.key ].toString() : false.toString()
                                }
                            </span>
                        }
                    </span>
                );
                break;
            default:
            case 'date':
            case 'number':
            case 'string':
                fieldContent = (
                    <input
                        type="text"
                        className={ `table-input ${ column.locked ? 'locked' : '' }` }
                        value={ Common.formatColumnValue(row[ column.key ], column.type, i18n) }
                        onChange={ e => this.handleValueChange(column.key, column.type, e.target.value, row._id) }
                        disabled={ column.locked }
                    />
                );
                break;
        }

        return fieldContent;
    };

    render()
    {
        const { i18n } = this.context;
        const { isInEditMode, column, row, fixed } = this.props;

        return(
            <td
                key={ column.key }
                className={ `${ column.key } ${this.checkFieldState(column, row) }` }
                style={{
                    overflow: (fixed && !column.showOverflow) ? 'hidden' : 'visible',
                    textOverflow: !column.disableEllipsis && 'ellipsis'
                }}
            >
                {
                    isInEditMode ?
                    <span>
                        {
                            this.getFieldType(column.type)
                        }
                    </span>
                    :
                    <span
                        style={{ 'whiteSpace': 'nowrap' }}
                        data-placement='auto'
                        data-toggle={'tooltip'}
                        data-html="true"
                        title={
                            Common.formatColumnValue(row[ column.key ], column.type, i18n)
                        }
                    >
                        {
                            Common.formatColumnValue(row[ column.key ], column.type, i18n)
                        }
                    </span>
                }
            </td>
        )
    }
}
