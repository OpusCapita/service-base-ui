import React from 'react';
import PropTypes from 'prop-types';
import request from 'superagent';
import ContextComponent from './../ContextComponent.react';
import translations from './i18n';

import { EditorMenu } from './EditorMenu.react';
import { Search } from './Search.react'

import Editor from './helpers/Editor';
import Common from './helpers/Common';

import './Table.css';

class Table extends ContextComponent
{
    static propTypes = {
        items: PropTypes.array.isRequired,
        columns: PropTypes.array.isRequired,
        defaultSort: PropTypes.object,
        groupBy: PropTypes.func,
        groupOrderBy: PropTypes.string,
        styling: PropTypes.object,
        options: PropTypes.object
    };

    static defaultProps = {
        groupOrderBy: 'id',
        data: [],
        styling: {
            striped: true,      // show table striped?
            condensed: true,    // show table condensed?
            bordered: true      // show table bordered?
        },
        options: {
            pageSize: 10,       // show how many rows per page?
            showPageSize: true, // show page size selector?
            showEditMenu: true, // show the edit menu?
            openEditMenu: true, // open edit menu and allow rows to be edited?,
            locked: [],
            fixed: true
        }
    };

    constructor(props, context)
    {
        super(props);

        this.state = {
            columns: props.columns,
            items: [],
            pageSize: props.options.pageSize,
            fixed: props.options.fixed,
            renderItems: [],
            selectedItems: [],
            startIndex: 0,
            numPages: 0,
            sorting: {},
            showPrev: true,
            showNext: true,
            openEditMenu: props.options.openEditMenu,
            showEditMenu: props.options.showEditMenu,
            canBeSaved: false,
            exportableitems: [],
            tempItems: [],
            filtertext: '',
            lockedRows: props.options.locked,
            loading: false
        };

        context.i18n.register('Table', translations);
    }

    async componentDidMount()
    {
        this.setState({ loading: true });

        if(this.props.data === []) await this.loadItemsFromProps();
        else await this.loadItemsFromDatabase();
    }

    componentWillReceiveProps(nextProps)
    {
        this.setState({
            items: nextProps.items, columns: nextProps.columns
        }, () =>
        {
            const { defaultSort } = this.props;

            this.groupItems();

            if(defaultSort) this.applySort(defaultSort.key, defaultSort.order);

            this.filterItems();
            this.calcPageNumbers();
        });
    }

    /**
     * Loads items from database.
     *
     * @async
     * @function loadItemsFromDatabase
     */
    loadItemsFromDatabase = async () =>
    {
        const url = this.props.data;

        try
        {
            const data = await request.get(url);

            const items = data.body;

            await this.enumerateItems(items);
        }
        catch(e)
        {
            console.log(e.message);
        }
    };

    /**
     * Load items to populate item-list.
     *
     * @async
     * @function loadItemsFromProps
     */
    async loadItemsFromProps()
    {
        try
        {
            const items = this.props.items;

            await this.enumerateItems(items)
        }
        catch(e)
        {
            console.log(e.message);
        }
    };

    /**
     * enumerates items in table-list
     *
     * @async
     * @function enumerateItems
     * @param {array} items - List of current items in table-list.
     */
    enumerateItems = async (items) =>
    {
        const { defaultSort } = this.props;

        this.checkPageChangeButtonVisibility(0);

        let numberedItems = [];

        try
        {
            numberedItems = await Common.setListItemIdentifiers(items);

            this.setState({
                items: numberedItems,
                initialItems: numberedItems,
                loading: false
            }, () =>
            {
                this.groupItems();
                if(defaultSort)
                {
                    this.applySort(defaultSort.key, defaultSort.order)
                }
                this.filterItems();
                this.calcPageNumbers();
            });
        }
        catch(e)
        {
            console.log(e.message);
        }
    };

    /**
     * Calculates amount of pages for table-list
     *
     * @function calcPageNumbers
     */
    calcPageNumbers()
    {
        const { startIndex, pageSize, items } = this.state;

        const numPages = Math.ceil(items.length / pageSize);
        const currentPage = startIndex / pageSize;

        if(numPages > 7)
        {
            let startPage = Math.max(2, currentPage - 1);
            startPage = startPage < (numPages - 5) ? startPage : numPages - 5;
            const endPage = Math.min(startPage + 5, numPages);

            let pages = Common.range(startPage, endPage);
            if(startPage > 2)
            {
                pages[ 0 ] = '..';
            }
            if(numPages > endPage)
            {
                pages[ pages.length - 1 ] = '..';
            }
            pages = [ 1, ...pages, numPages ];
            this.setState({ pages, currentPage });
            return;
        }
        this.setState({ currentPage, pages: Common.range(1, numPages + 1) });
    }

    /**
     * Applies sorting methods to table-list
     *
     * @function applySort
     * @param {string} key - Current value key.
     * @param {string} order - Order by asc (ascending) or desc (descending).
     */
    applySort(key, order)
    {
        const { columns, items, sorting } = this.state;
        if(!order)
        {
            order = 'asc';
            if(key === sorting.key && sorting.order === 'asc')
            {
                order = 'desc';
            }
        }
        let col = columns.find(c => c.key === key);

        const defaultSortMethod = (a, b) =>
        {
            let comparison = 0;

            let valA = col.sortValue ? col.sortValue(a) :
                col.value ? col.value(a) : a[ col.key ];
            let valB = col.sortValue ? col.sortValue(b) :
                col.value ? col.value(b) : b[ col.key ];

            valA = (typeof valA === 'string') ? valA.toLowerCase() : valA;
            valB = (typeof valB === 'string') ? valB.toLowerCase() : valB;

            if(valA > valB || (valA != null && valB == null))
            {
                comparison = 1;
            }
            else if(valA < valB || (valA == null && valB != null))
            {
                comparison = -1;
            }

            return comparison;
        };

        let sortMethod = col.sortMethod || defaultSortMethod;
        const compare = (a, b) =>
        {
            let comparison = sortMethod(a, b);
            return (order === 'desc') ? (comparison * -1) : comparison;
        };

        items.sort(compare);
        this.setState({
            items, sorting: { key, order }
        }, () =>
        {
            this.filterItems();
        })
    }

    /**
     * Groups items in table-list according to props.groupBy
     *
     * @function groupItems
     */
    groupItems()
    {
        const { groupBy, groupOrderBy } = this.props;
        if(groupBy)
        {
            const { items } = this.state;
            for(let idxA = 0; idxA < items.length; idxA++)
            {
                const keyA = groupBy(items[ idxA ]);

                let idxB = idxA + 1;
                while(idxB < items.length)
                {
                    const keyB = groupBy(items[ idxB ]);

                    if(keyA === keyB)
                    {
                        let subItems = items[ idxA ].__subItems || [];
                        if(items[ idxA ][ groupOrderBy ] > items[ idxB ][ groupOrderBy ])
                        {
                            subItems.push(items[ idxB ]);
                        }
                        else
                        {
                            subItems.push(items[ idxA ]);
                            items[ idxA ] = items[ idxB ];
                        }
                        items[ idxA ].__subItems = subItems;
                        items.splice(idxB, 1);
                    }
                    else
                    {
                        idxB++;
                    }
                }
            }
            for(let item of items)
            {
                const sortMethod = (a, b) =>
                {
                    let comparison = 0;

                    let valA = a[ groupOrderBy ];
                    let valB = b[ groupOrderBy ];

                    if(valA < valB)
                    {
                        comparison = 1;
                    }
                    else if(valA > valB)
                    {
                        comparison = -1;
                    }

                    return comparison;
                };
                item.__subItems && item.__subItems.sort(sortMethod);
            }
            this.setState({ items });
        }
    }

    /**
     * Filter items according to page size
     *
     * @function filterItems
     */
    filterItems()
    {
        const { startIndex, pageSize, items } = this.state;

        const renderItems = items.slice(startIndex, startIndex + pageSize);
        const lastOffset = this.pagination.offsetTop;
        this.setState({
            renderItems
        }, () =>
        {
            const diff = this.pagination.offsetTop - lastOffset;
            window.scrollBy(0, diff);
        });
    }

    /**
     * Go to next page
     *
     * @function next
     */
    next()
    {
        const { pageSize, startIndex, items } = this.state;
        const newIndex = startIndex + pageSize;
        if(newIndex < items.length)
        {
            this.setState({
                startIndex: newIndex
            }, () =>
            {
                this.filterItems();
                this.checkPageChangeButtonVisibility(newIndex);
                this.calcPageNumbers();
            });
        }
    }

    /**
     * Go to previous page
     *
     * @function previous
     */
    previous()
    {
        const { pageSize, startIndex } = this.state;
        const newIndex = startIndex - pageSize;
        if(newIndex >= 0)
        {
            this.setState({
                startIndex: newIndex
            }, () =>
            {
                this.filterItems();
                this.checkPageChangeButtonVisibility(newIndex);
                this.calcPageNumbers();
            });
        }
    }

    /**
     * Sets current page of table.
     *
     * @function setPage
     * @param {int} pageNum - Number of page.
     */
    setPage(pageNum)
    {
        const { pageSize } = this.state;

        if(Number.isInteger(pageNum))
        {
            this.setState({
                startIndex: pageNum * pageSize
            }, () =>
            {
                this.filterItems();
                this.calcPageNumbers();
                this.checkPageChangeButtonVisibility(pageNum * pageSize)
            });
        }
    }

    /**
     * Check if prev or next page button should be visible.
     *
     * @function checkPageChangeButtonVisibility
     * @param {int} pageNum - Current number of page
     */
    checkPageChangeButtonVisibility = (pageNum) =>
    {
        const {
            pageSize,
            items
        } = this.state;

        this.setState({
            showPrev: (pageNum * pageSize !== 0),
            showNext: (pageNum + pageSize) <= items.length
        });
    };

    /**
     * Checks the current columns state.
     *
     * @function checkColumnState
     * @param column - Current column
     * @param item - Current item
     * @returns {string}
     */
    checkColumnState = (column, item) =>
    {
        const { options } = this.props;
        const { items } = this.state;

        let noRequiredEmpty = false;
        let noRequiredMultiple = false;

        if(options.required.indexOf(column.key) >= 0 && item[ column.key ] === (null || ''))
        {
            noRequiredEmpty = false;
            return 'danger';
        }
        else
        {
            noRequiredEmpty = true;
        }

        let val = item[ column.key ];

        let tempArray = [];

        if(options.unique.indexOf(column.key) >= 0)
        {
            items.forEach((itx) =>
            {
                if(itx[ column.key ] === val)
                {
                    tempArray.push(item[ column.key ]);
                }
            });

            if(tempArray.length > 1 && tempArray.indexOf(item[ column.key ]) >= 0)
            {
                noRequiredMultiple = false;
                return 'danger';
            }
            else
            {
                noRequiredMultiple = true;
            }
        }
    };

    /**
     *
     * Set availible options for visible page size.
     *
     * @function setPageSizeOptions
     * @returns {Array}
     */
    setPageSizeOptions = () =>
    {
        const { items } = this.state;

        let options = [];

        items.forEach((item, index) =>
        {
            if(index % 25 === 0 && index !== 0)
            {
                options.push(<option key={index} value={index}>{index}</option>);
            }
        });

        options.push(<option key={options.length + 1} value={items.length}>All</option>);

        return options;
    };

    /**
     * Handles the change of values in table-list.
     *
     * @function handleListValueChange
     * @param key - Current list-key.
     * @param value - Current list-value.
     * @param id - Current list-id.
     */
    handleListValueChange = (key, value, id) =>
    {
        const { items } = this.state;

        if(items)
        {
            let newList = items.map((item) =>
            {
                if(item._id === id)
                {
                    item[ key ] = value;
                    item[ 'changedOn' ] = new Date().toISOString();
                    item[ 'changedBy' ] = this.context.userData.id
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

    /**
     * Change visible size of page.
     *
     * @function changePageSize
     * @param {object} event - Currently fired event.
     */
    changePageSize = (event) =>
    {
        this.setState({
            pageSize: event.target.value
        }, () =>
        {
            this.setPage(0);
            this.filterItems();
            this.calcPageNumbers();
        });
    };

    /**
     * Handles value given by search-input.
     *
     * @function handleSearchInput
     * @param {object} event - Currently fired event
     */
    handleSearchInput = (event) =>
    {
        this.setState({
            filtertext: event.target.value,
            tempItems: this.state.items
        }, () =>
        {
            this.searchItems();
        });
    };

    /**
     * Handles row selection.
     *
     * @function handleSelectedChange
     * @param {int} index - Current row index.
     */
    handleSelectionChange = (index) =>
    {
        if(this.state.selectedItems.indexOf(index) >= 0)
        {
            let deleteIndex = this.state.selectedItems.map((item) =>
            {
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

    /**
     * Handles edit-button state.
     *
     * @function handleEditableButton
     */
    handleEditableButton = () =>
    {
        this.setState({
            openEditMenu: !this.state.openEditMenu
        })
    };

    /**
     * Handles add-button.
     *
     * @function handleAddButton
     */
    handleAddButton = () =>
    {
        const { i18n, userData, showNotification } = this.context;
        const { items } = this.props;

        Editor.addItem(items, userData.id).then((newItem) =>
        {
            showNotification(i18n.getMessage('Table.notification.add.success'), 'info');

            this.setState({
                items: [ newItem, ...this.state.items ]
            }, () =>
            {
                this.setPage(0);
                this.filterItems();
                this.calcPageNumbers();
            });
        })
        .catch((e) =>
        {
            showNotification(i18n.getMessage('Table.notification.add.error'), 'error');
        });
    };

    /**
     * Handles duplicate-button.
     *
     * @function handleDuplicateButton
     */
    handleDuplicateButton = () =>
    {
        const { i18n, userData, showNotification } = this.context;
        const { items, selectedItems } = this.state;

        Editor.duplicateItem(items, selectedItems, userData.id).then((newItems) =>
        {
            showNotification(selectedItems.length === 1 ?
                i18n.getMessage('Table.notification.duplicate.success.single')
                :
                i18n.getMessage('Table.notification.duplicate.success.multiple', { amount: selectedItems.length }),
                'info');

            const duplicatedItems = Common.setListItemIdentifiers(newItems);

            this.setState({
                items: duplicatedItems,
                selectedItems: []
            }, () =>
            {
                this.setPage(0);
                this.filterItems();
                this.calcPageNumbers();
            })
        })
        .catch((e) =>
        {
            showNotification(i18n.getMessage('Table.notification.duplicate.error'), 'error');
        });
    };

    /**
     * Handles delete-button.
     *
     * @function handleDeleteButton
     */
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

    /**
     * Handles save-button.
     *
     * @handleSaveButton
     */
    handleSaveButton = () =>
    {
    };

    /**
     * Handles export-button.
     *
     * @function handleExportButton
     */
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
                    i18n.getMessage('Table.dialog.export.title.all'))
        );
        const message = (
            selectedItems.length === 1 ? i18n.getMessage('Table.dialog.export.message.single') : (
                selectedItems.length >= 1 ?
                    i18n.getMessage('Table.dialog.export.message.multiple', { amount: selectedItems.length })
                    :
                    i18n.getMessage('Table.dialog.export.message.all'))
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

    /**
     * Triggers action for item deletion.
     *
     * @function deleteItems
     */
    deleteItems = () =>
    {
        const { i18n, showNotification } = this.context;
        const { items, selectedItems } = this.state;

        Editor.deleteItem(items, selectedItems).then((newItems) =>
        {
            showNotification(selectedItems.length === 1 ?
                i18n.getMessage('Table.notification.delete.success.single')
                :
                i18n.getMessage('Table.notification.delete.success.multiple', { amount: selectedItems.length }),
                'info');

            this.setState({
                items: newItems,
                selectedItems: []
            }, () =>
            {
                this.setPage(0);
                this.filterItems();
                this.calcPageNumbers();
            })
        })
        .catch(() =>
        {
            showNotification(i18n.getMessage('Table.notification.delete.error'), 'error');
        });
    };

    /**
     * Creates a list based on either all, or selected rows for export.
     *
     * @function createExportableItemList
     */
    createExportableItemlist = () =>
    {
        const { items, selectedItems } = this.state;

        let exportableItems = [];
        let itemList = [];

        if(selectedItems.length >= 1)
        {
            let tempItems = items.filter((data) =>
            {
                if(selectedItems.indexOf(data._id) >= 0) return data;
            });

            itemList = JSON.stringify(tempItems);
        }
        else
        {
            itemList = JSON.stringify(items);
        }

        const re = new RegExp(',', 'g');

        const array = typeof itemList != 'object' ? JSON.parse(itemList) : itemList;

        array.forEach((content) =>
        {
            let line = '';

            for(let item in content)
            {
                if(line !== '') line += ';';

                if(content[ item ])
                {
                    if(typeof content[ item ] === 'object' && content[ item ].constructor === Object)
                    {
                        content[ item ] = JSON.stringify(content[ item ]);
                    }

                    content[ item ] = content[ item ].toString().replace(re, ',');
                }

                line += content[ item ];
            }

            exportableItems += line + '\r\n';
        });

        this.setState({ exportableItems });
    };

    /**
     * Exports a CSV based on exportable-item-list.
     *
     * @function exportDataToCSV
     */
    exportDataToCSV = () =>
    {
        const {
            i18n,
            showNotification
        } = this.context;
        const {
            exportableItems,
            selectedItems,
            renderItems
        } = this.state;

        const columnDelimiter = ';',
            lineDelimiter = '\n',
            keys = Object.keys(renderItems[ 0 ]);

        let result = '';

        result += keys.join(columnDelimiter);
        result += lineDelimiter;

        try
        {
            const dl = 'data:text/csv;charset=utf-8,' + result + exportableItems;

            window.open(encodeURI(dl));

            showNotification(
                selectedItems.length === 1 ?
                    i18n.getMessage('Table.notification.export.success.single')
                    :
                    (selectedItems.length >= 1 ?
                            i18n.getMessage('Table.notification.export.success.multiple', { amount: selectedItems.length })
                            :
                            i18n.getMessage('Table.notification.export.success.all')
                    )
            );

            this.setState({ selectedItems: [], exportableItems: [] }, () =>
            {
                this.setPage(0);
                this.filterItems();
                this.calcPageNumbers();
            });
        }
        catch(e)
        {
            showNotification(i18n.getMessage('Table.notification.export.error'), 'error');
        }
    };

    /**
     * Triggers action for searching.
     *
     * @function searchItems
     */
    searchItems = () =>
    {
        const {
            filtertext,
            tempItems,
            items
        } = this.state;

        Editor.searchForMatches(filtertext, tempItems, items).then((newItems) =>
        {
            this.setState({ renderItems: newItems })
        })
    };

    render()
    {
        const { i18n } = this.context;
        const {
            styling,
            options
        } = this.props;
        const {
            columns,
            renderItems,
            currentPage,
            sorting,
            fixed,
            selectedItems,
            items,
            openEditMenu,
            showEditMenu,
            canBeSaved,
            filtertext,
            loading
        } = this.state;

        return (
            <div>
                {
                    <div className="table-editor text-right">
                        <span className="table-filler">
                            <Search
                                handleSearchInput={this.handleSearchInput.bind(this)}
                                filtertext={filtertext}
                            />
                            <EditorMenu
                                items={items}
                                selectedItems={selectedItems}
                                canBeSaved={canBeSaved}
                                isShown={showEditMenu}
                                isOpen={openEditMenu}
                                handleAddButton={this.handleAddButton.bind(this)}
                                handleDuplicateButton={this.handleDuplicateButton.bind(this)}
                                handleDeleteButton={this.handleDeleteButton.bind(this)}
                                handleExportButton={this.handleExportButton.bind(this)}
                                handleSaveButton={this.handleSaveButton.bind(this)}
                                handleEditorButton={this.handleEditableButton.bind(this)}
                            />
                        </span>
                    </div>
                }
                <div className="outer">
                    <div className="inner">
                        {
                            loading ?
                                <div className="loadingScreen">
                                    <span className="loader fa fa-spinner fa-lg fa-spin"/>
                                </div>
                                :
                                <table
                                    className={Common.setTableStyle(styling)}
                                    style={{ tableLayout: (options.fixed ? 'fixed' : 'auto') }}
                                >

                                    <thead className="thead-inverse">
                                    <tr>
                                        {this.props.groupBy && <th style={{ width: '3.5rem' }}/>}
                                        {openEditMenu && <th style={{ width: '3.5rem' }}/>}
                                        {columns.map((col) =>
                                        {
                                            return (
                                                <th key={col.key} style={{ width: col.width }}>
                                                    <a onClick={(e) =>
                                                    {
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
                                            (<tr key={index}
                                                 className={`${selectedItems.indexOf(item._id) >= 0 ? 'info' : ''} ${openEditMenu ? 'row-selected' : ''}`}>
                                                {this.props.groupBy &&
                                                <td
                                                    style={{ textAlign: 'center', width: '3.5rem' }}
                                                    onClick={e =>
                                                    {
                                                        item.__showAll = !item.__showAll;
                                                        this.setState({ renderItems });
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
                                                            onClick={this.handleSelectionChange.bind(this, item._id)}
                                                        />
                                                    </td>
                                                }
                                                {
                                                    columns.map((col) => (
                                                        <td key={col.key}
                                                            className={`${col.className} ${this.checkColumnState(col, item)}`}
                                                            style={{
                                                                overflow: (fixed && !col.showOverflow) ? 'hidden' : 'visible',
                                                                textOverflow: !col.disableEllipsis && 'ellipsis'
                                                            }}>
                                                            {
                                                                openEditMenu ?
                                                                    <input
                                                                        type="text"
                                                                        className={`table-input ${this.state.lockedRows.indexOf(col.name) > -1 ? 'locked' : ''}`}
                                                                        value={
                                                                            Common.formatColumnValue(item[ col.key ], this.context.i18n)
                                                                        }
                                                                        onChange={(e) => this.handleListValueChange(col.key, e.target.value, item._id)}
                                                                        disabled={this.state.lockedRows.indexOf(col.name) > -1}
                                                                    />
                                                                    :
                                                                    <span
                                                                        style={{ 'whiteSpace': 'nowrap' }}
                                                                        data-placement='auto'
                                                                        data-toggle={'tooltip'}
                                                                        data-html="true"
                                                                        title={
                                                                            Common.formatColumnValue(item[ col.key ], this.context.i18n)
                                                                        }
                                                                    >
                                                            {
                                                                Common.formatColumnValue(item[ col.key ], this.context.i18n)
                                                            }
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
                                                            textOverflow: !col.disableEllipsis && 'ellipsis'
                                                        }}>
                                                    <span
                                                        style={{ 'whiteSpace': 'nowrap' }}
                                                        data-placement='auto'
                                                        data-toggle={'tooltip'}
                                                        data-html="true"
                                                        title={
                                                            typeof (col.value ? col.value(item) : item[ col.key ]) === 'string' &&
                                                            col.value ? col.value(item) : item[ col.key ]
                                                        }
                                                    >
                                                        {
                                                            col.subItemValue ? col.subItemValue(item) :
                                                                col.value ? col.value(item) : item[ col.key ]
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
                        }
                    </div>
                </div>

                <div className='text-right'>
                    <nav aria-label="Page navigation">
                        <ul className="pagination" ref={ref => this.pagination = ref}>
                            {
                                options.showPageSize &&
                                <li>
                                    <div className="form-group page-size-options">
                                        <div className="input-group">
                                            <div
                                                className="input-group-addon">{i18n.getMessage('Table.pagination.showAmount')}</div>
                                            <select
                                                className="form-control"
                                                value={this.state.pageSize}
                                                onChange={this.changePageSize.bind(this)}
                                            >
                                                {this.setPageSizeOptions()}
                                            </select>
                                        </div>

                                        <br/>
                                    </div>
                                </li>
                            }
                            <li className={this.state.showPrev ? '' : 'disabled'}>
                                <a aria-label="Previous" onClick={(e) =>
                                {
                                    e.preventDefault();
                                    this.previous()
                                }}>
                                    <span aria-hidden="true">&laquo;</span>
                                </a>
                            </li>
                            {
                                (this.state.pages || []).map((page, idx) => (
                                    <li className={(currentPage + 1 === page) && 'active'} key={idx}>
                                        <a onClick={(e) =>
                                        {
                                            e.preventDefault();
                                            this.setPage(page - 1)
                                        }}>
                                            {page}
                                        </a>
                                    </li>
                                ))
                            }
                            <li className={this.state.showNext ? '' : 'disabled'}>
                                <a aria-label="Next" onClick={(e) =>
                                {
                                    e.preventDefault();
                                    this.next()
                                }}>
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
