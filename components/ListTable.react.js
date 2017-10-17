import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from './ContextComponent.react';
import extend from 'extend';

class ListTable extends ContextComponent
{
    static propTypes = {
        onSort : PropTypes.func.isRequired,
        onButtonClick : PropTypes.func.isRequired,
        columns : PropTypes.array.isRequired,
        items : PropTypes.array.isRequired,
        itemButtons : PropTypes.array.isRequired
    }

    static defaultProps = {
        onSort : (items, field, dir) => items,
        onButtonClick : (item) => null,
        items : [ ],
        itemButtons : [ ]
    }

    constructor(props)
    {
        super(props);

        this.state = {
            columns : this.props.columns,
            items : this.props.items,
            sorting : { key : '', dir : null }
        }
    }

    componentWillReceiveProps(nextProps)
    {
        this.setState({ items : nextProps.items, columns : nextProps.columns });
        this.reapplySort(nextProps.items);
    }

    applySort(columnKey)
    {
        const { sorting, items } = this.state;
        const keyChanged = columnKey !== sorting.key;

        let newDir = null;

        if(keyChanged)
            newDir = 1;
        else
            newDir = sorting.dir === 1 ? 0 : (sorting.dir === 0 ? null : 1);

        let dirString = newDir === 1 ? 'asc' : (newDir === 0 ? 'desc' : null);

        sorting.key = columnKey;
        sorting.dir = newDir

        const sortedItems = this.props.onSort(extend(true, [ ], items), columnKey, dirString);
        this.setState({ sorting, sortedItems })
    }

    reapplySort(items)
    {
        const { sorting } = this.state;
        items = items || this.state.items;

        if(sorting.key)
        {
            let dirString = sorting.dir === 1 ? 'asc' : (sorting.dir === 0 ? 'desc' : null);

            const sortedItems = this.props.onSort(extend(true, [ ], items), sorting.key, dirString);
            this.setState({ sortedItems })
        }
    }

    getSortingClass(columnKey)
    {
        const { sorting } = this.state;

        if(sorting.key === columnKey)
        {
            if(sorting.dir === 1)
                return 'order';
            else if(sorting.dir === 0)
                return 'order dropup';
            else
                return '';
        }

        return '';
    }

    render()
    {
        const { columns, items, sortedItems, sorting } = this.state;
        const { i18n } = this.context;
        const renderItems = sortedItems || items;

        return (
            <table className="table table-striped table-hover table-condensed">
                <thead className="thead-inverse">
                    <tr>
                        {
                            columns.map(col =>
                            {
                                return (
                                    <th key={col.key}>
                                        <a href="#" className={this.getSortingClass(col.key)} title={col.description} onClick={e => {this.applySort(col.key); e.preventDefault()}}>{col.name}
                                            <i className="caret" aria-hidden="true"></i>
                                        </a>
                                    </th>
                                )
                            })
                        }
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        renderItems.map((item, index) =>
                        {
                            return(
                                <tr key={index}>
                                    {
                                        columns.map(col => (<td key={col.key}>{item[col.key]}</td>))
                                    }
                                    {
                                        <td>
                                            <div className="btn-group pull-right">
                                            {
                                                this.props.itemButtons.map(button =>
                                                {
                                                    return(
                                                        <button key={button.key} className="btn btn-sm btn-default" onClick={e => { e.preventDefault(); this.props.onButtonClick(button.key, item); }}>
                                                              <span className={`glyphicon glyphicon-${button.icon}`}></span> {button.label}
                                                        </button>
                                                    )
                                                })
                                            }
                                            </div>
                                        </td>
                                    }
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        )
    }
}

export default ListTable;
