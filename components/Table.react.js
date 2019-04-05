import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from './ContextComponent.react';

class Table extends ContextComponent {

    static propTypes = {
        items: PropTypes.array.isRequired,
        columns: PropTypes.array.isRequired,
        pageSize: PropTypes.number,
        fixed: PropTypes.bool,
        defaultSort: PropTypes.object,
        groupBy: PropTypes.func,
        groupOrderBy: PropTypes.string,
    };

    static defaultProps = {
        groupOrderBy: 'id',
        pageSize: 10,
        fixed: true,
    };

    constructor(props) {
        super(props);

        this.state = {
            columns: props.columns,
            items: props.items,
            renderItems: [],
            startIndex: 0,
            numPages: 0,
            sorting: {},
        };
    }

    componentDidMount() {
        const {defaultSort} = this.props;
        this.groupItems();
        if (defaultSort) {
            this.applySort(defaultSort.key, defaultSort.order)
        }
        this.filterItems();
        this.calcPageNumbers();
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

    calcPageNumbers() {
        const {items, pageSize} = this.props;
        const {startIndex} = this.state;

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
        const {items, pageSize} = this.props;
        const {startIndex} = this.state;

        const renderItems = items.slice(startIndex, startIndex + pageSize);
        const lastOffset = this.pagination.offsetTop;
        this.setState({renderItems}, () => {
            const diff = this.pagination.offsetTop - lastOffset;
            window.scrollBy(0, diff);
        });
    }

    next() {
        const {pageSize, items} = this.props;
        const {startIndex} = this.state;
        const newIndex = startIndex + pageSize;
        if (newIndex < items.length) {
            this.setState({startIndex: newIndex}, () => {
                this.filterItems();
                this.calcPageNumbers();
            });
        }
    }

    previous() {
        const {pageSize, items} = this.props;
        const {startIndex} = this.state;
        const newIndex = startIndex - pageSize;
        if (newIndex >= 0) {
            this.setState({startIndex: newIndex}, () => {
                this.filterItems();
                this.calcPageNumbers();
            });
        }
    }

    setPage(pageNum) {
        const {pageSize} = this.props;
        if (Number.isInteger(pageNum)) {
            this.setState({startIndex: pageNum * pageSize}, () => {
                this.filterItems();
                this.calcPageNumbers();
            });
        }
    }

    render() {
        const {columns, renderItems, currentPage, sorting} = this.state;
        const {fixed} = this.props;

        return (
            <div>
                <table
                    className="table table-striped table-hover table-condensed"
                    style={{tableLayout: fixed ? 'fixed' : 'auto'}}
                >
                    <thead className="thead-inverse">
                    <tr>
                        {this.props.groupBy && <th style={{width: '3.5rem'}} />}
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
                            (<tr key={index}>
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
                                    columns.map((col) => (
                                        <td key={col.key} className={col.className} style={{
                                            overflow: (fixed && !col.showOverflow) ? 'hidden' : 'visible',
                                            textOverflow: !col.disableEllipsis && 'ellipsis',
                                        }}>
                                            <span
                                                style={{'white-space': 'nowrap'}}
                                                data-placement='auto'
                                                data-toggle={'tooltip'}
                                                data-html="true"
                                                title={
                                                    typeof (col.value ? col.value(item) : item[col.key]) === 'string' &&
                                                    col.value ? col.value(item) : item[col.key]
                                                }
                                            >
                                                {col.value ? col.value(item) : item[col.key]}
                                            </span>
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
                                                style={{'white-space': 'nowrap'}}
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
                            <li>
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
                            <li>
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
