import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Provides skeleton for displaying label and input field of ane types.
 */
export default class AttributeValueEditorRow extends Component {

	static propTypes = {
		labelText: PropTypes.string.isRequired,
		required: PropTypes.bool,
		rowErrors: PropTypes.array
	};

	static defaultProps = {
		required: false,
		rowErrors: [],
	};

	errorStyles() {
		return {
			marginBottom: '0px',
			padding: '6px',
			border: '0px'
		}
	}

	render() {
		const { required, rowErrors } = this.props;
		let labelText = this.props.labelText;

		if (required) {
			labelText += '\u00a0*';
		}

		return (
			<div
				className={classNames({
					'form-group': true,
					'has-error': !!rowErrors.length
				})}
			>
				<label className={`col-sm-4 control-label`}>
					{labelText}
				</label>

				<div className={`col-sm-8`}>
					{ this.props.children }

					{rowErrors.map((error, index) =>
						<div className="alert alert-danger" key={index} style={this.errorStyles()}>
							<span>{ error.message }</span>
						</div>
					)}
				</div>
			</div>
		);
	}
}
