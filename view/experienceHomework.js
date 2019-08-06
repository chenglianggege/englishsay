import React, { Component } from 'react';
import {
    View,
    FlatList,
    Image,
    StyleSheet,
    Text,
    DeviceEventEmitter,
    Dimensions, Alert, ScrollView
} from 'react-native'
import axios from 'axios';
import Header from './common/Header'
import { Button, Avatar ,List, ListItem} from 'react-native-elements'
import Toast, {DURATION} from 'react-native-easy-toast'
import {LoaderScreen} from 'react-native-ui-lib'
import BaseComponent from './../libs/BaseComponent'
var Progress = require('react-native-progress');
const {height, width} = Dimensions.get('window');
import RNFS from "react-native-fs";
import Download from './common/Download'
import NoNet from "./common/NoNet";
import PaperListItem from './common/PaperListItem'
import { blue } from 'ansi-colors';

export default class Word extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            listData: [],
            total: 0,
            loading:true,
            page: 1,
            refreshing: true,
            loadOnEndReached: true,
            netError: false
        }
    }

    async componentDidMount() {
        
    }
    componentWillUnmount() {
        
    }
    
    render () {
        // console.log('render:this.state.refreshing', this.state.refreshing)
        const {loading, netError} =  this.state
        return (
            <View style={{flex: 1, backgroundColor: "#fff"}}>
                <Header title="课后作业" onPress={()=>this.props.navigation.goBack()}/>
                <View>
                    <Image style={{width: width}} source={require('./../assets/experience/zuoyeshili.png')}/>
                </View>
                <View style={{width: width, position: "absolute", top: 91, flexDirection: 'column' ,alignItems: 'center'}}>
                    <Text style={{fontSize: 17, lineHeight: 27, color: "#ffffff"}}>使用《英语说》完成老师布置的作业</Text>
                    <Text style={{fontSize: 17, lineHeight: 27, color: "#ffffff"}}>并查看得分详情及综合统计</Text>
                </View>   
                

            </View>
        );
    }
}

const styles = StyleSheet.create({
    item: {
        marginTop:11,
        marginBottom: 11,
        marginLeft:0,
        flexDirection: 'row'
    },
    itemImg: {
        borderRadius: 11,
        width: 138,
        height: 150,
    },
    itemName: {
        flex:1,
        marginLeft: 0,
        marginTop: 22,
        fontSize: 16,
        color: "#555555"
    },
    menuIcon: {
        height: 22,
        width: 22,
        marginLeft: 5,
        marginRight: 15
    },
    itemRt: {
        flexDirection: 'column',
        height: 150,
        width: width - 170,
    }
})