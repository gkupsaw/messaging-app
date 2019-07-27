import React, { Component } from 'react';

export default class ErrorPopup extends Component {

    render() {
        return (
            <div id='error-popup-container' style={{ top: this.props.visible ? 0 : '-10vh' }}>
                <div id='close-error' onClick={this.props.close}>&times;</div>
                <span>{this.props.errorMessage}</span>
            </div>
        );
    }
}