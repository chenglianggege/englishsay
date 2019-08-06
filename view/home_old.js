import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    StatusBar,
    Image,
    TouchableOpacity, Dimensions, Alert, PermissionsAndroid, NativeEventEmitter, ScrollView
} from 'react-native';
import { Button } from 'react-native-elements'
import Toast, {DURATION} from 'react-native-easy-toast'
const {height, width} = Dimensions.get('window');
import {Carousel, PageControl} from 'react-native-ui-lib';
import BuyDialog from "./common/BuyDialog";

export default class Home extends Component {
    static navigationOptions = {
        header: null,
    };
    constructor(props) {
        super(props);
        this.state = {userInfo: {}, loading:false, currentPage: 0, agentInfo: null, showBuyCard: false}
    }
    async componentDidMount() {
        const eventEmitter = new NativeEventEmitter(Recorder)
        this.onScoreEmitter = eventEmitter.addListener('onScore', (ret)=>{console.log(ret)});
        this._navListener = this.props.navigation.addListener('didFocus', async () => {
            try {
                let userInfo = await global.storage.load({key: 'userInfo'})
                console.log(userInfo)
                let agentInfo = await global.storage.load({key: 'agentInfo'})
                await this.setState({userInfo: userInfo, agentInfo: agentInfo})
            }catch (e) {
                this.props.navigation.navigate({routeName: 'Login', params: {kickass: true}});
            }
        });
        try {
            //非第一次打开，每次打开都检查权限
            await global.storage.load({key: 'checkPromise'})
            this._checkPromise()
        }catch (e) {
            // 第一次打开直接获取权限
            await global.storage.save({key: 'checkPromise', data: '1'})
            if (Platform.OS === 'ios'){
                this._getPromise()
            } else {
                this._checkPromise()
            }

        }
    }
    async _checkPromise(){
        const rationale = {
            'title': '请求录音权限',
            'message': '评分引擎需要您的录音权限.'
        };
        let _this = this
        try {
            let check = Platform.OS === 'ios' ? true : await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
            console.log('Permission check:', check);
            if (!check) {
                let result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
                console.log('Permission result:', result);
                if (PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN === result) {
                    Alert.alert('获取权限','口语答题必须需要使用您手机的录音权限，禁止录音将无法答题,请前往手机系统设置打开本应用的录音权限！')
                    return
                }
                if (!(result === true || result === PermissionsAndroid.RESULTS.GRANTED)){
                    _this._getPromise()
                }
            }
        }catch (e) {
            Log(e)
        }
    }
    async _getPromise(){
        Alert.alert('获取权限','答题需要使用您手机的录音权限，请选择允许录音',[
            {text: '好', onPress: () => {
                    Recorder.skegnStart({coreType: 'sent.eval', refText: 'One Two Three Four Five', scale: 100}).then(()=>{
                        setTimeout(function () {
                            Recorder.skegnStop()
                        },1000)
                    }).catch(e=>{
                        LogServer('TEST_PERMISSON_EXCEPTION', e);
                    })
                }},
        ],{ cancelable: false })
    }
    componentWillUnmount() {
        this._navListener.remove();
        this.onScoreEmitter.remove();
    }
    render() {
        const {userInfo, agentInfo, showBuyCard} =  this.state
        let isBindCard = userInfo.study_card && userInfo.study_card.expire_status === 1
        return (
            <View style={{justifyContent: 'center'}}>
                <StatusBar translucent={true} backgroundColor='transparent' barStyle="dark-content"/>
                <View style={{width: width, height: 200, alignItems: 'center'}}>
                    {this._renderBanner()}
                    {agentInfo && agentInfo.kefu?
                        <View style={{position: 'absolute', alignSelf:'flex-end', marginTop: 26}}>
                            <TouchableOpacity onPress={()=>this._toKefu()}>
                                <Image style={{width: 34 ,height: 34,marginRight: 11}} source={require('./../assets/home/kefu.png')}/>
                            </TouchableOpacity>
                        </View> : null
                    }

                </View>

                {this._renderNotice()}
                <ScrollView showsVerticalScrollIndicator={false} alwaysBounceVertical={false} scrollEnabled={width / height > 0.6} style={{marginBottom: 10}}>
                    {this._renderModules()}
                </ScrollView>
                <BuyDialog userInfo={userInfo} ref="buyDialog"  navigation={this.props.navigation}/>
                <Toast ref="toast" position="center"/>
            </View>
        );
    }
    _renderNotice(){
        const {userInfo} =  this.state
        if (!userInfo || !userInfo.study_card) {
            return null
        }
        let expire_time = new Date(Date.parse(userInfo.study_card.expire_time.replace(/-/g,  "/"))).getTime();
        let expireDays = Math.ceil((expire_time - new Date().getTime()) / 86400000)
        let isBindCard = userInfo.study_card && +userInfo.study_card.expire_status === 1
        if (+userInfo.study_card.card_type === 2 ||  expireDays <= 7) {
            return (
                <TouchableOpacity onPress={()=>this.refs.buyDialog.toBuy()}>
                    <View style={{height: 84, width: width, alignItems: 'center', backgroundColor: "#ffffff"}}>
                        <Image source={require('./../assets/home/chongxinbangka.png')} style={{width: width, height: 84}}/>
                        <Text style={{position: 'absolute', fontSize: 16, color: "#5c8d0f", marginTop: 22, fontWeight: "bold", width: width / 2, textAlign:'center'}}>{isBindCard ? '学习卡将于'+expireDays+'天后过期' : '学习卡已过期'}</Text>
                    </View>
                </TouchableOpacity>
            )
        }
        return null
    }

    _renderBanner(){
        const {agentInfo} = this.state
        if (!agentInfo || !agentInfo.hasOwnProperty('banner') || agentInfo.banner.length === 0){
            return null
        }
        if (agentInfo && agentInfo.hasOwnProperty('banner') && agentInfo.banner.length > 1){
            return (
                <View style={{alignItems: 'center'}}>
                    <Carousel loop pageWidth={width} onChangePage={(index => this.onChangePage(index))}>
                        {agentInfo.banner.map((item,idx)=>{
                            return (
                                <View key={idx}>
                                    <Image style={[{width: width, height: 200}]} source={{uri: STATIC_HOST + item}}/>
                                </View>
                            )
                        })}</Carousel>
                    <PageControl color={'#ffffff'} containerStyle={{position: 'absolute', marginTop: 180}} size={7} numOfPages={agentInfo.banner.length} currentPage={this.state.currentPage}/>
                </View>
            )
        }
        return (
            <View>
                <Image style={[{width: width, height: 200}]} source={{uri: STATIC_HOST + agentInfo.banner[0]}}/>
            </View>
        )
    }
    _renderModules(){
        const {userInfo} = this.state
        if (!userInfo || !userInfo.hasOwnProperty('study_card')){
            return null
        }
        let card_setting = JSON.parse(userInfo.study_card.card_setting)
        if (card_setting.card_modules && card_setting.card_modules.length > 0){
            return (
                <View style={{backgroundColor: '#fff', alignItems:"center", height: height - (width  * (452 / 750)) + 40}}>
                    {card_setting.card_modules.map((item, idx) => this._renderModule(item, idx))}
                </View>
            )
        }
        return null
    }
    _renderModule(item, idx){
        return (
            <View key={idx} style={{marginTop: 10}}>
                <TouchableOpacity onPress={()=>this._toTSMN(item)}>
                    <View style={styles.mainBtn}>
                        <Image style={[styles.btnIcon]} source={{uri : PAPER_STATIC_HOST + item.unit_pic}} />
                        <View style={[styles.descText]}>
                            <Text style={styles.descTitle}>{item.unit_name}</Text>
                            <Text style={styles.descContent}>{item.unit_desc}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    _toTSZX () {
        if (this._checkBind()){
            this.props.navigation.push('TSZX')
        }
    }

    _toTSMN (item) {
        if (this._checkBind()){
            this.props.navigation.push('TSMN',item)
        }
    }
    _checkBind(){
        const {userInfo} =  this.state
        let isBindCard = userInfo.study_card && userInfo.study_card.expire_status === 1
        if (!isBindCard){
            this.refs.toast.show('请绑定学习卡，解锁功能后使用！');
            return false
        }
        return true
    }
    _toKefu(){
        const {userInfo, agentInfo} =  this.state
        this.props.navigation.push('Kefu', agentInfo)
    }
    onChangePage(index){
        this.setState({currentPage: index})
    }
}


const styles = StyleSheet.create({
    mainBtn: {
        flexDirection: 'row',
    },
    btnIcon: {
        width: width - 10,
        height: 125
    },
    descText: {
        position: 'absolute',
        marginLeft: width / 3 + 20,
        marginTop: 30
    },
    descTitle: {
        fontSize: 18,
        color: "#30cc75"
    },
    descContent: {
        fontSize: 12,
        marginTop: 14,
        color: "#aaaaaa"
    }
});
