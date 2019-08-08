import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    Image,
    View,
    TextInput,
    TouchableOpacity,
    Platform,
    Alert,
    StatusBar, BackHandler, Dimensions, Keyboard,ScrollView
} from 'react-native';
import { Button } from 'react-native-elements'
import axios from 'axios';
import Toast, {DURATION} from 'react-native-easy-toast'
import {LoaderScreen,Dialog} from 'react-native-ui-lib';
import DeviceInfo from 'react-native-device-info';

const {height, width} = Dimensions.get('window');


export default class Login extends Component<Props> {
    static navigationOptions = ({navigation, screenProps}) => ({
        header: null
    });
    constructor(props) {
        super(props);
        this.state = {phone: '', password: '', loading:false, showTest: true}
        this.firstClick = 0;
    }
    async componentDidMount() {
        //this.refs.toast.show(width + '-' + height);
        this._stopBack = this._stopBack.bind(this);
        let params = this.props.navigation.state.params || {}
        console.log("params789",params)
        if (params.hasOwnProperty('kickass')){
            this.refs.toast.show('您的账号刚才在另一设备登录，若非本人操作，建议及时修改密码！');
        }

        this._didBlurSubscription = this.props.navigation.addListener('didBlur', async () => {
            BackHandler.removeEventListener('hardwareBackPress', this._stopBack);
        });
        this._didFocusSubscription = this.props.navigation.addListener('didFocus', async () => {
            BackHandler.addEventListener('hardwareBackPress',this._stopBack);

            try {
                //获取隐私政策开关 
                let privacyValue = await global.storage.load({key: 'privacyValue'})
                //let privacyValue = false
                console.log("隐私政策开关"+privacyValue)
                this.setState({showTest: privacyValue})
            }catch (e) {
                await global.storage.save({key: 'privacyValue', data: false})
                this.setState({showTest: false})
                console.log(e)
            }
        });
        //this.keyboardWillHideListener = Keyboard.addListener('keyboardDidHide',this.keyboardDidHide);
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow',this.keyboardDidShow);
        try {
            let phone = await global.storage.load({key: 'phone'})
            if (phone) {
                this.setState({phone: phone})
            }
            let password = await global.storage.load({key: 'password'})
            if (password) {
                this.setState({password: password})
            }
        }catch (e) {

        }

        
    }
    componentWillUnmount() {
        this._didBlurSubscription.remove();
        this._didFocusSubscription.remove();
        BackHandler.removeEventListener('hardwareBackPress', this._stopBack);
        //this.keyboardWillHideListener && this.keyboardWillHideListener.remove();
        this.keyboardDidShowListener && this.keyboardDidShowListener.remove();
    }
    _stopBack() {
        let timestamp = (new Date()).valueOf();
        if (timestamp - this.firstClick > 2000) {
            this.firstClick = timestamp;
            this.refs.toast.show('再按一次退出');
            BackHandler.exitApp()
        }
        return true
    }
    //键盘弹起后执行
    keyboardDidShow = () =>  {
        console.log('keyboardDidShow')
        if (height > 700){
            return
        }
        this._scrollView.scrollTo({x:0, y:110, animated:true});
    }

    //键盘收起后执行
    keyboardDidHide = () => {
        this._scrollView.scrollTo({x:0, y:0, animated:true});
    }

    render() {
        const {phone, password, showTest} = this.state
        let version = DeviceInfo.getVersion();
        return (
            <View  style={{backgroundColor: '#fff', height: '100%'}}>
                <StatusBar translucent={true} backgroundColor='transparent' barStyle="dark-content"/>
                <ScrollView ref={component => this._scrollView=component} scrollEnabled={false} keyboardShouldPersistTaps="always" style={{width: width, height: height}}>
                <View style={{alignItems: 'center', height: height + 130}}>
                    <View style={{alignItems: 'center'}}><Image style={[styles.logo]} source={require('./../assets/login/logo.png')} /></View>
                    <View style={{marginTop: 82 ,alignItems: 'center', flex: 1}}>
                        <View style={styles.inputSection}>
                            <Image source={require('./../assets/login/ic_account.png')} style={{width: 14, height: 17, marginLeft:14}} />
                            <TextInput
                                style={styles.inputStyle}
                                underlineColorAndroid="transparent"
                                onChangeText={phone => {
                                    this.setState({ phone })
                                    if (phone.length === 11){
                                        //Keyboard.dismiss()
                                        this.refs.inputPasswd.focus()
                                        this.keyboardDidShow()
                                    }
                                }}
                                placeholder="请输入手机号码"
                                placeholderTextColor="#b4c0b5"
                                value={phone}
                                clearButtonMode="while-editing"
                                keyboardType="numeric"
                                maxLength={11}
                                returnKeyType="next"
                            />
                        </View>
                        <View style={{height:1,backgroundColor:'#f7f7f8', borderRadius: 1, width: 345}}/>
                        <View style={styles.inputSection}>
                            <Image source={require('./../assets/login/ic_password.png')} style={{width: 14, height: 17, marginLeft:14}} />
                            <TextInput
                                style={styles.inputStyle}
                                underlineColorAndroid="transparent"
                                onChangeText={password => this.setState({ password })}
                                placeholder="请输入登录密码"
                                placeholderTextColor="#b4c0b5"
                                value={password}
                                secureTextEntry={true}
                                clearButtonMode="while-editing"
                                maxLength={20}
                                returnKeyType="done"
                                returnKeyLabel="完成"
                                ref="inputPasswd"
                            />
                        </View>
                        <View style={{height:1,backgroundColor:'#f7f7f8', borderRadius: 1, width: 345}}/>
                        <View style={{marginTop: 45}}>
                            <Button
                                disabled={this.state.loading}
                                // loading={this.state.loading}
                                onPress={()=> this._toLogin()}
                                buttonStyle={styles.loginBtn}
                                textStyle={{fontSize: 17}}
                                title="登录"
                            />
                        </View>
                        <View style={{flexDirection: 'row', width: width - 60, justifyContent: 'space-between'}}>
                            <Text onPress={() =>this._toForget()} style={[styles.regBtn]}>忘记密码?</Text>
                            <Text  onPress={() =>this._toReg()} style={[styles.regBtn]}>现在注册</Text>
                        </View>
                    </View>
                    <View style={{alignItems: 'center', marginBottom: 20 + 130}}>
                        <Text style={{fontSize: 14, color: '#bdbdbd'}}>v{version}</Text>
                    </View>
                </View>
                </ScrollView>
                <Dialog width={300} overlayBackgroundColor='rgba(0,0,0,0.5)' visible={!showTest} onDismiss={() => console.log('我自闭了')}>
                    {this._renderTestDialog()}
                </Dialog>

                {this.state.loading ? <LoaderScreen message="正在登录..."  overlay/> : null}
                <Toast ref="toast" position="center"/>
            </View>
        );
    }
    _renderTestDialog() {
        return (
            <View style={{backgroundColor:"#fff", borderWidth: 4, borderColor:"#30cc75", alignItems: 'center'}}>
                <View style={{justifyContent:'center', marginTop: 10}}>
                    <Text style={{textAlign:'center', fontSize: 18}}>英语说隐私权政策</Text>
                </View>
                <View style={{height: 1, backgroundColor: "#e9e9e9", width:"100%", marginTop: 10}} />
                <View style={{marginTop: 10, width: 270}}>
                    <Text style={{fontSize: 16, marginTop:10}}>感谢您信任并使用英语说!</Text>
                    <Text style={{fontSize: 16, marginTop:20}}>我们非常重视您的个人信息和隐私保护。为了更好的保障您的个人权益,在您使用我们的产品前,请您认真阅读<Text onPress={() => this._toYinsi()} style={{color:'#30cc75'}}>《英语说隐私权政策》</Text>的全部内容,同意并接受全部条款后开始使用我们的产品和服务。</Text>
                    <Text style={{fontSize: 16, marginTop:20}}>若选择不同意,将无法使用我们的产品和服务,并会退出应用。</Text>
                </View>
                <View style={{flexDirection: 'row', marginTop: 50}}>
                    <Button
                        buttonStyle={{ width: 120, height: 44, borderRadius: 1,borderWidth: 1, borderColor:"#30cc75", backgroundColor: "#fff"}}
                        textStyle={{fontSize: 17, color: "#30cc75"}}
                        title="不同意，退出"
                        onPress={()=> this._toQuitApp()}
                    />
                    <Button
                        buttonStyle={{ width: 120, height: 44, borderRadius: 1, borderColor:"#fff", backgroundColor: "#30cc75"}}
                        textStyle={{fontSize: 17, color: "#fff"}}
                        title="同意"
                        onPress={()=> this.agreePrivacy()}
                    />
                </View>
                <View style={{height: 10, backgroundColor: "#fff", marginTop: 10}} />
            </View>
        );
    }
    async agreePrivacy () {
        try{
            await global.storage.save({key: 'privacyValue', data: true})
        }catch(e){

        }
        this.setState({showTest: true})
    }
    _toQuitApp () {
        console.log(8885)
        this.setState({showTest: true})
        BackHandler.exitApp()
    }
    _toYinsi () {
        this.setState({showTest: true})
        this.props.navigation.push('Useragreement')
    }
    async _toLogin () {
        console.log('denglujigazi')
        console.log('_toLogin',this.state, global.API_HOST)
        Keyboard.dismiss()
        this.keyboardDidHide()

        const {phone, password} = this.state
        if (!phone) {
            Alert.alert('登录','请输入手机号码')
            return
        }
        if (phone.length !== 11) {
            Alert.alert('登录','请输入正确的11位手机号码')
            return
        }
        let regx = /^1\d{10}$/;
        if (!regx.test(phone)){
            Alert.alert('登录', '请输入正确的11位手机号码')
            return
        }
        if (!password) {
            Alert.alert('登录','请输入登录密码')
            return
        }
        let loginOk = false
        try {
            await global.storage.save({key: 'phone', data: phone})
            await global.storage.save({key: 'password', data: password})
            let device = Platform.select({ios: 'IOS', android: 'ANDRIOD'});
            this.setState({loading: true})
            let reqRet = await axios.post(global.API_HOST + '/v2/account/login',{phone: phone, password: password,role: 1,device: device})
            if (reqRet.data.retCode !== 0) {
                Alert.alert('登录',reqRet.data.retMsg)
                this.setState({loading: false})
                //Alert.alert('登录', '账号或密码输入错误！')
                return
            }
            await global.storage.save({key: 'token', data: reqRet.data.retData.token})
            let userInfo = await axios.get(global.API_HOST + '/v2/student/info',{params: {token: reqRet.data.retData.token}})
            if (userInfo.data.retCode === 0) {
                userInfo = userInfo.data.retData
                LogServer('LOGIN', userInfo)
                await global.storage.save({key: 'userInfo', data: userInfo})
                // 只要绑定过卡的用户都可以跳到首页
                if (userInfo.study_card && userInfo.study_card.hasOwnProperty('card_setting')){
                    let agent_info = await axios.get(API_HOST + '/v2/user/info/agent')
                    if (agent_info.data.retCode === 0) {
                        agent_info = agent_info.data.retData
                        await global.storage.save({key: 'agentInfo', data: agent_info})
                    }
                    let card_setting = JSON.parse(userInfo.study_card.card_setting)
                    let card_cardtype = JSON.parse(userInfo.study_card.card_type)
                    if (card_cardtype === 3) {
                        return this.props.navigation.replace('ExperienceVersion')
                    }
                    if (card_setting.hasOwnProperty('module_type') && +card_setting.module_type === 1) {
                        return this.props.navigation.replace('Main')
                    }
                    if (card_setting.hasOwnProperty('module_type') && +card_setting.module_type === 2) {
                        return this.props.navigation.replace('Main2')
                    }
                }
                this.setState({loading: false})
                this.props.navigation.push('AddStudyCard')
            }
        }catch (e) {
            console.log(e)
            if (e.message === 'Network Error'){
                this.refs.toast.show('网络通讯错误，请检查网络！');
            }else{
                LogServer('LOGIN_EXCEPTION' ,e.message)
                this.refs.toast.show('登录失败！' + e.message);
            }
            this.setState({loading: false})
        }finally {

        }
    }
    _toReg () {
        this.props.navigation.push('Reg')
    }
    _toForget () {
        this.props.navigation.push('Forget')
    }
}


const styles = StyleSheet.create({
    logo: {
        marginTop: 70,
        height: 40,
        width: 130
    },
    inputSection: {
        alignItems: 'center',
        marginLeft: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        width: 295,
        height: 51,
    },
    inputStyle: {
        width: 250,
        fontSize: 16,
        paddingLeft: 15,
        height: 40
    },
    loginBtn: {
        width: width - 20,
        height: 51,
        borderRadius: 6,
        backgroundColor: "#30cc75"
    },
    regBtn: {
        fontSize: 17,
        color: "#30cc75",
        marginTop: 35
    },
    forgetBtn: {
        fontSize: 14,
        color: "#959595",
        alignItems: 'center',
        justifyContent: 'center',
        textAlign:'center',
    }
});
