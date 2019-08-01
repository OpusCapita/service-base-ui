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
        onChange: () => null
    }

    constructor(props)
    {
        super(props);

        this.state =
        {
            value: '',
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
            selectableItems: this.props.items.filter(originalItem =>
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
            () => this.props.onChange(this.state.selectedItems, this.state.selectableItems)
        )
    };

    handleAddItemClick = (selectedItem) =>
    {
        const selectableItems = this.state.selectableItems.filter((item) => item.value !== selectedItem.value);

        const selectedItems = this.state.selectedItems;
        selectedItems.push(selectedItem);

        this.setState({
            value: '',
            selectableItems,
            selectedItems
        },
        () => this.props.onChange(this.state.selectedItems, this.state.selectableItems)
        );
    }

    handleDeleteItemClick = (selectedItem) =>
    {
        const selectedItems = this.state.selectedItems.filter((item) => item.value !== selectedItem.value)

        const selectableItems = this.props.items.filter((item) =>
        {
            return selectedItems.findIndex(selectedItem => selectedItem.value === item.value) < 0
        });

        this.setState({
            selectedItems,
            selectableItems
        },
        () => this.props.onChange(this.state.selectedItems, this.state.selectableItems)
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
                        shouldItemRender={ (item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1 }
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
                        onSelect={ (val, item) => this.handleAddItemClick(item) }
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
