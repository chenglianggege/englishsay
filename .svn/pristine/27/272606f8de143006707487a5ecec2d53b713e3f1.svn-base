import React, { Component } from 'react';
import {Icon} from 'react-native-elements'
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
    Keyboard, Dimensions, DeviceEventEmitter,Modal
} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import {LoaderScreen, Dialog} from 'react-native-ui-lib';
import axios from 'axios';
import BuyDialog from "../common/BuyDialog";
import NoNet from "./../common/NoNet";

const {height, width} = Dimensions.get('window');

export default class StudyCard extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {loading: true, userInfo: {}, card_num: '', cardList: [], showBuyCard: false, netError: false}
    }
    async componentDidMount() {
        this.deEmitter = DeviceEventEmitter.addListener('UpdateStudyCard',async ()=>{
            this._getCardList()
        });
        let userInfo = await global.storage.load({key: 'userInfo'})
        console.log(userInfo)
        this.setState({userInfo: userInfo})
        this._getCardList()
    }
    componentWillUnmount() {
        // this._navListener.remove();
        this.deEmitter.remove();
    }
    async _getCardList () {
        try {
            this.setState({loading: true, netError: false})
            let cardList = await axios.get(API_HOST + '/v2/student/study-card/list')
            if (cardList.data.retCode === 0){
                this.setState({cardList: cardList.data.retData ? cardList.data.retData : []})
            }
        }catch (e) {
            this.refs.toast.show('网络通讯错误，请检查网络！')
            if (e.message === 'Network Error'){
                this.setState({netError: true})
            } else{
                LogServer(e.message, e)
            }
        }finally {
            this.setState({loading: false})
        }
    }
    render() {
        const {userInfo, loading, cardList, netError} = this.state
        return (
            <View style={{height: '100%', backgroundColor: '#fff'}}>
                <Header
                    title="学习卡"
                    onPress={()=>this.props.navigation.goBack()}
                    rightWidth={180}
                    rightComponent={
                        <TouchableOpacity onPress={()=>this.refs.buyDialog.toBuy()} style={{flexDirection: 'row', alignItems:'center', justifyContent:'center'}}>
                            <Icon name='circle-with-plus'  type='entypo' color='#000'/>
                            <Text style={{color: "#000"}}>重新绑卡</Text>
                        </TouchableOpacity>
                    }
                />
                {netError ?
                    <NoNet onPress={() => this._getCardList()}/> :
                    <ScrollView>
                        {cardList.map(item => this._renderItem(item))}
                    </ScrollView>
                }
                <BuyDialog userInfo={userInfo} navigation={this.props.navigation} ref="buyDialog"/>
                {loading ? <LoaderScreen message="Loading..." overlay/> : null}
                <Toast ref="toast" position="center"/>
            </View>
        )
    }
    _renderItem (item){
        if (+item.is_current !== 1){
            return null
        }
        return (
            <View key={item.card_id} style={{alignItems: 'center'}}>
                <View>
                    <Image style={{width: width - 10, height: 207}} source={require('./../../assets/personal/card.png')}/>
                    <View style={{position: 'absolute', marginTop: 30, marginLeft: 40}}>
                        <Text style={{fontSize:15, color: "#fff"}}>{GRADES[item.grade]}</Text>
                        <Text style={{fontSize:18, color: "#fff", marginTop: 10}}>英语说学习卡</Text>
                        <Text style={{fontSize:18, color: "#fff", marginTop: 30}}>{item.card_key}</Text>
                        <Text style={{fontSize:15, color: "#fff", marginTop: 10}}>有效期至：{item.expire_time}</Text>
                    </View>
                </View>


            </View>
        )
    }

}
