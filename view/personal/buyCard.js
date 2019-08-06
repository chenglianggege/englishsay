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

export default class buyCard extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {loading: false, userInfo: {}, goodsList: []}
    }
    async componentDidMount() {
        try {
            let userInfo = await global.storage.load({key: 'userInfo'})
            this.setState({userInfo: userInfo})
        }catch (e) {

        }
    }
    componentWillUnmount() {
    }


    render() {
        const {userInfo, loading} = this.state
        return (
            <View style={{height: '100%', backgroundColor: '#fff'}}>
                <Header
                    title="购买学习卡"
                    onPress={()=>this.props.navigation.goBack()}
                />
                {
                    loading ? <LoaderScreen message="Loading..." overlay/> : this._renderMain()
                }
            </View>
        )
    }
    _renderMain(){
        const {userInfo} = this.state
        return (
            <View style={{marginTop: 10, alignItems: "center"}}>
                <View>
                    <Image style={{width: width - 33}} source={require('./../../assets/personal/goumaixuexika.png')}/>
                    <View style={{position:"absolute", marginTop: 52, marginLeft: 26}}>
                        <Text style={{fontSize: 20,color: "#ffffff", fontWeight: "bold"}}>{userInfo.study_card.card_name}</Text>
                        <Text style={{fontSize: 15,color: "#ffffff", marginTop: 20, fontWeight: "bold"}}>**** **** **** ****</Text>
                        <Text style={{fontSize: 12,color: "#ffffff", marginTop: 10}}>有效期：1年（自激活之日算起）</Text>
                    </View>
                </View>
                <View style={{marginTop: 10}}>
                    {goodsList.map((goods)=>this._renderList(goods))}
                </View>
                <View style={{marginTop: 20, width: width - 33}}>
                    <Text style={{fontSize: 13,color: "#555555", lineHeight: 24}}>*温馨提示</Text>
                    <Text style={{fontSize: 13,color: "#959595", lineHeight: 24}}>在线支付仅提供学习卡号，无实体产品。一经购买，将不予退还。</Text>
                </View>
                <Toast ref="toast" position="center"/>
            </View>
        )
    }
    _renderList(goods){
        return (
            <View key={goods.goods_id}>
                <View style={{flexDirection: 'row',marginTop: 15, width: width - 33, marginBottom: 15}}>
                    <View style={{flex:1, justifyContent:"center"}}>
                        <Text style={{fontSize: 16,color: "#333333", fontWeight: "bold", paddingLeft: 10}}>{goods.goods_name}</Text>
                    </View>
                    <View style={{flexDirection: 'row', flex:1, alignItems:"center", justifyContent: "flex-end"}}>
                        <Text style={{fontSize: 15,color: "#67b919", fontWeight: "bold"}}>¥{goods.goods_price}</Text>
                        <Button
                            onPress={()=>this._toBuy(goods)}
                            title="购买"
                            buttonStyle={{width: 60, height: 29, backgroundColor: "#67b919", borderRadius: 3, padding: 0}}
                            textStyle={{fontSize: 13, color: "#ffffff"}}
                        />
                    </View>
                </View>
                <View style={styles.underLine}/>
            </View>
        )

    }
    async _toBuy(goods){
        if (this.post){
            return
        }
        this.post = true
        try {
            let orderInfo = axios.post(API_HOST + '/v2/student/order/create', {goods_id: goods.goods_id})
            if (orderInfo.data.retCode === 0) {
                this.props.navigation.push('ConfirmOrder', {goods: goods, orderInfo: orderInfo.data.retData})
            }
        }catch (e) {
            this.refs.toast.show('网络通讯错误，请检查网络！')
        }finally {
            this.post = false
        }

    }

}
const styles = StyleSheet.create({
    underLine:{
        height: 1,
        backgroundColor: "#f8f8f8"
    }
})
