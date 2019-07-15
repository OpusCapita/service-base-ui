import React from 'react';
import PropTypes from 'prop-types';
import ConditionalRenderComponent from '../ConditionalRenderComponent.react';
import { sortableContainer, sortableElement, sortableHandle } from 'react-sortable-hoc';
import Autocomplete from 'react-autocomplete';

import './Sortable.less';

const DragHandle = sortableHandle(() => <span className="list-group-item-handle">::</span>);

const SortableItem = sortableElement(({ value }) => (
    <li className="list-group-item">
        <DragHandle />
        { value }
    </li>
));

const SortableContainer = sortableContainer(({ children }) =>
{
    return <ul className="list-group">{ children }</ul>;
});

class Sortable extends ConditionalRenderComponent
{
    static propTypes =
    {
        items: PropTypes.array.isRequired,
        selectedItems: PropTypes.array,
        onChange: PropTypes.func.isRequired
    }

    static defaultProps =
    {
        items: [  ],
        selectedItems: [  ],
        onChange: () => null
    }

    constructor(props)
    {
        super(props);

        this.state =
        {
            value: '',
            items: this.props.items,
            selectableItems: [  ],
            selectedItems: this.props.selectedItems
        }
    };

    arrayMove = (arr, from, to) => 
    {
        const array = [ ...arr ];

        array.splice(
            to < 0 ? array.length + to : to,
            0,
            array.splice(from, 1)[0]
        );
        return array;
    };

    componentDidMount = () =>
    {
        this.setState({
            selectableItems: this.state.items.filter(originalItem =>
                !this.state.selectedItems.find(
                    selectedItem => originalItem.value === selectedItem.value
                )
            )
        });
    }

    onSortEnd = ({ oldIndex, newIndex }) =>
    {
        this.setState(({ selectedItems }) =>({
            selectedItems: this.arrayMove(selectedItems, oldIndex, newIndex),
        }),
        () => this.props.onChange(this.state.selectedItems))
    };

    handleAddItemClick = (selectedItem) =>
    {
        this.setState({
            value: '',
            selectableItems: this.state.selectableItems
                .filter((val) => val.label !== selectedItem)
                .sort((a, b) => a.label.localeCompare(b.label)
            ),
            selectedItems: this.state.selectedItems.concat(
                this.state.selectableItems.filter((val) => val.label === selectedItem)
            )
        },
        () => this.props.onChange(this.state.selectedItems)
        );
    }

    handleDeleteItemClick = (selectedItem) =>
    {
        this.setState({
            selectableItems: this.state.selectableItems.concat(
                this.state.selectedItems
                    .filter((val) => val.label === selectedItem.label))
                    .sort((a, b) => a.label.localeCompare(b.label)
            ),
            selectedItems: this.state.selectedItems.filter((val) => val.label !== selectedItem.label)
        },
        () => this.props.onChange(this.state.selectedItems)
        );
    }

    render()
    {
        const { selectableItems, selectedItems } = this.state;

        return (
            <div className="row">
                <div className="col-md-12 Sortable">
                    <Autocomplete
                        items={ selectableItems }
                        getItemValue={ item => item.label }
                        renderInput={ (props) =>
                            <input
                                className="form-control"
                                type="text"
                                { ...props }
                            />
                        }
                        renderMenu={ (items) =>
                            <ul
                                className="list-group dropdown"
                                children={ items }
                            />
                        }
                        renderItem={ (item, highlighted) =>
                            <li
                                className={ `list-group-item ${ highlighted ? 'active' : '' }` }
                                key={ item.id }
                            >
                                { item.label }
                            </li>
                        }
                        value={ this.state.value }
                        onChange={ e => this.setState({ value: e.target.value }) }
                        onSelect={ (event => this.handleAddItemClick(event)) }
                    />

                    <SortableContainer
                        helperClass='list-group-item-active'
                        onSortEnd={ this.onSortEnd }
                        useDragHandle={ true }
                        lockAxis={ 'y' }
                        lockToContainerEdges={ true }
                    >
                        {
                            selectedItems.map((item, index) => (
                                <SortableItem
                                    key={ `item-${ index }` }
                                    index={ index }
                                    value={
                                        <span>
                                            <span
                                                className="list-group-item-text"
                                            >
                                                { item.label }
                                            </span>
                                            <span
                                                className="list-group-item-button"
                                                onClick={ () => this.handleDeleteItemClick(item) }
                                            >
                                                &#10006;
                                            </span>
                                        </span>
                                    }
                                />
                            ))
                        }
                    </SortableContainer>
                </div>
            </div>
        )
    }
}

export default Sortable;
