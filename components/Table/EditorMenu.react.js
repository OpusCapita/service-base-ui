import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from './../ContextComponent.react';
import translations from './i18n';

import Editor from './helpers/Editor';

import './Table.css';

export class EditorMenu extends ContextComponent
{
    static propTypes =
    {
        items: PropTypes.array.isRequired,
        selectedItems: PropTypes.array.isRequired,
        canBeSaved: PropTypes.bool,
        isShown: PropTypes.bool
    };

    static defaultProps =
    {
        items: [  ],
        selectedItems: [  ],
        canBeSaved: false,
        isShown: false
    };

    constructor(props, context)
    {
        super(props);

        context.i18n.register('Table', translations);
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
    handleEditorButton = () => this.props.handleEditorButton();

    render()
    {
        const { i18n } = this.context;
        const {
            hasItems,
            hasSelectedItems,
            canAddItems,
            canBeSaved,
            isOpen
        } = this.props;

        return (
            <span>
                {
                    isOpen &&
                    <span>
                        {
                            canAddItems &&
                            Editor.EditorButton(
                                i18n.getMessage('Table.menu.add'),
                                'plus',
                                'default',
                                this.handleAddButton
                            )
                        }

                        {
                            hasItems && hasSelectedItems &&
                            Editor.EditorButton(
                                i18n.getMessage('Table.menu.duplicate'),
                                'duplicate',
                                'default',
                                this.handleDuplicateButton
                            )
                        }

                        {
                            hasSelectedItems &&
                            Editor.EditorButton(
                                i18n.getMessage('Table.menu.delete'),
                                'remove',
                                'default',
                                this.handleDeleteButton
                            )
                        }

                        {
                            hasItems &&
                            Editor.EditorButton(
                                (
                                    hasSelectedItems ?
                                    i18n.getMessage('Table.menu.exportSelected')
                                    :
                                    i18n.getMessage('Table.menu.export')
                                ),
                                'cloud-download',
                                'default',
                                this.handleExportButton
                            )
                        }

                        {
                            Editor.EditorButton(
                                i18n.getMessage('Table.menu.save'),
                                'cloud-upload',
                                canBeSaved ? 'success' : 'default disabled',
                                canBeSaved && this.handleSaveButton
                            )
                        }
                    </span>
                }
                {
                    Editor.EditorButton(
                        '',
                        'pencil',
                        isOpen ? 'info' : 'default',
                        this.handleEditorButton
                    )
                }
            </span>
        );
    };
}
