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
        items: PropTypes.array.isRequired,
        selectedItems: PropTypes.array,
        onChange: PropTypes.func.isRequired
    }

    static defaultProps = {
        items: [],
        selectedItems: [],
        onChange: () => null
    }

    constructor(props)
    {
        super(props);

        this.state =
            {
                value: '',
                items: this.props.items,
                selectableItems: [],
                selectedItems: this.props.selectedItems
            }
    };

    componentDidMount = () =>
    {
        this.setState({
            selectableItems: this.state.items.filter(originalItem => !this.state.selectedItems.find(selectedItem => originalItem.value === selectedItem.value))
        });
    }

    onSortEnd = ({ oldIndex, newIndex }) =>
    {
        this.setState(({ selectedItems }) => (
            {
                selectedItems: arrayMove(selectedItems, oldIndex, newIndex),
            }), () => this.props.onChange(this.state.selectedItems))
    };

    handleAddItemClick = (event) =>
    {
        this.setState({
            value: '',
            selectableItems: this.state.selectableItems.filter((val) => val.label != event),
            selectedItems: this.state.selectedItems.concat(this.state.selectableItems.filter((val) => val.label === event))
        }, () => this.props.onChange(this.state.selectedItems));
    }

    handleDeleteItemClick = (event) =>
    {
        this.setState({
            selectableItems: this.state.selectableItems.concat(this.state.selectedItems.filter((val) => val.label === event)),
            selectedItems: this.state.selectedItems.filter((val) => val.label != event)
        }, () => this.props.onChange(this.state.selectedItems));
    }

    render()
    {
        const { selectableItems, selectedItems, items } = this.state;

        return (
            <div className="row">
                <div className="col-md-12 Sortable">
                    <Autocomplete
                        items={ selectableItems.sort((a, b) => a.label - b.label) }
                        shouldItemRender={ (item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1 }
                        getItemValue={ item => item.label }
                        renderInput={ (props) =>
                            <input className="form-control" type="text" { ...props } />
                        }
                        renderMenu={ (items) =>
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
                            selectedItems.map((value, index) => (
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