import React from 'react';
import PropTypes from 'prop-types';
import request from 'superagent';
import ContextComponent from './../ContextComponent.react';
import translations from './i18n';

import { EditorMenu } from './components/EditorMenu.react';
import { Search } from './components/Search.react'
import { TableHeader } from './components/TableHeader.react';
import { TableLoading } from './components/TableLoading.react';
import { TableBody } from './components/TableBody.react';

import Editor from './utils/Editor';
import Common from './utils/Common';

import './Table.less';

export default class Table extends ContextComponent
{
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
        data: [  ],
        styling: {
            striped: true,       // show table striped?
            condensed: true,     // show table condensed?
            bordered: true       // show table bordered?
        },
        options: {
            pageSize: 10,        // show how many rows per page?
            showRowNumber: true, // show row number in table?
            showPageSize: true,  // show page size selector?
            showEditMenu: true,  // show the edit menu?
            openEditMenu: true,  // open edit menu and allow rows to be edited?,
            locked: [  ],
            fixed: true,
            defaultSearch: 'id',
        }
    };

    constructor(props, context)
    {
        super(props);

        this.state = {
            columns: props.columns,
            items: [  ],
            oldItems: [  ],
            pageSize: props.options.pageSize,
            fixed: props.options.fixed,
            renderItems: [  ],
            selectedItems: [  ],
            startIndex: 0,
            numPages: 0,
            sorting: {  },
            showPrev: true,
            showNext: true,
            openEditMenu: props.options.openEditMenu,
            showEditMenu: props.options.showEditMenu,
            canBeSaved: false,
            canBeExported: true,
            tempItems: [  ],
            filterText: '',
            lockedCols: props.options.locked,
            loading: false,
        };

        context.i18n.register('Table', translations);
    }

    async componentDidMount()
    {
        this.setState({ loading: true });

        if(this.props.data === [  ]) await this.loadItemsFromProps();
        else await this.loadItemsFromDatabase();
    }

    componentWillReceiveProps(nextProps)
    {
        this.setState({
            items: nextProps.items,
            columns: nextProps.columns
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
        const { i18n, showNotification } = this.context;

        try
        {
            const url = this.props.data,
                  data = await request.get(url),
                  items = data.body;

            await this.enumerateItems(items);
        }
        catch(e)
        {
            showNotification(i18n.getMessage('Table.notification.fetch.error.database'), 'error');
        }
    };

    /**
     * Load items to populate item-list.
     *
     * @async
     * @function loadItemsFromProps
     */
    loadItemsFromProps = async () =>
    {
        const { i18n, showNotification } = this.context;

        try
        {
            const items = this.props.items;

            await this.enumerateItems(items)
        }
        catch(e)
        {
            showNotification(i18n.getMessage('Table.notification.fetch.error.local'), 'error');
        }
    };

    /**
     * enumerates items in table-list
     *
     * @async
     * @function enumerateItems
     * @param {array} items - List of current items in table-list.
     */
    enumerateItems = async items =>
    {
        const { defaultSort } = this.props;

        this.checkPageChangeButtonState(0);

        let numberedItems = [  ];

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
                    this.applySort(defaultSort.key, defaultSort.order);
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
    calcPageNumbers = () =>
    {
        const { startIndex, pageSize, items } = this.state;

        const numPages = Math.ceil(items.length / pageSize),
              currentPage = startIndex / pageSize;

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
    };

    /**
     * Applies sorting methods to table-list
     *
     * @function applySort
     * @param {string} key - Current value key.
     * @param {string} order - Order by asc (ascending) or desc (descending).
     */
    applySort = (key, order) =>
    {
        const { columns, items, sorting } = this.state;

        if(!order)
        {
            order = 'asc';
            if(key === sorting.key && sorting.order === 'asc') order = 'desc';
        }

        const col = columns.find(c => c.key === key);

        const defaultSortMethod = (a, b) =>
        {
            let comparison = 0;

            let valA = col.sortValue ? col.sortValue(a) :
                col.value ? col.value(a) : a[ col.key ],
                valB = col.sortValue ? col.sortValue(b) :
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

        const sortMethod = col.sortMethod || defaultSortMethod;

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
    };

    /**
     * Groups items in table-list according to props.groupBy
     *
     * @function groupItems
     */
    groupItems = () =>
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
                        let subItems = items[ idxA ].__subItems || [  ];

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

                    const valA = a[ groupOrderBy ];
                    const valB = b[ groupOrderBy ];

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
    };

    /**
     * Filter items according to page size
     *
     * @function filterItems
     */
    filterItems = () =>
    {
        const { startIndex, pageSize, items } = this.state;

        const renderItems = items.slice(startIndex, startIndex + pageSize),
              lastOffset = this.pagination.offsetTop;

        this.setState({
            renderItems
        }, () =>
        {
            const diff = this.pagination.offsetTop - lastOffset;
            window.scrollBy(0, diff);
        });
    };

    /**
     * Go to next page
     *
     * @function next
     */
    next = () =>
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
                this.checkPageChangeButtonState(newIndex);
                this.calcPageNumbers();
            });
        }
    };

    /**
     * Go to previous page
     *
     * @function previous
     */
    previous = () =>
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
                this.checkPageChangeButtonState(newIndex);
                this.calcPageNumbers();
            });
        }
    };

    /**
     * Sets current page of table.
     *
     * @function setPage
     * @param {int} pageNum - Number of page.
     */
    setPage = pageNum =>
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
                this.checkPageChangeButtonState(pageNum * pageSize)
            });
        }
    };

    /**
     * Check if prev or next page button should be visible.
     *
     * @function checkPageChangeButtonState
     * @param {int} pageNum - Current number of page
     */
    checkPageChangeButtonState = pageNum =>
    {
        const { pageSize, items } = this.state;

        this.setState({
            showPrev: (pageNum * pageSize !== 0),
            showNext: (pageNum + pageSize) <= items.length
        });
    };

    /**
     * Set availible options for visible page size.
     *
     * @function setPageSizeOptions
     * @returns {Array}
     */
    setPageSizeOptions = () =>
    {
        const { items } = this.state;

        const options = [  ];

        items.forEach((item, index) =>
        {
            if(index % this.props.options.pageSize === 0 && index !== 0)
            {
                options.push(<option key={ index } value={ index }>{ index }</option>);
            }
        });

        options.push(<option key={ options.length + 1 } value={ items.length }>All ({items.length})</option>);

        return options;
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
     * Handles the change of values in table-list.
     *
     * @function handleListValueChange
     * @param key - Current list-key.
     * @param colType
     * @param value - Current list-value.
     * @param id - Current list-id.
     */
    handleListValueChange = (key, colType, value, id) =>
    {
        const { items } = this.state;

        if(items)
        {
            const newList = items.map(item =>
            {
                if(item._id === id)
                {
                    if(colType === 'bool')
                    {
                        item[ key ] = !item[ key ];
                    }
                    else
                    {
                        item[ key ] = value;
                    }

                    item[ 'changedOn' ] = new Date().toISOString();
                    item[ 'changedBy' ] = this.context.userData.id;

                    if(item[ 'edited' ])
                    {
                        if(!item.edited.includes(key))
                        {
                            item[ 'edited' ] = [key, ...item.edited];
                        }
                    }
                    else
                    {
                        item[ 'edited' ] = [key];
                    }
                }

                return item;
            });

            this.setState({
                items: newList
            }, () =>
            {
                this.checkCanBeExportedOrSaved();
                this.setPage(0);
                this.filterItems();
                this.calcPageNumbers();
            });
        }
    };

    /**
     * Handles value given by search-input.
     *
     * @function handleSearchInput
     * @param {object} event - Currently fired event
     */
    handleSearchInput = event =>
    {
        this.setState({
            filterText: event.target.value,
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
    handleSelectionChange = index =>
    {
        const { selectedItems } = this.state;

        if(selectedItems.indexOf(index) >= 0)
        {
            const deleteIndex = selectedItems.map(item => item).indexOf(index);

            this.setState({
                selectedItems: selectedItems.filter((item, i) => i !== deleteIndex)
            }, () => this.checkCanBeExportedOrSaved());
        }
        else
        {
            this.setState({
                selectedItems: [ ...selectedItems, index ]
            }, () => this.checkCanBeExportedOrSaved());
        }
    };

    checkCanBeExportedOrSaved = () =>
    {
        const { selectedItems, items } = this.state;

        const stateList = [  ],
            idExistsList = [  ];

        for(const item of items)
        {
            if(item[ 'id' ] === '')
            {
                idExistsList.push(false);
            }
            else
            {
                idExistsList.push(true);
            }

            if(selectedItems.length > 0)
            {
                for(let i = 0; i < selectedItems.length; i++)
                {
                    if(item[ '_id' ] === selectedItems[i])
                    {
                        if(item.edited)
                        {
                            stateList.push(false);
                        }
                        else
                        {
                            stateList.push(true);
                        }
                    }
                }
            }
            else if(selectedItems.length === 0)
            {
                if(item.edited)
                {
                    stateList.push(false);
                }
                else
                {
                    stateList.push(true);
                }
            }

        }

        if(stateList.includes(false))
        {
            this.setState({
                canBeExported: false,
                canBeSaved: !idExistsList.includes(false)
            });
        }
        else
        {
            this.setState({
                canBeExported: true,
                canBeSaved: false
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
            openEditMenu: !this.state.openEditMenu,
            oldItems: this.state.items.slice(),
        }, () => this.checkCanBeExportedOrSaved());
    };

    /**
     * Handles add-button.
     *
     * @function handleAddButton
     */
    handleAddButton = () =>
    {
        const { i18n, userData, showNotification } = this.context;
        const { items } = this.state;

        Editor.addItem(items, userData.id, this.props.columns).then(newItem =>
        {
            showNotification(i18n.getMessage('Table.notification.add.success'), 'info');

            this.setState({
                items: [ newItem, ...this.state.items ]
            }, () =>
            {
                this.checkCanBeExportedOrSaved();
                this.setPage(0);
                this.filterItems();
                this.calcPageNumbers();
            });
        })
        .catch(() => showNotification(i18n.getMessage('Table.notification.add.error'), 'error'));
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

        Editor.duplicateItem(items, selectedItems, userData.id).then(newItems =>
        {
            showNotification(selectedItems.length === 1 ?
                i18n.getMessage('Table.notification.duplicate.success.single')
                :
                i18n.getMessage('Table.notification.duplicate.success.multiple', { amount: selectedItems.length }),
                'info');

            const duplicatedItems = Common.setListItemIdentifiers(newItems);

            this.setState({
                items: duplicatedItems,
                selectedItems: [  ]
            }, () =>
            {
                this.setPage(0);
                this.filterItems();
                this.calcPageNumbers();
            })
        })
        .catch(() => showNotification(i18n.getMessage('Table.notification.duplicate.error'), 'error'));
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
            if(button === 'yes') this.deleteItems();

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
        const { items, columns, selectedItems } = this.state;

        const title = (
            selectedItems.length === 1 ? i18n.getMessage('Table.dialog.export.title.single') : (
                selectedItems.length > 1 ?
                i18n.getMessage('Table.dialog.export.title.multiple')
                :
                i18n.getMessage('Table.dialog.export.title.all')
            )
        );
        const message = (
            selectedItems.length === 1 ? i18n.getMessage('Table.dialog.export.message.single') : (
                selectedItems.length >= 1 ?
                i18n.getMessage('Table.dialog.export.message.multiple', { amount: selectedItems.length })
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
                Editor.createExportableItemList(items, columns, selectedItems, this.context.i18n)
                .then(exportableItems =>
                {
                    this.setState({ exportableItems }, () =>
                    {
                        this.exportDataToCSV();
                    });
                });
            }

            return true;
        };

        this.context.showModalDialog(title, message, onButtonClick, buttons);
    };

    /**
     * Triggers action to delete item.
     *
     * @function deleteItems
     */
    deleteItems = () =>
    {
        const { i18n, showNotification } = this.context;
        const { items, selectedItems } = this.state;

        Editor.deleteItem(items, selectedItems).then(newItems =>
        {
            showNotification(selectedItems.length === 1 ?
            i18n.getMessage('Table.notification.delete.success.single')
            :
            i18n.getMessage('Table.notification.delete.success.multiple', { amount: selectedItems.length }), 'info');

            this.setState({
                items: newItems,
                selectedItems: [  ]
            }, () =>
            {
                this.setPage(0);
                this.filterItems();
                this.calcPageNumbers();
            })
        })
        .catch(() => showNotification(i18n.getMessage('Table.notification.delete.error'), 'error'));
    };

    /**
     * Exports a CSV based on exportable-item-list.
     *
     * @function exportDataToCSV
     */
    exportDataToCSV = () =>
    {
        const { i18n, showNotification } = this.context;
        const { exportableItems, selectedItems, columns, } = this.state;

        const lineDelimiter = '\n';
        let keys = '';

        columns.forEach(column =>
        {
            keys += column.key + ';';
        });

        let result = '';

        result += keys.slice(0, -1);
        result += lineDelimiter;

        try
        {
            const dl = `data:text/csv;charset=utf-8,${result}${exportableItems}`;

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

            this.setState({ selectedItems: [  ], exportableItems: [  ] }, () =>
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
        const { filterText, tempItems } = this.state;

        const foundItems = Editor.searchForMatches(filterText, tempItems, this.props.options.defaultSearch);

        this.setState({ renderItems: foundItems });
    };

    render()
    {
        const { i18n } = this.context;
        const { styling, options } = this.props;
        const { columns, renderItems, currentPage, sorting, selectedItems, items,
                openEditMenu, showEditMenu, canBeSaved, canBeExported, filterText, loading } = this.state;

        let editedAmount = 0;

        for(const item of items)
        {
            if(item.edited)
            {
                editedAmount++;
            }
        }

        return (
            <div>
                {
                    <div className="table-editor text-right">
                        <span className="table-filler">
                            <Search
                                handleSearchInput={ this.handleSearchInput.bind(this) }
                                filterText={ filterText }
                            />
                            {
                                showEditMenu &&
                                <EditorMenu
                                    hasItems={ items.length > 0 }
                                    hasSelectedItems={ selectedItems.length !== 0 }
                                    canBeSaved={ canBeSaved }
                                    canBeExported={ canBeExported }
                                    canAddItems={ true }
                                    isOpen={ openEditMenu }
                                    handleAddButton={ this.handleAddButton.bind(this) }
                                    handleDuplicateButton={ this.handleDuplicateButton.bind(this) }
                                    handleDeleteButton={ this.handleDeleteButton.bind(this) }
                                    handleExportButton={ this.handleExportButton.bind(this) }
                                    handleSaveButton={ this.handleSaveButton.bind(this) }
                                    handleEditorButton={ this.handleEditableButton.bind(this) }
                                />
                            }

                        </span>
                    </div>
                }

                <div className="outer">
                    <div className="inner">
                        {
                            loading ?
                            <TableLoading
                                isLoading={ loading }
                            />
                            :
                            <table
                                className={ Common.setTableStyle(styling) }
                                style={{ tableLayout: (options.fixed ? 'fixed' : 'auto') }}
                            >
                                <TableHeader
                                    groupBy={ this.props.groupBy }
                                    showOpenEditMenu={ openEditMenu }
                                    showRowNumber={ options.showRowNumber }
                                    columns={ columns }
                                    sorting={ sorting }
                                    handleApplySorting={ this.applySort.bind(this) }
                                />

                                <TableBody
                                    groupBy={ this.props.groupBy }
                                    rows={ renderItems }
                                    columns={ columns }
                                    items={ items }
                                    selectedItems={ selectedItems }
                                    showEditMenu={ openEditMenu }
                                    showRowNumber={ options.showRowNumber }
                                    handleSelectionChange={ this.handleSelectionChange.bind(this) }
                                    handleListValueChange={ this.handleListValueChange.bind(this) }
                                />
                            </table>
                        }
                    </div>
                </div>

                <div className='text-right'>
                    <nav aria-label="Page navigation">
                        <ul className="pagination" ref={ref => this.pagination = ref}>
                            <li className="pagination-selector">
                                <span>
                                    {i18n.getMessage('Table.pagination.showAmount')}
                                    <select
                                        className="pagination-selector-options"
                                        value={this.state.pageSize}
                                        onChange={ this.changePageSize.bind(this) }
                                    >
                                        {this.setPageSizeOptions()}
                                    </select>
                                    {
                                        Editor.getSelectedAndEditedAmountText(selectedItems.length, editedAmount, this.context.i18n)
                                    }
                                </span>
                            </li>
                            {
                                items.length !== renderItems.length &&
                                <li className={this.state.showPrev ? '' : 'disabled'}>
                                    <a aria-label="Previous" onClick={ e =>
                                    {
                                        e.preventDefault();
                                        this.previous()
                                    }}
                                    >
                                        <span aria-hidden="true">&laquo;</span>
                                    </a>
                                </li>
                            }
                            {
                                items.length !== renderItems.length &&
                                (this.state.pages || [  ]).map((page, idx) => (
                                    <li className={ (currentPage + 1 === page) && 'active' } key={ idx }>
                                        <a onClick={ e =>
                                        {
                                            e.preventDefault();
                                            this.setPage(page - 1)
                                        }}>
                                            { page }
                                        </a>
                                    </li>
                                ))
                            }
                            {
                                items.length !== renderItems.length &&
                                <li className={this.state.showNext ? '' : 'disabled'}>
                                    <a aria-label="Next" onClick={ e =>
                                    {
                                        e.preventDefault();
                                        this.next()
                                    }}>
                                        <span aria-hidden="true">&raquo;</span>
                                    </a>
                                </li>
                            }
                        </ul>
                    </nav>
                </div>
            </div>
        )
    }
}
