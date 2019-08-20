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
import { reject } from 'any-promise';

export default class Phone extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {userInfo: {}, loading: false, phone: '', phone_code: '', timeLimit: 0}
    }

    async componentDidMount() {
        this.timer = 0
        let userInfo = await global.storage.load({key: 'userInfo'})
        console.log('userInfo',userInfo)
        this.setState({userInfo: userInfo})
    }

    componentWillUnmount() {
        if (this.timer){
            clearInterval(this.timer)
        }
    }

    render() {
        const {loading, timeLimit, userInfo} = this.state
        if (!userInfo.hasOwnProperty('user_id')){
            return null
        }
        let userphone = userInfo.user_phone.substr(0, 3) + '****' + userInfo.user_phone.substr(-4)
        return (
            <View style={{height: '100%', backgroundColor: '#fff'}}>
                <Header title="注销账号" onPress={()=>this.props.navigation.goBack()}/>
                <View style={{justifyContent:'center', alignItems: 'center'}}>
                    <View style={{marginTop: 20,width: 340, height: 45, flexDirection: 'row', borderWidth: 1, borderColor:"#e9e9e9", alignItems:'center', borderRadius: 5}}>
                        <Text style={{marginLeft: 15, fontSize: 16}}>账号：   {userphone}</Text>
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
                        title="确认注销"
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
        const userInfoPhone = userInfo.user_phone
        if (timeLimit > 0) {
            return
        }
        try {
            this.setState({loading: true})
            let ret = await axios.post(API_HOST + '/v2/account/login/send-code', {phone: userInfoPhone})
            if (ret.data.retCode === 0) {
                this.refs.toast.show('短信发送成功，请注意查收！')
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
    _fucc(){
        return new Promise((resolve,reject)=>{
            setTimeout(()=>{resolve(true)},2000)
        })
    }
    async _phone(){
        const {phone, phone_code, userInfo} = this.state
        const userInfoPhone = userInfo.user_phone
        if (!phone_code){
            Alert.alert('账号注销', '请输入你收到的短信验证码')
            return
        }
        try {
            this.setState({loading: true})
            let ret = await axios.post(API_HOST + '/v2/account/cancel', {phone : userInfoPhone, phone_code: phone_code})
            if (ret.data.retCode === 0){
                let userInfo = await axios.get(global.API_HOST + '/v2/student/info')
                if (userInfo.data.retCode === 0) {
                    this.refs.toast.show('注销成功！')
                    await this._fucc()
                    await global.storage.remove({key: 'token'})
                    await global.storage.remove({key: 'userInfo'})
                    //this.props.navigation.replace('Login')
                    this.props.navigation.navigate({routeName: 'Login'});
                }
            }else{
                Alert.alert('账号注销', ret.data.retMsg)
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