import React, { Component } from 'react';
import BaseComponent from "../../libs/BaseComponent";
import Header from './../common/Header'
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
    Keyboard, Dimensions, DeviceEventEmitter,Modal
} from 'react-native';
import {LoaderScreen, Dialog} from 'react-native-ui-lib';
import { Button } from 'react-native-elements'
import axios from "axios/index";
const {height, width} = Dimensions.get('window');
import Toast, {DURATION} from 'react-native-easy-toast'

export default class paySuccess extends BaseComponent {
    constructor(props) {
        super(props);


        this.state = {userInfo: {}}
    }

    async componentDidMount() {
        let userInfo = await axios.get(global.API_HOST + '/v2/student/info')
        if (userInfo.data.retCode === 0) {
            await global.storage.save({key: 'userInfo', data: userInfo.data.retData})
        }
        let agent_info = await axios.get(API_HOST + '/v2/user/info/agent')
        if (agent_info.data.retCode === 0) {
            agent_info = agent_info.data.retData
            await global.storage.save({key: 'agentInfo', data: agent_info})
        }
    }

    componentWillUnmount() {
    }
    render(){
        const {payType, orderInfo} = this.props.navigation.state.params
        return (
            <View>
                <Header
                    title="支付完成"
                />
                <View style={{alignItems: "center", marginTop: 10}}>
                    <View>
                        <Image style={{width: width - 33}} source={require('./../../assets/personal/zhifuchenggong.png')}/>
                        <View style={{position:"absolute", marginTop: 20, marginLeft: 26}}>
                            <Text style={{fontSize: 14,color: "#ffffff"}}>{GRADES[orderInfo.card_info.grade]}</Text>
                            <Text style={{fontSize: 20,color: "#ffffff", marginTop: 10, fontWeight: "bold"}}>英语说学习卡</Text>
                            <Text style={{fontSize: 15,color: "#ffffff", marginTop: 10, fontWeight: "bold"}}>{orderInfo.card_info.card_key}</Text>
                            <Text style={{fontSize: 12,color: "#ffffff", marginTop: 10}}>有效期：{orderInfo.card_info.expire_day}天（自激活之日算起）</Text>
                            <View style={{marginTop: 25, flexDirection: 'row', alignItems: 'center', width: width - 33 - 26 - 20}}>
                                <Text style={{fontSize: 17,color: "#555555", flex: 1}}>支付方式</Text>
                                <View style={{flexDirection: 'row', justifyContent: "flex-end", alignItems: 'center', flex: 1}}>
                                    <Image style={{width: 19, height: 19}} source={payType === 'wxpay' ? require('./../../assets/personal/dingdanweixin.png') : require('./../../assets/personal/dingdanzhifubao.png')}/>
                                    <Text style={{fontSize: 17,color: "#555555", marginLeft: 10}}>{payType === 'wxpay' ? '微信支付': '支付宝支付'}</Text>
                                </View>
                            </View>
                            <View style={{marginTop: 15, flexDirection: 'row', alignItems: 'center', width: width - 33 - 26 - 20}}>
                                <Text style={{fontSize: 17,color: "#555555", flex: 1}}>订单金额</Text>
                                <View style={{alignItems: "flex-end", justifyContent: 'center', flex: 1}}>
                                    <Text style={{fontSize: 17,color: "#555555"}}>¥{orderInfo.order_price}</Text>
                                </View>
                            </View>
                            <View style={{marginTop: 50, justifyContent: 'center', alignItems: 'center', width: width - 33 - 26 - 20}}>
                                <Text style={{fontSize: 17,color: "#555555"}}>支付金额</Text>
                                <Text style={{fontSize: 30,color: "#555555", marginTop: 20}}>¥{orderInfo.order_price}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{marginTop: 30}}>
                        <Button
                            onPress={()=> this._toBack()}
                            buttonStyle={{backgroundColor: "#30cc75", borderRadius: 6, height: 51, width: width - 33}}
                            textStyle={{fontSize: 17, lineHeight: 24, padding: 0, color: "#ffffff"}}
                            title="完成"
                        />
                    </View>

                </View>


            </View>
        )
    }
    async _toBack(){
        try {
            let userInfo = await axios.get(global.API_HOST + '/v2/student/info')
            if (userInfo.data.retCode === 0) {
                await global.storage.save({key: 'userInfo', data: userInfo.data.retData})
            }
            let agent_info = await axios.get(API_HOST + '/v2/user/info/agent')
            if (agent_info.data.retCode === 0) {
                agent_info = agent_info.data.retData
                await global.storage.save({key: 'agentInfo', data: agent_info})
            }
            userInfo = userInfo.data.retData
            let card_setting = JSON.parse(userInfo.study_card.card_setting)
            if (card_setting.hasOwnProperty('module_type') && +card_setting.module_type === 1) {
                return this.props.navigation.replace('Main')
            }
            if (card_setting.hasOwnProperty('module_type') && +card_setting.module_type === 2) {
                return this.props.navigation.replace('Main2')
            }
        }catch (e) {

        }
    }
}