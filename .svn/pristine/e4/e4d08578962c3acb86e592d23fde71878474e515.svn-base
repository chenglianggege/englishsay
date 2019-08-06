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
    Keyboard
} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import {LoaderScreen} from 'react-native-ui-lib';
import axios from 'axios';

export default class Phone extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {userInfo: {}, loading: false, phone: '', phone_code: '', timeLimit: 0}
    }

    async componentDidMount() {
        this.timer = 0
        let userInfo = await global.storage.load({key: 'userInfo'})
        console.log(userInfo)
        this.setState({userInfo: userInfo})
    }

    componentWillUnmount() {
        if (this.timer){
            clearInterval(this.timer)
        }
    }

    render() {
        const {loading, timeLimit} = this.state
        return (
            <View style={{height: '100%', backgroundColor: '#fff'}}>
                <Header title="更换手机号" onPress={()=>this.props.navigation.goBack()}/>
                <View style={{justifyContent:'center', alignItems: 'center'}}>
                    <View style={{marginTop: 20,width: 340, height: 45, flexDirection: 'row', borderWidth: 1, borderColor:"#e9e9e9", alignItems:'center', borderRadius: 5}}>
                        <Text style={{marginLeft: 15, fontSize: 16}}>手机号</Text>
                        <TextInput
                            onChangeText={phone => this.setState({ phone })}
                            style={{marginLeft: 15, width: 250}}
                            underlineColorAndroid="transparent"
                            placeholder="请输入你的手机号码"
                            clearButtonMode="while-editing"
                            keyboardType="numeric"
                            maxLength={11}
                            returnKeyType="next"
                        />
                    </View>
                    <View style={{marginTop: 20,width: 340, height: 45, flexDirection: 'row', borderWidth: 1, borderColor:"#e9e9e9", alignItems:'center', borderRadius: 5}}>
                        <Text style={{marginLeft: 15, fontSize: 16}}>验证码</Text>
                        <TextInput
                            onChangeText={phone_code => this.setState({ phone_code })}
                            style={{marginLeft: 15, width: 120}}
                            underlineColorAndroid="transparent"
                            placeholder="请输入短信验证码"
                            clearButtonMode="while-editing"
                            keyboardType="numeric"
                            maxLength={4}
                            returnKeyType="done"
                        />
                        <Button
                            onPress={()=> this._sendCode()}
                            buttonStyle={styles.sendCodeBtn}
                            textStyle={{fontSize: 14, color: "#30cc75"}}
                            title={timeLimit === 0 ? "获取验证码" : timeLimit + '秒后重新获取'}
                        />
                    </View>
                    <Button
                        disabled={loading}
                        loading={loading}
                        onPress={()=> this._phone()}
                        buttonStyle={styles.submitBtn}
                        textStyle={{fontSize: 17}}
                        title="确认修改"
                        icon={{name: 'check'}}
                    />
                </View>
                <Toast ref="toast" position="center"/>
                {loading ? <LoaderScreen message="Loading..." overlay/> : null}
            </View>
        )
    }
    _toBack () {
        this.props.navigation.goBack()
    }
    async _sendCode(){
        const {phone, phone_code, timeLimit, userInfo} = this.state
        if (!phone){
            Alert.alert('更换手机号', '请输入你的手机号码')
            return
        }
        if (phone === userInfo.user_phone){
            Alert.alert('更换手机号', '新手机号码不能和原号码一致')
            return
        }
        let regx = /^1\d{10}$/;
        if (!regx.test(phone)){
            Alert.alert('更换手机号', '请输入正确的11位手机号码')
            return
        }
        if (timeLimit > 0) {
            return
        }
        try {
            this.setState({loading: true})
            let ret = await axios.post(API_HOST + '/v2/account/login/send-code', {phone: phone})
            if (ret.data.retCode === 0) {
                this.refs.toast.show('短信发送成功，请注册查收！')
                this._timer()
            }else{
                this.refs.toast.show(ret.data.retMsg)
            }
        }catch (e) {
            this.refs.toast.show('网络通讯错误，请检查网络！')
        }finally {
            this.setState({loading: false})
        }

    }
    async _timer(){
        let _this = this
        let timeLimit = 60
        _this.setState({timeLimit: timeLimit})
        let timer = setInterval(function () {
            timeLimit--
            _this.setState({timeLimit: timeLimit})
            if (timeLimit === 0) {
                clearInterval(timer)
            }
        }, 1000)
        this.timer = timer
    }
    async _phone(){
        const {phone, phone_code, userInfo} = this.state
        if (!phone){
            Alert.alert('更换手机号', '请输入你的手机号码')
            return
        }
        if (phone === userInfo.user_phone){
            Alert.alert('更换手机号', '新手机号码不能和原号码一致')
            return
        }
        let regx = /^1\d{10}$/;
        if (!regx.test(phone)){
            Alert.alert('更换手机号', '请输入正确的11位手机号码')
            return
        }
        if (!phone_code){
            Alert.alert('更换手机号', '请输入你收到的短信验证码')
            return
        }
        try {
            this.setState({loading: true})
            let ret = await axios.post(API_HOST + '/v2/user/info/save-phone', {phone : phone, phone_code: phone_code})
            if (ret.data.retCode === 0){
                let userInfo = await axios.get(global.API_HOST + '/v2/student/info')
                if (userInfo.data.retCode === 0) {
                    await global.storage.save({key: 'userInfo', data: userInfo.data.retData})
                }
                Alert.alert('更换手机号', '手机号码修改成功，下次登录请使用新手机号码登录！',[
                    {text: '好', onPress: async () => this.props.navigation.goBack()},
                ], { cancelable: false })
            }else{
                Alert.alert('更换手机号', ret.data.retMsg)
            }
        }catch (e) {
            this.refs.toast.show('网络通讯错误，请检查网络！')
        }finally {
            this.setState({loading: false})
        }
    }
}

const styles = StyleSheet.create({
    submitBtn: {
        width: 340,
        height: 51,
        borderRadius: 6,
        backgroundColor: "#30cc75",
        marginTop: 45
    },
    sendCodeBtn: {
        borderWidth: 1,
        borderColor: "#30cc75",
        borderRadius: 10,
        backgroundColor: "#fff",
        height: 30,
        width: 120,
        alignSelf: 'flex-end',
        padding: 0
    }
})