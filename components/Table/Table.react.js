import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from './../ContextComponent.react';
import translations from './i18n';

import './Table.css';

class Table extends ContextComponent {

    static propTypes = {
        items: PropTypes.array.isRequired,
        columns: PropTypes.array.isRequired,
        defaultSort: PropTypes.object,
        groupBy: PropTypes.func,
        groupOrderBy: PropTypes.string,
        styling: PropTypes.object,
        options: PropTypes.object,
    };

    static defaultProps = {
        groupOrderBy: 'id',
        styling: {
            striped: true,      // show table striped?
            condensed: true,    // show table condensed?
            bordered: true      // show table bordered?
        },
        options: {
            pageSize: 10,       // show how many rows per page?
            showPageSize: true, // show page size selector?
            showEditMenu: true, // show the edit menu?
            openEditMenu: true, // open edit menu and allow rows to be edited?
            fixed: true
        },
    };

    constructor(props, context) {
        super(props);

        this.state = {
            columns: props.columns,
            items: [  ],
            pageSize: props.options.pageSize,
            fixed: props.options.fixed,
            renderItems: [],
            selectedItems: [  ],
            startIndex: 0,
            numPages: 0,
            sorting: {},
            showPrev: true,
            showNext: true,
            openEditMenu: props.options.openEditMenu,
            canBeSaved: false,
            exportableitems: [  ],
            tempItems: [  ]
        };

        context.i18n.register('Table', translations);
    }

    async componentDidMount() {
        await this.loadItems();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({items: nextProps.items, columns: nextProps.columns}, () => {
            const {defaultSort} = this.props;
            this.groupItems();
            if (defaultSort) {
                this.applySort(defaultSort.key, defaultSort.order)
            }
            this.filterItems();
            this.calcPageNumbers();
        });
    }

    range(start, end) {
        return Array.from({length: end - start}, (i, idx) => idx + start);
    }

    // Load items to populate item-list.
    async loadItems()
    {
        const {items, defaultSort} = this.props;

        this.checkCycleButtonVisibility(0);

        let numberedItems = [  ];

        try{
            numberedItems = await this.setItemIdentifier(items);

            this.setState({
                items: numberedItems
            });
        }
        catch(e)
        {

        }
        finally
        {
            this.groupItems();
            if (defaultSort) {
                this.applySort(defaultSort.key, defaultSort.order)
            }
            this.filterItems();
            this.calcPageNumbers();
        }
    }

    // Create a random identifier.
    randomId =() =>
    {
        return btoa(Math.random()).substring(0,12)
    };

    // set an identifier for every item in list.
    setItemIdentifier = (items) =>
    {
        const rows = [  ];

        for (let i = 0; i < items.length; i++)
        {
            rows.push({ ...items[i], _id: this.randomId() });
        }

        return rows;
    };

    calcPageNumbers() {
        const {startIndex, pageSize, items} = this.state;

        const numPages = Math.ceil(items.length / pageSize);
        const currentPage = startIndex / pageSize;

        if (numPages > 7) {
            let startPage = Math.max(2, currentPage - 1);
            startPage = startPage < (numPages - 5) ? startPage : numPages - 5;
            const endPage = Math.min(startPage + 5, numPages);

            let pages = this.range(startPage, endPage);
            if (startPage > 2) {
                pages[0] = '..';
            }
            if (numPages > endPage) {
                pages[pages.length - 1] = '..';
            }
            pages = [1, ...pages, numPages];
            this.setState({pages, currentPage});
            return;
        }
        this.setState({currentPage, pages: this.range(1, numPages + 1)});
    }

    applySort(key, order) {
        const {columns, items, sorting} = this.state;
        if(!order) {
            order = 'asc';
            if (key === sorting.key && sorting.order === 'asc') {
                order = 'desc';
            }
        }
        let col = columns.find(c => c.key === key);

        const defaultSortMethod = (a, b) => {
            let comparison = 0;

            let valA = col.sortValue ? col.sortValue(a) :
                col.value ? col.value(a) : a[col.key];
            let valB = col.sortValue ? col.sortValue(b) :
                col.value ? col.value(b) : b[col.key];

            valA = (typeof valA === 'string') ? valA.toLowerCase() : valA;
            valB = (typeof valB === 'string') ? valB.toLowerCase() : valB;

            if (valA > valB || (valA != null && valB == null)) {
                comparison = 1;
            } else if (valA < valB || (valA == null && valB != null)) {
                comparison = -1;
            }

            return comparison;
        };

        let sortMethod = col.sortMethod || defaultSortMethod;
        const compare = (a, b) => {
            let comparison = sortMethod(a, b);
            return (order === 'desc') ? (comparison * -1) : comparison;
        };

        items.sort(compare);
        this.setState({items, sorting: {key, order}}, () => {
            this.filterItems();
        })
    }

    groupItems() {
        const {groupBy, groupOrderBy} = this.props;
        if(groupBy) {
            const {items} = this.state;
            for (let idxA = 0; idxA < items.length; idxA++) {
                const keyA = groupBy(items[idxA]);

                let idxB = idxA + 1;
                while(idxB < items.length) {
                    const keyB = groupBy(items[idxB]);

                    if (keyA === keyB) {
                        let subItems = items[idxA].__subItems || [];
                        if(items[idxA][groupOrderBy] > items[idxB][groupOrderBy]) {
                            subItems.push(items[idxB]);
                        } else {
                            subItems.push(items[idxA]);
                            items[idxA] = items[idxB];
                        }
                        items[idxA].__subItems = subItems;
                        items.splice(idxB, 1);
                    } else {
                        idxB++;
                    }
                }
            }
            for (let item of items) {
                const sortMethod = (a, b) => {
                    let comparison = 0;

                    let valA = a[groupOrderBy];
                    let valB = b[groupOrderBy];

                    if (valA < valB) {
                        comparison = 1;
                    } else if (valA > valB) {
                        comparison = -1;
                    }

                    return comparison;
                };
                item.__subItems && item.__subItems.sort(sortMethod);
            }
            this.setState({items});
        }
    }

    filterItems() {
        const {startIndex, pageSize, items} = this.state;

        const renderItems = items.slice(startIndex, startIndex + pageSize);
        const lastOffset = this.pagination.offsetTop;
        this.setState({renderItems}, () => {
            const diff = this.pagination.offsetTop - lastOffset;
            window.scrollBy(0, diff);
        });
    }

    next() {
        const {pageSize, startIndex, items} = this.state;
        const newIndex = startIndex + pageSize;
        if (newIndex < items.length) {
            this.setState({startIndex: newIndex}, () => {
                this.filterItems();
                this.checkCycleButtonVisibility(newIndex);
                this.calcPageNumbers();
            });
        }
    }

    previous() {
        const {pageSize, startIndex, items} = this.state;
        const newIndex = startIndex - pageSize;
        if (newIndex >= 0) {
            this.setState({startIndex: newIndex}, () => {
                this.filterItems();
                this.checkCycleButtonVisibility(newIndex);
                this.calcPageNumbers();
            });
        }
    }

    setPage(pageNum) {
        const { pageSize } = this.state;

        if (Number.isInteger(pageNum)) {
            this.setState({startIndex: pageNum * pageSize}, () => {
                this.filterItems();
                this.calcPageNumbers();
                this.checkCycleButtonVisibility(pageNum * pageSize)
            });
        }
    }

    // Check if prev or next page button should be visible.
    checkCycleButtonVisibility = (pageNum) =>
    {
        const { pageSize, items } = this.state;

        this.setState({
            showPrev: (pageNum * pageSize !== 0),
            showNext: (pageNum + pageSize) <= items.length
        });
    };

    // Set availible options for visible page size.
    setPageSizeOptions = () =>
    {
        let options = [  ];
        for(let i = 10; i < this.state.items.length; i <<= 1)
        {
            options.push(<option key={ i } value={ i }>{ i }</option>);
        }
        options.push(<option key={ options.length + 1 } value={ this.state.items.length }>All</option>);
        return options;
    };

    // Change visible size of page.
    changePageSize = (event) =>
    {
        this.setState({ pageSize: event.target.value }, () =>
        {
            this.setPage(0);
            this.filterItems();
            this.calcPageNumbers();
        });
    };

    handleListValueChange = (key, value, id) =>
    {
        const { items } = this.state;

        if(items)
        {
            let newList = items.map((item) =>
            {
                if(item._id === id)
                {
                    item[key] = value;
                }

                return item;
            });

            this.setState({
                items: newList
            }, () =>
            {
                this.setPage(0);
                this.filterItems();
                this.calcPageNumbers();
            });
        }
    };

    // Handle row selection.
    handleSelectionChange = (index) =>
    {
        if(this.state.selectedItems.indexOf(index) >= 0)
        {
            let deleteIndex = this.state.selectedItems.map((item) => {
                return item
            }).indexOf(index);

            this.setState({
                selectedItems: this.state.selectedItems.filter((item, i) => i !== deleteIndex)
            });
        }
        else
        {
            this.setState({
                selectedItems: [ ...this.state.selectedItems, index ]
            });
        }
    };

    // handle edit button state.
    handleEditableButton = () =>
    {
        this.setState({
            openEditMenu: !this.state.openEditMenu
        })
    };

    // Add an item to the data-list.
    handleAddButton = () =>
    {
        this.addItem();
    };

    // Handle duplicate button
    handleDuplicateButton = () =>
    {
        this.duplicateItems();
    };

    // Handle delete button.
    handleDeleteButton = () =>
    {
        const { i18n } = this.context;
        const { selectedItems } = this.state;

        const title = (
            selectedItems.length > 1 ?
                i18n.getMessage('Table.dialog.delete.title.multiple')
            :
                i18n.getMessage('Table.dialog.delete.title.single')
        );
        const message = (
            selectedItems.length > 1 ?
                i18n.getMessage('Table.dialog.delete.message.multiple')
                :
                i18n.getMessage('Table.dialog.delete.message.single')
        );
        const buttons = {
            'no': i18n.getMessage('Table.dialog.delete.buttons.no'),
            'yes': i18n.getMessage('Table.dialog.delete.buttons.yes')
        };

        const onButtonClick = (button) =>
        {
            if(button === 'yes')
            {
                this.deleteItems();
            }

            return true;
        };

        this.context.showModalDialog(title, message, onButtonClick, buttons);
    };

    // Save data-list to server.
    handleSaveButton = () =>
    {

    };

    // Export data-list in  CSV format.
    handleExportButton = () =>
    {
        const { i18n } = this.context;
        const { selectedItems } = this.state;

        this.createExportableItemlist();

        const title = (
            selectedItems.length === 1 ? i18n.getMessage('Table.dialog.export.title.single') : (
                selectedItems.length > 1 ?
                i18n.getMessage('Table.dialog.export.title.multiple')
                :
                i18n.getMessage('Table.dialog.export.title.all')
            )
        );
        const message = (
            selectedItems.length === 1 ?  i18n.getMessage('Table.dialog.export.message.single') : (
                selectedItems.length >= 1 ?
                i18n.getMessage('Table.dialog.export.message.multiple', { amount : selectedItems.length })
                :
                i18n.getMessage('Table.dialog.export.message.all')
            )
        );
        const buttons = {
            'no': i18n.getMessage('Table.dialog.export.buttons.no'),
            'yes': i18n.getMessage('Table.dialog.export.buttons.yes')
        };

        const onButtonClick = (button) =>
        {
            if(button === 'yes')
            {
                this.exportDataToCSV();
            }

            return true;
        };

        this.context.showModalDialog(title, message, onButtonClick, buttons);

    };

    // Add new item to data-list.
    addItem = () =>
    {
        const { items } = this.props;

        const keys = Object.keys(items[0]);
        const newItem = {  };

        for(let i = 0; i < keys.length; i++)
        {
            newItem[keys[i]] = '';
        }

        newItem["_id"] = this.randomId();

        this.setState({
            items: [ newItem, ...this.state.items ]
        }, () => {
            this.setPage(0);
            this.filterItems();
            this.calcPageNumbers();
        })
    };

    // Duplicate selected items from data-list.
    duplicateItems = () =>
    {
        const { items, selectedItems } = this.state;
        const keys = Object.keys(items[0]);

        let newItems = [  ];

        selectedItems.forEach((selected) =>
        {
            let newItem = items.find(item => item._id === selected);
            newItems.push(newItem);
        });

        newItems.push(...this.state.items);

        const duplicatedItems = this.setItemIdentifier(newItems);

        this.setState({
            items: duplicatedItems,
            selectedItems: [  ]
        }, () => {
            this.setPage(0);
            this.filterItems();
            this.calcPageNumbers();
        })
    };

    // Delete selected item(s) from data-list.
    deleteItems = () =>
    {
        const { items, selectedItems } = this.state;

        let newItems = items.filter((item) =>
        {
            if(selectedItems.indexOf(item._id) === -1)
            {
                return item;
            }
        });

        this.setState({
            items: newItems,
            selectedItems: [  ]
        }, () => {
            this.setPage(0);
            this.filterItems();
            this.calcPageNumbers();
        })
    };

    // creates a list based on either all, or selected rows for export.
    createExportableItemlist = () =>
    {
        const { items, selectedItems } = this.state;

        let exportableItems = [  ];

        if(selectedItems.length >= 1)
        {
            exportableItems = items.filter((data) =>
            {
                if(selectedItems.indexOf(data._id) >= 0)
                {
                    return data;
                }
            })
            .map((data) =>
            {
                return JSON.stringify(Object.values(data));
            })
            .join('\n')
            .replace(/(^\[)|(\]$)/mg, '');
        }
        else
        {
            exportableItems = items.map((data) =>
            {
                return JSON.stringify(Object.values(data));
            })
            .join('\n')
            .replace(/(^\[)|(\]$)/mg, '')
        }

        this.setState({
            exportableItems
        });
    };

    // exports a CSV based on exportable-item-list.
    exportDataToCSV = () =>
    {
        const { items, exportableItems } = this.state;

        const columnDelimiter = ',';
        const lineDelimiter = '\n';
        const keys = Object.keys(items[0]);

        let result = '';
        result += keys.join(columnDelimiter);
        result += lineDelimiter;

        const dl = "data:text/csv;charset=utf-8," + result + exportableItems;
        window.open(encodeURI(dl));

        this.setState({
            selectedItems: [  ],
            exportableItems: [  ]
        }, () => {
            this.setPage(0);
            this.filterItems();
            this.calcPageNumbers();
        })
    };

    render() {
        const { i18n } = this.context;
        const { columns, renderItems, currentPage, sorting, fixed, selectedItems, items, openEditMenu, canBeSaved } = this.state;
        const { styling, options } = this.props;

        return (
            <div>
                {
                    options.showEditMenu &&
                    <div className="table-editor text-right">
                        <span className="table-filler">
                        {
                            <span className="table-search">
                                <input className="table-search-input" type="text" placeholder={ i18n.getMessage('Table.search.placeholder') } />
                                <span className="glyphicon glyphicon-search" aria-hidden="true"/>
                            </span>
                        }
                        {
                            openEditMenu &&
                            <span>
                                <button
                                    type="submit"
                                    className={ 'btn btn-default' }
                                    onClick={ this.handleAddButton.bind(this) }
                                >
                                    <span className="glyphicon glyphicon-plus" aria-hidden="true"/>&nbsp;&nbsp;{ i18n.getMessage('Table.menu.add') }
                                </button>

                                <button
                                    type="submit"
                                    className={`btn ${ selectedItems.length === 0 ? 'btn-default disabled' : 'btn-default' }` }
                                    onClick={ selectedItems.length !== 0 && this.handleDuplicateButton.bind(this) }
                                >
                                    <span className="glyphicon glyphicon-duplicate" aria-hidden="true"/>&nbsp;&nbsp;{ i18n.getMessage('Table.menu.duplicate') }
                                </button>

                                <button
                                    type="submit"
                                    className={`btn ${ selectedItems.length === 0 ? 'btn-default disabled' : 'btn-default' }` }
                                    onClick={selectedItems.length !== 0 && this.handleDeleteButton.bind(this)}
                                >
                                    <span className="glyphicon glyphicon-remove" aria-hidden="true"/>&nbsp;&nbsp;{ i18n.getMessage('Table.menu.delete') }
                                </button>

                                <button
                                    type="submit"
                                    className={`btn ${ items.length > 0 ? 'btn-default' : 'btn-default disabled' }` }
                                    onClick={ items.length > 0 && this.handleExportButton.bind(this) }
                                >
                                    <span className="glyphicon glyphicon-cloud-download" aria-hidden="true"/>&nbsp;&nbsp;{ selectedItems.length === 0 ? i18n.getMessage('Table.menu.export') : i18n.getMessage('Table.menu.exportSelected') }
                                </button>

                                <button
                                    type="submit"
                                    className={`btn ${ canBeSaved === false ? 'btn-default disabled' : 'btn-success' }` }
                                    //onClick={ this.state.canBeSaved && this.handleSaveButton().bind(this) }
                                >
                                    <span className="glyphicon glyphicon-cloud-upload" aria-hidden="true"/>&nbsp;&nbsp;{ i18n.getMessage('Table.menu.save') }
                                </button>
                            </span>
                        }
                        {
                            <button
                                type="submit"
                                className={`btn ${ openEditMenu ? 'btn-info' : 'btn-default' }` }
                                onClick={this.handleEditableButton.bind(this)}
                            >
                                <span className="glyphicon glyphicon-pencil" aria-hidden="true"/>
                            </button>
                        }
                        </span>
                    </div>
                }

                <table
                    className={`table table-hover
                        ${styling.striped ? ' table-striped' : ''}
                        ${styling.condensed ? ' table-condensed' : ''}
                        ${styling.bordered ? ' table-bordered' : ''}
                    `}
                    style={{tableLayout: (options.fixed ? 'fixed' : 'auto')}}
                >
                    <thead className="thead-inverse">
                    <tr>
                        {this.props.groupBy && <th style={{width: '3.5rem'}} />}
                        { openEditMenu && <th style={{width: '3.5rem'}} />}
                        {columns.map((col, index) => {
                            return (
                                <th key={col.key} style={{width: col.width}}>
                                    <a onClick={(e) => {
                                        e.preventDefault();
                                        this.applySort(col.key)
                                    }}>
                                        {col.name}
                                        {sorting.key === col.key && (sorting.order === 'asc' ?
                                            <span>&nbsp;<i className="fa fa-caret-down"/></span>
                                            :
                                            <span>&nbsp;<i className="fa fa-caret-up"/></span>
                                        )}
                                    </a>
                                </th>
                            )
                        })}
                    </tr>
                    </thead>
                    <tbody>
                    {
                        renderItems.map((item, index) => ([
                            (<tr key={index} className={`${selectedItems.indexOf(item._id) >= 0 ? 'info' : ''} ${ openEditMenu ? 'row-selected' : ''}`}>
                                {this.props.groupBy &&
                                <td
                                    style={{textAlign: 'center', width: '3.5rem'}}
                                    onClick={e => {
                                        item.__showAll = !item.__showAll;
                                        this.setState({renderItems});
                                    }}
                                >
                                    {item.__showAll ?
                                        <span>&nbsp;<i className="fa fa-caret-down fa-lg"/></span>
                                        :
                                        <span>&nbsp;<i className="fa fa-caret-right fa-lg"/></span>
                                    }
                                </td>}
                                {
                                    openEditMenu &&
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.indexOf(item._id) >= 0 ? 'checked' : ''}
                                            onClick={ this.handleSelectionChange.bind(this, item._id) }
                                        />
                                    </td>
                                }
                                {
                                    columns.map((col) => (
                                        <td key={col.key} className={col.className} style={{
                                            overflow: (fixed && !col.showOverflow) ? 'hidden' : 'visible',
                                            textOverflow: !col.disableEllipsis && 'ellipsis'
                                        }}>
                                            {
                                                openEditMenu ?
                                                <input
                                                    type="text"
                                                    className="table-input"
                                                    value={ col.value ? col.value(item) : item[col.key] }
                                                    placeholder={ col.key }
                                                    onChange={ (e) => this.handleListValueChange(col.key, e.target.value, item._id) }
                                                />
                                                :
                                                <span
                                                    style={{'whiteSpace': 'nowrap'}}
                                                    data-placement='auto'
                                                    data-toggle={'tooltip'}
                                                    data-html="true"
                                                    title={
                                                        typeof (col.value ? col.value(item) : item[col.key]) === 'string' &&
                                                        col.value ? col.value(item) : item[col.key]
                                                    }
                                                >
                                                    {col.value ? col.value(item) : item[col.key] || "\xa0"}
                                                </span>
                                            }
                                        </td>
                                    ))
                                }
                            </tr>),
                            item.__showAll && (item.__subItems || []).map((item) => (
                                <tr>
                                    <td/>
                                    {columns.map((col) => (
                                        <td key={col.key} className={col.className} style={{
                                            overflow: (fixed && !col.showOverflow) ? 'hidden' : 'visible',
                                            textOverflow: !col.disableEllipsis && 'ellipsis',
                                        }}>
                                            <span
                                                style={{'whiteSpace': 'nowrap'}}
                                                data-placement='auto'
                                                data-toggle={'tooltip'}
                                                data-html="true"
                                                title={
                                                    typeof (col.value ? col.value(item) : item[col.key]) === 'string' &&
                                                    col.value ? col.value(item) : item[col.key]
                                                }
                                            >
                                                {
                                                    col.subItemValue ? col.subItemValue(item) :
                                                        col.value ? col.value(item) : item[col.key]
                                                }
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ]))
                    }
                    </tbody>
                </table>

                <div className='text-right'>
                    <nav aria-label="Page navigation">
                        <ul className="pagination" ref={ref => this.pagination = ref}>
                            {
                                options.showPageSize &&
                                <li>
                                    <div className="form-group page-size-options">
                                        <div className="input-group">
                                            <div className="input-group-addon">{ i18n.getMessage('Table.pagination.showAmount') }</div>
                                            <select
                                                className="form-control"
                                                value={ this.state.pageSize }
                                                onChange={ this.changePageSize.bind(this) }
                                            >
                                                { this.setPageSizeOptions() }
                                            </select>
                                        </div>

                                        <br/>
                                    </div>
                                </li>
                            }
                            <li className={this.state.showPrev ? '' : 'disabled'}>
                                <a aria-label="Previous" onClick={(e) => {e.preventDefault(); this.previous()}}>
                                    <span aria-hidden="true">&laquo;</span>
                                </a>
                            </li>
                            {
                                (this.state.pages || []).map((page, idx) => (
                                    <li className={(currentPage + 1 === page) && 'active'} key={idx}>
                                        <a onClick={(e) => {e.preventDefault(); this.setPage(page - 1)}}>
                                            {page}
                                        </a>
                                    </li>
                                ))
                            }
                            <li className={this.state.showNext ? '' : 'disabled'}>
                                <a aria-label="Next" onClick={(e) => {e.preventDefault(); this.next()}}>
                                    <span aria-hidden="true">&raquo;</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        )
    }
}

export default Table;
