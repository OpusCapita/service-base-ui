import React from 'react';
import PropTypes from 'prop-types';
import ContextComponent from '../../ContextComponent.react';

import '../Table.css';

export class TableLoading extends ContextComponent
{
    static propTypes = {
        isLoading: PropTypes.bool,
    };

    static defaultProps = {
        isLoading: false,
    };

    constructor(props, context)
    {
        super(props);
    };

    render()
    {
        const { isLoading } = this.props;
        return(
            <div className="loadingScreen">
                {
                    isLoading && <span className="loader fa fa-spinner fa-lg fa-spin"/>
                }
            </div>
        )
    }
}
