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
import {CheckBox} from 'react-native-elements'
import * as WeChat from 'react-native-wechat';
import Alipay from 'react-native-yunpeng-alipay'


export default class confirmOrder extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {userInfo: null,orderInfo: null, payType: 'alipay', payFaild: false, loadingText: '', showDialog: false}
    }

    async componentDidMount() {
        console.log(Dimensions.get('window'))
        try {
            let userInfo = await global.storage.load({key: 'userInfo'})
            this.setState({userInfo: userInfo})
            //此处用三元运算，前者为报社账户微信key，后者为俺们的
            parseInt(this.state.userInfo.study_card.agent_id) === 13 ? WeChat.registerApp('wx123b3d5ec98cd3fa') : WeChat.registerApp('wx4bea44456e3137e9')
        }catch (e) {

        }
    }


    render() {
        const {userInfo, loadingText} = this.state
        if (!userInfo){
            return null
        }
        return (
            <View style={{height: '100%', backgroundColor: '#fff'}}>
                <Header
                    title="订单详情"
                    onPress={()=>this.props.navigation.goBack()}
                />
                {this.state.payFaild ? <View style={{width: width, height: 43, backgroundColor: "#f5f5f5", alignItems: "center", flexDirection: 'row'}}>
                    <Image style={{width: 22, height: 22, marginLeft: 18}} source={require('./../../assets/personal/dingdantishi.png')}/>
                    <Text style={{fontSize: 13,lineHeight: 32, color: "#ff8414", marginLeft: 8}}>
                        支付未完成，请重新支付！
                    </Text>

                </View> : null}
                <ScrollView contentContainerStyle={{marginTop: 10, alignItems: "center", justifyContent: 'center'}}>
                    <View>
                        <Image style={{width: 342}} source={require('./../../assets/personal/goumaixuexika.png')}/>
                        <View style={{position:"absolute", marginTop: 22, marginLeft: 26}}>
                            <Text style={{fontSize: 14,color: "#ffffff"}}>{GRADES[+userInfo.study_card.grade]}</Text>
                            <Text style={{fontSize: 20,color: "#ffffff", marginTop: 10, fontWeight: "bold"}}>英语说学习卡</Text>
                            <Text style={{fontSize: 15,color: "#ffffff", marginTop: 20, fontWeight: "bold"}}>**** **** **** ****</Text>
                            <Text style={{fontSize: 12,color: "#ffffff", marginTop: 10}}>有效期：1年（自激活之日算起）</Text>
                        </View>
                    </View>
                    <View style={{marginTop: 20}}>
                        <Text style={styles.headerTitle}>订单信息</Text>
                        <View style={{flexDirection: 'row', width: width - 33,height:64, borderWidth: 1, borderRadius: 6,borderColor: "#6ab72b", backgroundColor: "#e6f3ea", marginTop: 10}}>
                            <View style={{flex: 1, marginTop: 10, marginLeft: 20}}>
                                <Text style={{fontSize: 16,lineHeight: 24,color: "#353535"}}>英语说学习卡</Text>
                                <Text style={{fontSize: 13,lineHeight: 24,color: "#869488"}}>{userInfo.study_card.card_name}</Text>
                            </View>
                            <View style={{flex: 1, marginTop: 15, alignItems: 'flex-end', marginRight: 20}}>
                                <Text style={{fontSize: 20,lineHeight: 24,color: "#ff8414"}}>¥{(+userInfo.study_card.card_price).toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{marginTop: 20}}>
                        <Text style={styles.headerTitle}>支付方式</Text>
                        <View style={{width: width - 33, marginTop: 10}}>
                            <View style={{flexDirection: 'row', width: width - 33, alignItems: 'center', marginTop: 20}}>
                                <TouchableOpacity onPress={()=>this.setState({payType: 'alipay'})} style={{flexDirection: 'row',alignItems: 'center', flex: 1}}>
                                    <Image style={{width: 16, height: 16}} source={require('./../../assets/personal/dingdanzhifubao.png')}/>
                                    <Text style={{fontSize: 15, fontWeight: 'normal', marginLeft: 10}}>支付宝支付</Text>
                                </TouchableOpacity>
                                <View style={{flexDirection: 'row', flex: 1, justifyContent: "flex-end"}}>
                                    <CheckBox
                                        onPress={()=>this.setState({payType: 'alipay'})}
                                        iconRight
                                        title=''
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                        containerStyle={{backgroundColor: '#fff', borderColor:"#fff", margin: 0, padding: 0}}
                                        checked={this.state.payType === 'alipay'}
                                        checkedColor="#6ab72b"
                                        uncheckedColor="#eaeaea"
                                        size={18}
                                    />
                                </View>
                            </View>

                            <View style={{flexDirection: 'row', width: width - 33, alignItems: 'center', marginTop: 20}}>
                                <TouchableOpacity onPress={()=>this.setState({payType: 'wxpay'})} style={{flexDirection: 'row',alignItems: 'center', flex: 1}}>
                                    <Image style={{width: 16, height: 16}} source={require('./../../assets/personal/dingdanweixin.png')}/>
                                    <Text style={{fontSize: 15, fontWeight: 'normal', marginLeft: 10}}>微信支付</Text>
                                </TouchableOpacity>
                                <View style={{flexDirection: 'row', flex: 1, justifyContent: "flex-end"}}>
                                    <CheckBox
                                        onPress={()=>this.setState({payType: 'wxpay'})}
                                        iconRight
                                        title=''
                                        checkedIcon='dot-circle-o'
                                        uncheckedIcon='circle-o'
                                        containerStyle={{backgroundColor: '#fff', borderColor:"#fff", margin: 0, padding: 0}}
                                        checked={this.state.payType === 'wxpay'}
                                        checkedColor="#6ab72b"
                                        uncheckedColor="#eaeaea"
                                        size={18}
                                    />
                                </View>
                            </View>

                            <View style={{flexDirection: 'row', width: width - 33, alignItems: 'center', marginTop: 20}}>
                                <Text style={{fontSize: 13,lineHeight: 20,color: "#aaaaaa"}}>*购买成功后卡密会自动与当前账号绑定，旧卡将失效无法使用。</Text>
                            </View>

                        </View>
                    </View>

                    <View style={{marginTop: 20}}>
                        <Button
                            onPress={()=> this._toPay()}
                            buttonStyle={{backgroundColor: "#30cc75", borderRadius: 6, height: 51, width: width - 33}}
                            textStyle={{fontSize: 17, lineHeight: 24, padding: 0, color: "#ffffff"}}
                            title="立即支付"
                        />
                    </View>
                </ScrollView>
                {this._renderDialog()}
                {loadingText ? <LoaderScreen message={loadingText} overlay/> : null}
                <Toast ref="toast" position="center"/>
            </View>
        )
    }
    _renderDialog(){
        const{showDialog, payType} = this.state
        return (
            <Dialog
                width={270}
                style={{justifyContent: 'center'}}
                visible={showDialog}
                overlayBackgroundColor='rgba(0,0,0,0.5)'
                animationConfig={{animation: 'fadeIn', duration: 250}}
                onDismiss={()=>{}}
            >
                <View style={{backgroundColor:"#fff", width: 270, height: 105, borderRadius: 10, alignItems: 'center'}}>
                    <View style={{justifyContent:'center', alignItems:'center', height: 60}}>
                        <Text style={{textAlign:'center', fontSize: 17, marginTop: 15}}>请在{payType === 'wxpay' ? '微信' : '支付宝'}内完成支付</Text>
                    </View>
                    <View style={{flexDirection: 'row', height: 45, width: 270}}>
                        <Button
                            buttonStyle={{ width: 135, height: 45, borderWidth: 1, borderColor: "#efefef", backgroundColor: "#fff", borderBottomStartRadius: 10}}
                            textStyle={{fontSize: 15, color: "#858585"}}
                            title="取消"
                            onPress={()=> this._paySuccess(true)}
                            containerViewStyle={{marginLeft: 0, marginRight: 0}}
                        />
                        <Button
                            buttonStyle={{ width: 135, height: 45, borderWidth: 1, borderColor: "#efefef", backgroundColor: "#fff", borderBottomEndRadius: 10}}
                            textStyle={{fontSize: 15, color: "#30cc75"}}
                            title="已完成支付"
                            onPress={()=> this._paySuccess()}
                            containerViewStyle={{marginLeft: 0, marginRight: 0}}
                        />
                    </View>
                </View>
            </Dialog>
        )
    }
    async _toPay(){
        Log('_toPay')
        const {payType} = this.state
        let pay_source = payType === 'wxpay' ? 'WX_APP' : 'ALIPAY_APP';
        try {
            let isWXAppInstalled = await WeChat.isWXAppInstalled()
            if (pay_source === 'WX_APP' && !isWXAppInstalled) {
                return this.refs.toast.show('您未安装微信，无法使用微信支付！');
            }
            this.setState({loadingText: '正在创建订单...'})
            let orderInfo = await axios.post(API_HOST + '/v2/student/order/create')
            if (orderInfo.data.retCode !== 0) {
                return this.refs.toast.show(orderInfo.data.retMsg)
            }
            orderInfo = orderInfo.data.retData

            this.setState({loadingText: '正在创建支付单...', orderInfo: orderInfo})
            let order_pay = await axios.post(API_HOST + '/v2/pay/create',{order_id: orderInfo.order_id, pay_source: pay_source})
            order_pay = order_pay.data
            console.log(order_pay)
            this.setState({loadingText: ''})
            if (order_pay.retCode !== 0){
                return this.refs.toast.show(order_pay.retMsg)
            }

            let _this = this
            this.setState({showDialog: true})
            if (pay_source === 'ALIPAY_APP') {
                Alipay.pay(order_pay.retData).then(function(data){
                    console.log('pay success', data);
                    _this._paySuccess(true)
                }).catch(function (err) {
                    console.log('pay err', err)
                    _this._paySuccess(false)
                });
            }

            if (pay_source === 'WX_APP') {
                WeChat.pay(order_pay.retData).then(function(data){
                    console.log('pay success', data);
                    _this._paySuccess(true)
                }).catch(function (err) {
                    console.log('pay err', err)
                    _this._paySuccess(false)
                });
            }

        }catch (e) {
            console.log('catch err', e)
            this.refs.toast.show('网络通讯错误，请检查网络！')
        }finally {
            this.setState({loadingText: ''})
        }
    }
    async _paySuccess(success){
        this.setState({loadingText: '正在获取支付信息...', showDialog: false})
        const {orderInfo} = this.state
        let _this = this
        setTimeout(async function () {
            try {
                let orderDetail = await axios.get(API_HOST + '/v2/student/order/info', {params:{order_id: orderInfo.order_id}})
                orderDetail = orderDetail.data
                console.log('orderDetail', orderDetail)
                if (orderDetail.retCode !== 0){
                    _this.setState({loadingText: ''})
                    _this.refs.toast.show(orderDetail.retMsg)
                    return
                }
                if (!orderDetail.retData.pay_status){
                    _this.setState({payFaild: true, loadingText: ''})
                    _this.refs.toast.show('订单支付失败，请重新支付！')
                    return;
                }
                _this.props.navigation.replace('PaySuccess', {payType: _this.state.payType, orderInfo: orderDetail.retData})
            }catch (e) {
                console.log('_paySuccess err',e)
                _this.refs.toast.show('网络通讯错误，请检查网络！')
            }finally {
                _this.setState({loadingText: ''})
            }
        }, 2000)
    }
}
const styles = StyleSheet.create({
    headerTitle:{
        fontSize: 17, lineHeight: 24, color: "#353535"
    }
})


