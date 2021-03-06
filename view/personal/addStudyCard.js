import React, { Component } from 'react';
import Header from './../common/Header'
import BaseComponent from "./../../libs/BaseComponent";
import { Button , Icon} from 'react-native-elements'
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
    Keyboard, Dimensions, DeviceEventEmitter
} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import {LoaderScreen} from 'react-native-ui-lib';
import axios from 'axios';
import CameraScan from './../common/CameraScan';


const {height, width} = Dimensions.get('window');
const errStr = {1002: '卡号输入错误!', 1003: '卡号输入错误!'}


export default class AddStudyCard extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {userInfo: null, loading: false, cardKey: '', onScan: false}
    }
    async componentDidMount() {
        try {
            let userInfo = await global.storage.load({key: 'userInfo'})
            await this.setState({userInfo: userInfo})
        }catch (e) {
            this.props.navigation.navigate({routeName: 'Login', params: {kickass: true}});
        }
    }


    render() {
        const {userInfo, loading, cardKey, onScan} = this.state
        if (onScan) {
            return (
                <CameraScan onBack={()=>this.setState({onScan: false})} onBarCodeRead={this.onBarCodeRead} />
            )
        }
        return (
            <View style={{height: '100%', backgroundColor: '#fff'}}>
                <Header
                    title="绑定学习卡"
                    onPress={()=>this.props.navigation.goBack()}
                />
                <View style={{justifyContent:'center', alignItems:'center'}}>
                    <Image source={require('./../../assets/personal/addstudycard.png')} style={{width: 156, height: 106, marginTop: 42}}/>
                    <Text style={{fontSize: 16, marginTop: 24, color: "#353535"}}>请输入学习卡号</Text>
                    <View style={{flexDirection: 'row', justifyContent:'center', alignItems: 'center', marginTop:30}}>
                        <TextInput
                            maxLength={19}
                            underlineColorAndroid="transparent"
                            style={styles.cardKeyInput}
                            onChangeText={this._cardKeyInput}
                            value={cardKey}
                            returnKeyType="done"
                            returnKeyLabel="完成"
                            clearButtonMode="while-editing"
                        />
                    </View>
                    <Button
                        disabled={this.state.loading}
                        loading={this.state.loading}
                        onPress={()=> this._addCard()}
                        buttonStyle={styles.submitBtn}
                        textStyle={{fontSize: 17}}
                        title="绑定"
                        icon={{name: 'check'}}
                    />

                    <View style={{marginTop: 20, width: width - 30}}>
                        {userInfo && userInfo.study_card ?<Text style={{fontSize: 13,lineHeight: 20,color: "#aaaaaa"}}>*重新绑定新卡后，旧卡将无法使用哦~</Text> : null}
                        <Text style={{fontSize: 13,lineHeight: 20,color: "#aaaaaa"}}>*学习卡是与手机号绑定的，在任何一台手机上用绑定卡的手机号登录都可以正常使用~</Text>
                    </View>
                </View>
                {loading ? <LoaderScreen message="正在绑定学习卡..." overlay/> : null}
                <Toast ref="toast" position="center"/>
            </View>
        )
    }
    _cardKeyInput = (text)=>{

        //只有输入的时候才自动添加横杠符号
        if (this.state.cardKey.length < text.length) {
            if (text.length === 4 || text.length === 9 || text.length === 14) {
                text += '-'
            }
        }

        console.log('text', text.length, text)
        text = text.toUpperCase()
        this.setState({cardKey: text})
    }

    _toBack () {
        this.props.navigation.goBack()
    }
    async _addCard(){
        const {cardKey} = this.state
        console.log('card_key.length', cardKey.length, cardKey)
        if (cardKey.length < 19) {
            Alert.alert('绑定学习卡', '请输入完整的学习卡卡号')
            return
        }
        let _this = this
        try {
            this.setState({loading: true})
            let ret = await axios.post(API_HOST + '/v2/student/study-card/bind', {card_key: cardKey.toUpperCase()})
            if (ret.data.retCode === 0) {
                let userInfo = await axios.get(global.API_HOST + '/v2/student/info')
                if (userInfo.data.retCode !== 0) {
                    return _this.props.navigation.replace('Login')
                }
                userInfo = userInfo.data.retData
                await global.storage.save({key: 'userInfo', data: userInfo})
                let agent_info = await axios.get(API_HOST + '/v2/user/info/agent')
                if (agent_info.data.retCode === 0) {
                    agent_info = agent_info.data.retData
                    await global.storage.save({key: 'agentInfo', data: agent_info})
                }
                Alert.alert('绑定学习卡', ret.data.retMsg,[
                    {text: '确定', onPress: () => {
                            DeviceEventEmitter.emit('UpdateStudyCard')

                            let card_setting = JSON.parse(userInfo.study_card.card_setting)
                            let card_cardtype = JSON.parse(userInfo.study_card.card_type)
                            if (card_cardtype === 3) {
                                return this.props.navigation.replace('ExperienceVersion')
                            }
                            if (card_setting.hasOwnProperty('module_type') && +card_setting.module_type === 1) {
                                return _this.props.navigation.replace('Main')
                            }
                            if (card_setting.hasOwnProperty('module_type') && +card_setting.module_type === 2) {
                                return _this.props.navigation.replace('Main2')
                            }
                            return _this.props.navigation.replace('Login')
                        }},
                ],{ cancelable: false })
            } else{
                Alert.alert('绑定学习卡', errStr.hasOwnProperty(ret.data.retCode) ? errStr[ret.data.retCode] : ret.data.retMsg)
            }
        }catch (e) {
            Log(e)
            this.refs.toast.show('网络通讯错误，请检查网络！')
        }finally {
            this.setState({loading: false})
        }

    }
    onBarCodeRead = (result)=>{
        console.log(result)
    }
}


const styles = StyleSheet.create({
    submitBtn: {
        width: width-30,
        height: 51,
        borderRadius: 6,
        backgroundColor: "#30cc75",
    },
    textView:{
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
    },
    cardKeyInput:{
        fontSize:16,
        height: 25,
        width: width - 50, borderBottomWidth: 1, borderBottomColor:"#ebeaea", padding: 0,textAlignVertical: 'center', textAlign: 'center',
        marginBottom: 45
    }
})