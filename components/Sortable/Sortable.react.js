import React from 'react';
import PropTypes from 'prop-types';
import ConditionalRenderComponent from '../ConditionalRenderComponent.react';
import
{
    sortableContainer,
    sortableElement,
    sortableHandle,
} from 'react-sortable-hoc';
import arrayMove from 'array-move';
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
    static propTypes = {
        items: PropTypes.array.isRequired
    }

    static defaultProps = {
        items: []
    }

    constructor(props)
    {
        super(props);

        this.state =
            {
                value: '',
                selectableItems: this.props.items,
                selectedItems: []
            }
    };

    onSortEnd = ({ oldIndex, newIndex }) =>
    {
        this.setState(({ selectedItems }) => (
            {
                selectedItems: arrayMove(selectedItems, oldIndex, newIndex),
            }));
    };

    handleAddItemClick = (event) =>
    {
        this.setState({
            value: '',
            selectableItems: this.state.selectableItems.filter((val) => val.label != event),
            selectedItems: this.state.selectedItems.concat(this.state.selectableItems.filter((val) => val.label === event))
        });
    }

    handleDeleteItemClick = (event) =>
    {
        this.setState({
            selectableItems: this.state.selectableItems.concat(this.state.selectedItems.filter((val) => val.label === event)),
            selectedItems: this.state.selectedItems.filter((val) => val.label != event)
        });
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
                            <input className="form-control" type="text" { ...props } />
                        }
                        renderMenu={ (items, value, style) =>
                            <ul className="list-group dropdown" children={ items } />
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
                            selectedItems.reverse().map((value, index) => (
                                <SortableItem
                                    key={ `item-${ index }` }
                                    index={ index }
                                    value={
                                        <span>
                                            <span
                                                className="list-group-item-text"
                                            >
                                                { value.label }
                                            </span>
                                            <span
                                                className="list-group-item-button"
                                                onClick={ event => this.handleDeleteItemClick(value.label) }
                                            >&#10006;</span>
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