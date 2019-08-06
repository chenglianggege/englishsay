import React, { Component } from 'react';
import Header from './../common/Header'
import BaseComponent from "./../../libs/BaseComponent";
import { Button, Icon } from 'react-native-elements'
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    TouchableHighlight,
    Image,
    ScrollView,
    Alert,
    Keyboard, DeviceEventEmitter, Dimensions,Linking
} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import {LoaderScreen} from 'react-native-ui-lib';
import axios from 'axios';
const {height, width} = Dimensions.get('window');

export default class Kefu extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {agent_info: this.props.navigation.state.params}
    }

    async componentDidMount() {
        let userInfo = await global.storage.load({key: 'userInfo'})
        console.log(userInfo)
        this.setState({userInfo: userInfo})
    }

    render() {
        const {agent_info} = this.state
        if (!agent_info){
            return null
        }
        return (
            <View style={{flex: 1, backgroundColor: '#f5f5f5'}}>
                <Header title="联系客服" onPress={()=>this.props.navigation.goBack()}/>
                <View>
                    <Image source={require('./../../assets/personal/lianxikefu.png')} style={{width: width }}/>
                    <View style={{height: 90, flexDirection: 'row', alignItems:'center', width: width, backgroundColor: "#fff"}}>
                        <Text style={{color: "#353535", fontSize: 16, width: 75, marginLeft: 20}}>客服电话</Text>
                        <TouchableHighlight  underlayColor="#fff" onPress={()=>this._toCall(agent_info.kefu.phone)}>
                            <Text style={{color: "#30cc75", fontSize: 16, marginLeft: 10}}>{agent_info.kefu.phone}</Text>
                        </TouchableHighlight>
                    </View>
                    <View style={{height: 1, width: width}}/>
                    <View style={{height: 90, flexDirection: 'row', alignItems:'center', width: width, backgroundColor: "#fff"}}>
                        <Text style={{color: "#353535", fontSize: 16, width: 75, marginLeft: 20}}>客服QQ</Text>
                        <Text style={{color: "#353535", fontSize: 16, marginLeft: 10}}>{agent_info.kefu.qq}</Text>
                    </View>
                    <View style={{height: 1, width: width}}/>
                    <View style={{height: 90, flexDirection: 'row', alignItems:'center', width: width, backgroundColor: "#fff"}}>
                        <Text style={{color: "#353535", fontSize: 16, width: 75, marginLeft: 20}}>工作时间</Text>
                        <Text style={{color: "#353535", fontSize: 16, marginLeft: 10, lineHeight: 25}}>{agent_info.kefu.worktime}</Text>
                    </View>
                    <View style={{height: 10, width: width}}/>
                    <TouchableOpacity onPress={()=> this.props.navigation.push('Report')} style={{height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', width: width, backgroundColor: "#fff"}}>
                        <Text style={{color: "#353535", fontSize: 16, width: 75, marginLeft: 20}}>意见反馈</Text>
                        <Icon name='chevron-thin-right' type='entypo' size={22} color='#d5d5d5' containerStyle={{marginRight: 20}} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    async _toCall(phone_num){
        try {
            await Linking.openURL('tel:' + phone_num)
        }catch (e) {
            console.log('Linking.openURL(\'tel:\' + '+phone_num+')',e)
        }
    }
}