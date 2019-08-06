import React, { Component } from 'react';
import Header from './common/Header'
import BaseComponent from "./../libs/BaseComponent";
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

export default class Forget extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {loading: false, role: 1, phone: '', phone_code: '', timeLimit: 0, password: '', user_name: '', re_password: ''}
    }

    componentDidMount() {
        this.timer = 0
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

                <Header title="找回密码" onPress={()=>this.props.navigation.goBack()}/>
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
                            returnKeyType="next"
                        />
                        <Button
                            onPress={()=> this._sendCode()}
                            buttonStyle={styles.sendCodeBtn}
                            textStyle={{fontSize: 14, color: "#30cc75"}}
                            title={timeLimit === 0 ? "获取验证码" : timeLimit + '秒后重新获取'}
                        />
                    </View>
                    <View style={{marginTop: 20,width: 340, height: 45, flexDirection: 'row', borderWidth: 1, borderColor:"#e9e9e9", alignItems:'center', borderRadius: 5}}>
                        <Text style={{marginLeft: 15, fontSize: 16}}>设置密码</Text>
                        <TextInput
                            onChangeText={password => this.setState({ password })}
                            style={{marginLeft: 15, width: 240}}
                            underlineColorAndroid="transparent"
                            placeholder="请输入新密码"
                            clearButtonMode="while-editing"
                            maxLength={20}
                            secureTextEntry={true}
                            returnKeyType="next"
                        />
                    </View>
                    <View style={{marginTop: 20,width: 340, height: 45, flexDirection: 'row', borderWidth: 1, borderColor:"#e9e9e9", alignItems:'center', borderRadius: 5}}>
                        <Text style={{marginLeft: 15, fontSize: 16}}>重复密码</Text>
                        <TextInput
                            onChangeText={re_password => this.setState({ re_password })}
                            style={{marginLeft: 15, width: 240}}
                            underlineColorAndroid="transparent"
                            placeholder="请再次输入新密码"
                            clearButtonMode="while-editing"
                            maxLength={20}
                            secureTextEntry={true}
                            returnKeyType="done"
                        />
                    </View>
                    <Button
                        disabled={loading}
                        loading={loading}
                        onPress={()=> this._forget()}
                        buttonStyle={styles.submitBtn}
                        textStyle={{fontSize: 17}}
                        title="找回密码"
                        icon={{name: 'check'}}
                    />
                </View>
                <Toast ref="toast" position="center"/>
                {loading ? <LoaderScreen message="Loading..." overlay/> : null}
            </View>
        )
    }
    async _sendCode(){
        const {phone, phone_code, timeLimit} = this.state
        if (!phone){
            Alert.alert('找回密码', '请输入你的手机号码')
            return
        }
        if (phone.length !== 11){
            Alert.alert('找回密码', '请输入正确的11位手机号码')
            return
        }
        let regx = /^1\d{10}$/;
        if (!regx.test(phone)){
            Alert.alert('找回密码', '请输入正确的11位手机号码')
            return
        }
        if (timeLimit > 0) {
            return
        }
        try {
            await this.setState({loading: true})
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
    async _forget(){
        const {phone, phone_code, password, re_password} = this.state
        if (!phone){
            Alert.alert('找回密码', '请输入你的手机号码')
            return
        }
        if (phone.length !== 11){
            Alert.alert('找回密码', '请输入正确的11位手机号码')
            return
        }
        let regx = /^1\d{10}$/;
        if (!regx.test(phone)){
            Alert.alert('找回密码', '请输入正确的11位手机号码')
            return
        }
        if (!phone_code){
            Alert.alert('找回密码', '请输入你收到的短信验证码')
            return
        }
        if (phone_code.length !== 4){
            Alert.alert('找回密码', '请输入正确的4位验证码')
            return
        }
        if (!password){
            Alert.alert('找回密码', '请输入设置密码')
            return
        }
        if (password.length < 6){
            Alert.alert('找回密码', '设置密码长度须大于6位字符')
            return
        }
        if (re_password !== password){
            Alert.alert('找回密码', '两次输入的密码不一致')
            return
        }

        try {
            this.setState({loading: true})
            let ret = await axios.post(API_HOST + '/v2/account/find', this.state)
            if (ret.data.retCode === 0){
                Alert.alert('找回密码', '密码修改成功，请用新设置的密码登录！',[
                    {text: '确认', onPress: () => this.props.navigation.goBack()},
                ], { cancelable: false })
            }else{
                Alert.alert('找回密码', ret.data.retMsg)
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
        alignSelf: 'flex-end',
        padding: 0,
        width: 120
    }
})