import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from '../../ContextComponent.react';
import translations from '../i18n';

import Editor from '../utils/Editor';

import '../Table.css';

export class TableTopMenu extends ContextComponent
{
    static propTypes =
    {
        showEditMenu: PropTypes.bool,
    };

    static defaultProps =
    {
        showEditMenu: true,
    };

    constructor(props, context)
    {
        super(props);

        this.state = {
            menuWidth: 0,
            menuWidthAddition: 1,
            menuOpen: false,
        };

        context.i18n.register('Table', translations);
    }

    componentDidMount()
    {
        this.checkEditorMenuWidth();
    }

    componentWillReceiveProps(nextProps)
    {
        this.setState({
            showEditMenu: nextProps.showEditMenu,
            canAddItems: nextProps.canAddItems,
            canBeSaved: nextProps.canBeSaved,
            canBeExported: nextProps.canBeExported,
            hasItems: nextProps.hasItems,
            hasSelectedItems: nextProps.hasSelectedItems
        }, () =>
        {
            this.checkEditorMenuWidth();
        });
    }

    checkEditorMenuWidth = () =>
    {
        const menuWidth = this.divElement.offsetWidth + 1;
        this.setState({ menuWidth });
    };

    /**
     * Passes the add buttons state to parent.
     *
     * @function handleAddButton
     */
    handleAddButton = () => this.props.handleAddButton();

    /**
     * Passes the duplicate buttons state to parent.
     *
     * @function handleDuplicateButton
     */
    handleDuplicateButton = () => this.props.handleDuplicateButton();

    /**
     * Passes the delete buttons state to parent.
     *
     * @function handleDeleteButton
     */
    handleDeleteButton = () => this.props.handleDeleteButton();

    /**
     * Passes the export buttons state to parent.
     *
     * @function handleExportButton
     */
    handleExportButton = () => this.props.handleExportButton();

    /**
     * Passes the save buttons state to parent.
     *
     * @function handleSaveButton
     */
    handleSaveButton = () => this.props.handleSaveButton();

    /**
     * Passes the editor buttons state to parent.
     *
     * @function handleEditorButton
     */
    handleEditorButton = () =>
    {
        this.setState({menuOpen: !this.state.menuOpen}, () =>
        {
            this.checkEditorMenuWidth();
        });

        this.props.handleEditorButton();
    };

    /**
     * Passes the seach input to parent.
     *
     * @function handleSearchInput
     */
    handleSearchInput = () => this.props.handleSearchInput();

    /**
     * Passes the filtered search input to parent.
     *
     * @function handleSearchInput
     */
    handleSearchInput = (filter) => this.props.handleSearchInput(filter);

    render()
    {
        const { i18n } = this.context;
        const {
            showEditMenu,
            canAddItems,
            canBeSaved,
            canBeExported,
            hasItems,
            hasSelectedItems,
            filterText
        } = this.props;
        const { menuWidth, menuOpen } = this.state;

        return(
            <div
                className="table-top-menu"
            >
                <div
                    className="table-top-menu-search"
                    style={{
                        width: `${showEditMenu ? `calc(100% - ${ menuWidth }px)` : `100%` }`
                    }}
                >
                    <input
                        className="table-top-menu-search-input"
                        type="text"
                        placeholder={ i18n.getMessage('Table.search.placeholder') }
                        value={ filterText }
                        onChange={ this.handleSearchInput.bind(this) }
                    />
                    <span className="glyphicon glyphicon-search" aria-hidden="true"/>
                </div>
                <div
                    className="table-top-menu-editor"
                    ref={ (divElement) => this.divElement = divElement}
                >
                    {
                        menuOpen &&
                        <span>
                            {
                                canAddItems &&
                                Editor.editorButton(
                                    i18n.getMessage('Table.menu.add'),
                                    'plus',
                                    'default',
                                    this.handleAddButton
                                )
                            }

                            {
                                hasItems && hasSelectedItems &&
                                Editor.editorButton(
                                    i18n.getMessage('Table.menu.duplicate'),
                                    'duplicate',
                                    'default',
                                    this.handleDuplicateButton
                                )
                            }

                            {
                                hasSelectedItems &&
                                Editor.editorButton(
                                    i18n.getMessage('Table.menu.delete'),
                                    'remove',
                                    'default',
                                    this.handleDeleteButton
                                )
                            }

                            {
                                hasItems &&
                                Editor.editorButton(
                                    (
                                        hasSelectedItems ?
                                            i18n.getMessage('Table.menu.exportSelected')
                                            :
                                            i18n.getMessage('Table.menu.export')
                                    ),
                                    'cloud-download',
                                    canBeExported ? 'default' : 'default disabled',
                                    canBeExported && this.handleExportButton
                                )
                            }

                            {
                                Editor.editorButton(
                                    i18n.getMessage('Table.menu.save'),
                                    'cloud-upload',
                                    canBeSaved ? 'success' : 'default disabled',
                                    canBeSaved && this.handleSaveButton
                                )
                            }
                        </span>
                    }
                    {
                        showEditMenu &&
                        Editor.editorButton(
                            '',
                            'pencil',
                            menuOpen ? 'info' : 'default',
                            this.handleEditorButton
                        )
                    }
                </div>
            </div>
        )
    }
}
