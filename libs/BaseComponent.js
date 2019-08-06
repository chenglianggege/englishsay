import React, {Component} from 'react';

export default class BaseComponent extends Component {
    static screen;

    constructor(props) {
        super(props);
        BaseComponent.screen = this;
    }

    nav() {
        return this.props.navigation;
    }
}