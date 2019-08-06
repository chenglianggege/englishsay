import React, { Component } from 'react';
import Header from './common/Header'
import BaseComponent from "./../libs/BaseComponent";
import { Button } from 'react-native-elements'
import _ from 'lodash'
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
import {LoaderScreen, Picker} from 'react-native-ui-lib';
import axios from 'axios';

export default class Reg extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {loading: false, role: 1, phone: '', phone_code: '', timeLimit: 0, password: '', user_name: '', re_password: '', agent_code: 0, appStoreReview: false, grade: '7'}
    }

    async componentDidMount() {
        this.timer = 0
        if (Platform.OS === 'ios' && await global.storage.load({key: 'appStoreReview'})){
            this.setState({agent_code: 'TC036', appStoreReview: true})
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    render() {
        const {loading, timeLimit, appStoreReview} = this.state
        const grades = [
            {label: '七年级', value: '7'},
            {label: '八年级', value: '8'},
            {label: '九年级', value: '9'},
        ];
        const areas = [
            {label: '北京市', value: '1'},
            {label: '上海市', value: '2'},
            {label: '江苏省', value: '3'},
            {label: '重庆市', value: '4'},
        ];

        return (
            <View style={{height: '100%', backgroundColor: '#fff'}}>
                <Header title="注册账号" onPress={()=>this.props.navigation.goBack()}/>
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
                            placeholder="请输入密码"
                            secureTextEntry={true}
                            clearButtonMode="while-editing"
                            maxLength={20}
                            returnKeyType="next"
                        />
                    </View>
                    <View style={{marginTop: 20,width: 340, height: 45, flexDirection: 'row', borderWidth: 1, borderColor:"#e9e9e9", alignItems:'center', borderRadius: 5}}>
                        <Text style={{marginLeft: 15, fontSize: 16}}>重复密码</Text>
                        <TextInput
                            onChangeText={re_password => this.setState({ re_password })}
                            style={{marginLeft: 15, width: 240}}
                            underlineColorAndroid="transparent"
                            placeholder="请再次输入密码"
                            secureTextEntry={true}
                            clearButtonMode="while-editing"
                            maxLength={20}
                            returnKeyType="next"
                        />
                    </View>
                    <View style={{marginTop: 20,width: 340, height: 45, flexDirection: 'row', borderWidth: 1, borderColor:"#e9e9e9", alignItems:'center', borderRadius: 5}}>
                        <Text style={{marginLeft: 15, fontSize: 16}}>学生姓名</Text>
                        <TextInput
                            onChangeText={user_name => this.setState({ user_name })}
                            style={{marginLeft: 15, width: 240}}
                            underlineColorAndroid="transparent"
                            placeholder="请输入学生姓名"
                            clearButtonMode="while-editing"
                            returnKeyType="done"
                        />
                    </View>
                    {appStoreReview ?
                        <View style={{marginTop: 20,width: 340, height: 45, flexDirection: 'row', borderWidth: 1, borderColor:"#e9e9e9", alignItems:'center', borderRadius: 5}}>
                            <Text style={{marginLeft: 15, fontSize: 16}}>学生年级</Text>
                            <Picker
                                placeholder="请选择年级"
                                useNativePicker
                                value={this.state.grade}
                                enableModalBlur={false}
                                onChange={item => this.setState({grade: item})}
                                topBarProps={{title: '年级'}}
                                hideUnderline
                                containerStyle={{marginLeft: 15, width: 240}}
                            >
                                {_.map(grades, option => <Picker.Item key={option.value} value={option.value} label={option.label} disabled={option.disabled} />)}
                            </Picker>
                        </View> : null
                    }
                    {appStoreReview ?
                        <View style={{marginTop: 20,width: 340, height: 45, flexDirection: 'row', borderWidth: 1, borderColor:"#e9e9e9", alignItems:'center', borderRadius: 5}}>
                            <Text style={{marginLeft: 15, fontSize: 16}}>学生地区</Text>
                            <Picker
                                placeholder="请选择地区"
                                useNativePicker
                                value={this.state.area}
                                enableModalBlur={false}
                                onChange={item => this.setState({area: item})}
                                topBarProps={{title: '地区'}}
                                hideUnderline
                                containerStyle={{marginLeft: 15, width: 240}}
                            >
                                {_.map(areas, option => <Picker.Item key={option.value} value={option.value} label={option.label} disabled={option.disabled} />)}
                            </Picker>
                        </View> : null
                    }
                    <Button
                        disabled={loading}
                        loading={loading}
                        onPress={()=> this._reg()}
                        buttonStyle={styles.submitBtn}
                        textStyle={{fontSize: 17}}
                        title="注册账号"
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
        const {phone, phone_code, timeLimit} = this.state
        if (!phone){
            Alert.alert('注册账号', '请输入你的手机号码')
            return
        }
        if (phone.length !== 11){
            Alert.alert('注册账号', '请输入正确的11位手机号码')
            return
        }
        let regx = /^1\d{10}$/;
        if (!regx.test(phone)){
            Alert.alert('注册账号', '请输入正确的11位手机号码')
            return
        }
        if (timeLimit > 0) {
            return
        }
        try {
            await this.setState({loading: true})
            let ret = await axios.post(API_HOST + '/v2/account/reg/check', {phone: phone, role: 1})
            if (ret.data.retCode !== 0) {
                this.refs.toast.show(ret.data.retMsg)
                return;
            }
            if (ret.data.retData.check) {
                Alert.alert('注册账号', '该手机号已经注册，您可以直接使用此号码登录',[
                    {text: '去登录', onPress: () => this.props.navigation.navigate('Login')},
                    {text: '忘记密码', onPress: () => this.props.navigation.replace('Forget')},
                ], { cancelable: false })
                return
            }
            ret = await axios.post(API_HOST + '/v2/account/login/send-code', {phone: phone})
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
    async _reg(){
        const {phone, phone_code, password, user_name, re_password, appStoreReview} = this.state
        if (!phone){
            Alert.alert('注册账号', '请输入你的手机号码')
            return
        }
        if (phone.length !== 11){
            Alert.alert('注册账号', '请输入正确的11位手机号码')
            return
        }
        let regx = /^1\d{10}$/;
        if (!regx.test(phone)){
            Alert.alert('注册账号', '请输入正确的11位手机号码')
            return
        }
        if (!phone_code){
            Alert.alert('注册账号', '请输入你收到的短信验证码')
            return
        }
        if (phone_code.length !== 4){
            Alert.alert('注册账号', '请输入正确的4位验证码')
            return
        }
        if (!password){
            Alert.alert('注册账号', '请输入设置密码')
            return
        }
        if (password.length < 6){
            Alert.alert('注册账号', '设置密码长度须大于6位字符')
            return
        }
        if (password !== re_password){
            Alert.alert('注册账号', '两次输入的密码不一致')
            return
        }
        if (!user_name){
            Alert.alert('注册账号', '请输入学生姓名')
            return
        }
        if (user_name.length > 12){
            Alert.alert('注册账号', '姓名的长度不能超过12个字符')
            return
        }
        try {
            this.setState({loading: true})
            let ret = await axios.post(API_HOST + '/v2/account/reg', this.state)
            if (ret.data.retCode === 0){
                await global.storage.save({key: 'token', data: ret.data.retData.token})
                let userInfo = await axios.get(global.API_HOST + '/v2/student/info')
                if (userInfo.data.retCode === 0) {
                    this.setState({loading: false})
                    await global.storage.save({key: 'userInfo', data: userInfo.data.retData})
                    if (appStoreReview){
                        Alert.alert('注册账号', '账号注册成功',[
                            {text: '确认', onPress: () => this.props.navigation.goBack()},
                        ], { cancelable: false })
                        return
                    }
                    Alert.alert('注册账号', '账号注册成功',[
                        {text: '确认', onPress: () => this.props.navigation.push('AddStudyCard')},
                    ], { cancelable: false })
                }else {
                    this.props.navigation.replace('Login')
                }

            }else{
                Alert.alert('注册账号', ret.data.retMsg)
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