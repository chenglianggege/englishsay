import React, { Component } from 'react';
import Header from './../common/Header'
import BaseComponent from "./../../libs/BaseComponent";
import {
    StyleSheet,
    View,
    WebView
} from 'react-native';

export default class Userprivacy extends BaseComponent {
    render() {
        return (
            <View style={{height: '100%', backgroundColor: '#fff'}}>
                <Header title="隐私政策" onPress={()=>this.props.navigation.goBack()}/>
                <WebView
                    source={{uri: 'https://static.365speak.cn/privacy.html'}}
                    style={{marginTop: 10}}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    submitBtn: {
        width: 340,
        height: 51,
        borderRadius: 6,
        backgroundColor: "#30cc75",
        marginTop: 45
    }
})