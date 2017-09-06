import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Draws basic alert message.
 */
export default class Alert extends Component {
	static propTypes = {
		bsStyle: PropTypes.oneOf(['info', 'danger']).isRequired,
		message: PropTypes.string.isRequired,
		visible: PropTypes.bool,
		hideCloseLink: PropTypes.bool,
	};

	static defaultProps = {
		visible: true,
	};

	state = {
		visible: this.props.visible,
	};

	componentWillReceiveProps(nextProps) {
		this.setState({
			visible: nextProps.visible,
		});
	}

	handleAlertDismiss = () => this.setState({ visible: false });

	render() {
		let _this = this;

		if (_this.state.visible) {
			return (
				<div className={classNames(['bs-callout', `bs-callout-${_this.props.bsStyle}`])}>
					{_this.props.hideCloseLink && <button type="button" className="close" onClick={_this.handleAlertDismiss}>
						<span aria-hidden="true">&times;</span>
						<span className="sr-only">Close</span>
					</button>}
					<span>{_this.props.message}</span>
				</div>
			);
		}

		return (
			<div />
		);
	}
}
