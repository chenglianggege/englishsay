import React, { Component } from 'react';
import Header from './../common/Header'
import BaseComponent from "./../../libs/BaseComponent";
import { Button } from 'react-native-elements'
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
    Keyboard, DeviceEventEmitter
} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import {LoaderScreen} from 'react-native-ui-lib';
import axios from 'axios';

export default class JoinClass extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {loading: false, userInfo: {}, phone: '', classList: []}
    }
    async componentDidMount() {
        let userInfo = await global.storage.load({key: 'userInfo'})
        this.setState({userInfo: userInfo})
    }
    render() {
        const {userInfo, loading, phone, classList} = this.state
        return (
            <View style={{height: '100%', backgroundColor: '#fff'}}>
                <Header title="加入班级" onPress={()=>this.props.navigation.goBack()}/>
                <View style={{flexDirection:'row', marginLeft: 10, height: 60, alignItems: 'center'}}>
                    <Text style={{fontSize: 14, flex: 1}}>老师号码</Text>
                    <TextInput
                        style={{flex: 2, borderBottomWidth: 1, borderBottomColor:"#ebeaea", paddingLeft: 5, padding: 0, height: 25}}
                        underlineColorAndroid="transparent"
                        onChangeText={phone => this.setState({ phone: phone })}
                        placeholder="请输入老师手机号码"
                        placeholderTextColor="#b4c0b5"
                        value={phone}
                        clearButtonMode="while-editing"
                        keyboardType="numeric"
                        maxLength={11}
                        returnKeyType="done"
                    />
                    <Button
                        onPress={()=>this._toSearch()}
                        style={{}}
                        title="搜索班级"
                        buttonStyle={{width: 80, height: 26, backgroundColor: "#fff", borderWidth:1, borderColor: phone ? "#30cc75" : "#bdbbbb", padding: 0}}
                        textStyle={{fontSize: 14, color: phone ? "#30cc75" : "#bdbbbb"}}
                    />
                </View>
                <View style={{height: 15, backgroundColor:"#f8f8f8"}}/>
                <View style={{marginLeft: 10, height: 30, justifyContent: 'center'}}>
                    <Text style={{fontSize: 13, color:  "#bdbbbb"}}>老师建立的班级</Text>
                </View>
                <View style={{height: 1, backgroundColor:"#f4f1f1"}}/>
                {userInfo.class_info && classList.length === 0 ? this._renderItem(userInfo.class_info) :
                    <ScrollView>
                        {classList.map(item => this._renderItem(item))}
                    </ScrollView>
                }
                <Toast ref="toast" position="center"/>
                {loading ? <LoaderScreen message="Loading..." overlay/> : null}
            </View>
        )
    }
    _renderItem (item){
        const {userInfo} = this.state
        return (
            <View key={item.class_id}>
                <View style={{height: 70, marginLeft: 10, flexDirection: 'row', alignItems: "center"}}>
                    <Text numberOfLines={1} style={{flex: 3, color: "#585757", fontSize: 16}}>{item.class_name}</Text>
                    {userInfo.class_info && +userInfo.class_info.class_id === +item.class_id ?
                        <Text style={{fontSize: 14, flex: 1, color: "#30cc75", width: 88, height: 26}}>
                            当前班级
                        </Text>
                        :
                        <Button
                            onPress={()=>this._joinClass(item)}
                            title="加入班级"
                            containerViewStyle={{flex: 1}}
                            buttonStyle={{width: 88, height: 26, backgroundColor: "#fff", borderWidth:1, borderColor:  "#30cc75", padding: 0}}
                            textStyle={{fontSize: 14, color: "#30cc75"}}
                        />
                    }
                </View>
                <View style={{height: 1, backgroundColor:"#f4f1f1"}}/>
            </View>
        )
    }
    _toBack () {
        this.props.navigation.goBack()
    }
    async _toSearch (){
        const {phone, userInfo} = this.state

        let isBindCard = userInfo.study_card && userInfo.study_card.expire_status === 1
        if (!isBindCard){
            this.refs.toast.show('请绑定学习卡，解锁功能后使用！')
        }

        let regx = /^1\d{10}$/;
        if (!regx.test(phone)){
            Alert.alert('加入班级', '请输入正确的11位手机号码')
            return
        }
        Keyboard.dismiss()
        try {
            this.setState({loading: true, classList: []})
            let classList = await axios.get(API_HOST + '/v2/student/sclass/query',{params: {phone: phone}})
            if (classList.data.retCode === 0) {
                this.setState({classList: classList.data.retData})
                if (classList.data.retData.length === 0){
                    this.refs.toast.show('该老师没有创建班级，请确认手机号码输入正确！')
                }
            }else{
                this.refs.toast.show(classList.data.retMsg)
            }
        }catch (e) {
            this.refs.toast.show('网络通讯错误，请检查网络！')
        }finally {
            this.setState({loading: false})
        }
        
    }
    async _joinClass (item,) {
        Alert.alert('加入班级','是否确认加入'+item.class_name+'？',[
            {text: '考虑一下', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: '确认加入', onPress: async () => {
                    let ret = await axios.post(API_HOST + '/v2/student/sclass/join',{class_id: item.class_id})
                    if (ret.data.retCode === 0){
                        let userInfo = await axios.get(global.API_HOST + '/v2/student/info')
                        if (userInfo.data.retCode === 0) {
                            this.setState({userInfo: userInfo.data.retData})
                            await global.storage.save({key: 'userInfo', data: userInfo.data.retData})
                            DeviceEventEmitter.emit('FinishReload');
                        }
                    }
                }},
        ],{ cancelable: false })
    }
}