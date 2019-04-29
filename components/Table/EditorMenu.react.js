import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from './../ContextComponent.react';
import translations from './i18n';

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

    handleAddButton       = () => this.props.handleAddButton();
    handleDuplicateButton = () => this.props.handleDuplicateButton();
    handleDeleteButton    = () => this.props.handleDeleteButton();
    handleExportButton    = () => this.props.handleExportButton();
    handleSaveButton      = () => this.props.handleSaveButton();
    handleEditorButton    = () => this.props.handleEditorButton();

    render()
    {
        const { i18n } = this.context;
        const { items, selectedItems, canBeSaved, isShown, isOpen } = this.props;

        return (
            <span>
                {
                    isOpen &&
                    <span>
                        <button
                            className={ 'btn btn-default' }
                            onClick={ this.handleAddButton }
                        >
                            <span className="glyphicon glyphicon-plus" aria-hidden="true"/>&nbsp;&nbsp;{ i18n.getMessage('Table.menu.add') }
                        </button>

                        <button
                            className={`btn ${ selectedItems.length === 0 ? 'btn-default disabled' : 'btn-default' }` }
                            onClick={ selectedItems.length !== 0 && this.handleDuplicateButton }
                        >
                            <span className="glyphicon glyphicon-duplicate" aria-hidden="true"/>&nbsp;&nbsp;{ selectedItems.length === 0 ? i18n.getMessage('Table.menu.duplicate') : i18n.getMessage('Table.menu.duplicateSelected') }
                        </button>

                        <button
                            className={`btn ${ selectedItems.length === 0 ? 'btn-default disabled' : 'btn-default' }` }
                            onClick={ selectedItems.length !== 0 && this.handleDeleteButton }
                        >
                            <span className="glyphicon glyphicon-remove" aria-hidden="true"/>&nbsp;&nbsp;{ selectedItems.length === 0 ? i18n.getMessage('Table.menu.delete') : i18n.getMessage('Table.menu.deleteSelected') }
                        </button>

                        <button
                            className={`btn ${ items.length > 0 ? 'btn-default' : 'btn-default disabled' }` }
                            onClick={ items.length > 0 && this.handleExportButton }
                        >
                            <span className="glyphicon glyphicon-cloud-download" aria-hidden="true"/>&nbsp;&nbsp;{ selectedItems.length === 0 ? i18n.getMessage('Table.menu.export') : i18n.getMessage('Table.menu.exportSelected') }
                        </button>

                        <button
                            className={`btn ${ canBeSaved === false ? 'btn-default disabled' : 'btn-success' }` }
                            onClick={ canBeSaved && this.handleSaveButton }
                        >
                            <span className="glyphicon glyphicon-cloud-upload" aria-hidden="true"/>&nbsp;&nbsp;{ i18n.getMessage('Table.menu.save') }
                        </button>
                    </span>
                }
                {
                    isShown &&
                    <button
                        type="submit"
                        className={`btn ${ isOpen ? 'btn-info' : 'btn-default' }` }
                        onClick={ this.handleEditorButton }
                    >
                        <span className="glyphicon glyphicon-pencil" aria-hidden="true"/>
                    </button>
                }
            </span>
        );
    };
}
