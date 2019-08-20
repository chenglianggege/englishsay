import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    StatusBar,
    Image,
    TouchableOpacity,
    Dimensions,
    Alert,
    PermissionsAndroid,
    NativeEventEmitter,
    ScrollView,
    TouchableHighlight,
    DeviceEventEmitter
} from 'react-native';
import { Button } from 'react-native-elements'
import Toast, {DURATION} from 'react-native-easy-toast'
import {Carousel, PageControl} from 'react-native-ui-lib';
import Units from "./units";
import axios from "axios/index";
import { NavigationActions } from 'react-navigation';
import BuyDialog from "./common/BuyDialog";
const {height, width} = Dimensions.get('window');
import NoNet from "./common/NoNet";
var Progress = require('react-native-progress');
import Download from './common/Download'
import RNFS from "react-native-fs";
import examAttendStorage from "../libs/examAttendStorage";

export default class Home extends Component {
    static navigationOptions =  ({ navigation }) => ({
        header: null
    });
    constructor(props) {
        super(props);
        this.state = {userInfo: {}, loading:false, currentPage: 0, homeworkList: [], agentInfo: null,showBuyCard:false, netError: false}
        this.lastRefuse = 0
        const setParamsAction = NavigationActions.setParams({
            params: { tabBarVisible: false },
            key: 'homework',
        });
        this.props.navigation.dispatch(setParamsAction);
    }
    async componentDidMount() {

        const eventEmitter = new NativeEventEmitter(Recorder)
        let _this = this
        this.onScoreEmitter = eventEmitter.addListener('onScore', (ret)=>{
            ret = JSON.parse(ret)
            if (ret.hasOwnProperty('errId')) {
                Alert.alert('未知错误','英语说遇到未知错误,请检查应用录音权限或重启APP')
                LogServer('TEST_SCORE_EXCEPTION', ret);
                //_this.refs.toast.show('评分引擎初始化失败！错误码：'+ret.errId+'，请尝试重启APP！');
            }else{
                //_this.refs.toast.show('评分引擎初始化成功！');
            }
        });

        //每次didFocus都更新下首页内容
        this._navListener = this.props.navigation.addListener('didFocus', async () => {
            if (Date.now() - _this.lastRefuse > 2 * 1000) {
                _this._getHomework()
            }
            try {
                let userInfo = await global.storage.load({key: 'userInfo'})
                let agentInfo = await global.storage.load({key: 'agentInfo'})
                //console.log(agentInfo)
                await _this.setState({userInfo: userInfo, agentInfo: agentInfo})
            }catch (e) {
                console.log('home1 login')
                _this.props.navigation.navigate({routeName: 'Login', params: {kickass: true}});
            }
        });
        //退出答题流程后会触发FinishReload事件
        this.deEmitter = DeviceEventEmitter.addListener('FinishReload',async ()=>{
            _this._getHomework()
        });

        //检查请求录音权限
        try {
            await global.storage.load({key: 'checkPromise'})
            this._checkPermission()
        }catch (e) {
            await global.storage.save({key: 'checkPromise', data: '1'})
            Alert.alert('请求录音权限','答题需要使用您手机的录音权限，请选择允许录音',[
                {text: '好', onPress: () => {
                        _this._checkPermission()
                    }},
            ],{ cancelable: false })
        }

    }
    componentWillUnmount() {
        this.deEmitter.remove();
        this._navListener.remove();
        this.onScoreEmitter.remove();
    }
    async _checkPermission(){
        let _this = this
        try {
            if (Platform.OS === 'ios'){
                let ret = await Recorder.checkPermissionIOS()
                console.log('checkPermissionIOS', ret)
                if (!+ret) {
                    Alert.alert('请求录音权限','答题需要使用您手机的录音权限，请前往设置打开录音权限',[
                        {text: '好', onPress: () => {Recorder.requestPermissionIOS()}},
                    ],{ cancelable: false })
                }
            }
            if (Platform.OS === 'android'){
                let ret = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
                if (!ret){
                    const rationale = {
                        'title': '请求录音权限',
                        'message': '评分引擎需要您的录音权限.'
                    };
                    let result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
                    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                        Alert.alert('获取权限','口语答题必须需要使用您手机的录音权限，禁止录音将无法答题,请前往手机系统设置打开本应用的录音权限！')
                        return
                    }
                }
            }
            this._requestPermission()

        }catch (e) {
            LogServer('CHECK_PERMISSON_EXCEPTION', e.message);
        }
    }

    //通过一次录音测试来获取录音权限
    async _requestPermission(){
        Recorder.skegnStart({coreType: 'sent.eval', refText: 'One Two Three Four Five', scale: 100}).then(()=>{
            setTimeout(function () {
                Recorder.skegnStop()
            },1000)
        }).catch(e=>{
            LogServer('TEST_PERMISSON_EXCEPTION', e.message);
        })
    }

    render() {
        const {userInfo, agentInfo, netError} =  this.state

        return (
            <View style={{flex: 1, backgroundColor:"#f5f5f5"}}>
                <StatusBar translucent={true} backgroundColor='transparent' barStyle="dark-content"/>
                <View style={{width: width, height: 200, alignItems: 'center'}}>
                    {this._renderBanner()}
                    {this._renderKefu()}
                </View>
                {this._renderModules()}
                {this._renderNotice()}
                <View style={{width: width, marginTop: 9, backgroundColor: "#fff", flex: 1, alignItems:'center'}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: width - 28, marginTop: 21}}>
                        <Text style={{fontSize: 16, color: "#353535"}}>最新作业</Text>
                        {userInfo.class_info && userInfo.class_info.hasOwnProperty('class_name') ?
                        <View style={{borderWidth: 1, borderColor: '#2fcc75', borderRadius: 10}}>
                            <Text style={{fontSize: 14 , color: "#2fcc75", paddingLeft: 8, paddingRight: 8, lineHeight: 20}}>{userInfo.class_info.class_name }</Text>
                        </View> :null}
                    </View>
                    {netError ? <ScrollView style={{width: width}}><NoNet onPress={()=>this._getHomework()} /></ScrollView> :
                        <View style={{ flex: 1}}>
                            {this._renderHomework()}
                        </View>
                    }
                </View>
                <BuyDialog userInfo={userInfo} ref="buyDialog" navigation={this.props.navigation}/>
                <Download
                    onFinish={(exam)=>this._downFinish(exam)}
                    onError={()=>this._downError()}
                    ref="download"
                />
                <Toast ref="toast" position="center"/>
            </View>
        );
    }

    _renderModules(){
        const {userInfo} =  this.state
        if (!userInfo || !userInfo.study_card) {
            return null
        }
        let card_setting = JSON.parse(userInfo.study_card.card_setting)
        let card_modules = +card_setting.card_modules
        return (
            <View style={{width: width, height: 105, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', backgroundColor: "#fff"}}>
                {(card_modules & (1 << 1)) > 0 ?
                    <TouchableOpacity onPress={()=>this._toWord()} style={styles.btnGroup}>
                        <Image style={styles.btnGroupImg} source={require('./../assets/home/Group2.png')}/>
                        <Text style={styles.btnGroupText}>单词跟读</Text>
                    </TouchableOpacity> : null}

                {(card_modules & (1 << 2)) > 0 ?
                    <TouchableOpacity onPress={()=>this._toSent()} style={styles.btnGroup}>
                        <Image style={styles.btnGroupImg} source={require('./../assets/home/Group3.png')}/>
                        <Text style={styles.btnGroupText}>课文跟读</Text>
                    </TouchableOpacity> : null}

                {(card_modules & (1 << 3)) > 0 ?
                    <TouchableOpacity onPress={()=>this._toTSMN()} style={styles.btnGroup}>
                        <Image style={styles.btnGroupImg} source={require('./../assets/home/Group4.png')}/>
                        <Text style={styles.btnGroupText}>听说模拟</Text>
                    </TouchableOpacity> : null}

                {(card_modules & (1 << 4)) > 0 ?
                    <TouchableOpacity onPress={()=>this._toTSZX()} style={styles.btnGroup}>
                        <Image style={styles.btnGroupImg} source={require('./../assets/home/Group5.png')}/>
                        <Text style={styles.btnGroupText}>听说专项</Text>
                    </TouchableOpacity> : null}

                {(card_modules & (1 << 5)) > 0 ?
                    <TouchableOpacity onPress={()=>this._toKHZY()} style={styles.btnGroup}>
                        <Image style={styles.btnGroupImg} source={require('./../assets/home/kehouzuoye.png')}/>
                        <Text style={styles.btnGroupText}>课后作业</Text>
                    </TouchableOpacity> : null}


            </View>
        )
    }
    _renderBanner(){
        const {agentInfo} = this.state
        console.log(agentInfo,123456)
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
    _renderKefu(){
        const {agentInfo} =  this.state
        if (agentInfo && agentInfo.kefu) {
            return (
                <View style={{position: 'absolute', alignSelf:'flex-end', marginTop: 26}}>
                    <TouchableOpacity onPress={()=>this._toKefu()}>
                        <Image style={{width: 34 ,height: 34,marginRight: 11}} source={require('./../assets/home/kefu.png')}/>
                    </TouchableOpacity>
                </View>
            )
        }
        return null
    }
    _renderHomework(){
        const {homeworkList, userInfo} = this.state
        let isBindCard = userInfo.study_card && userInfo.study_card.expire_status === 1
        if (!isBindCard){
            return (
                <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: "#ffffff"}}>
                    <Text style={{fontSize: 16, color:"#858585"}}>您还没有绑定学习卡</Text>
                    <Text style={{fontSize: 16, color:"#858585",marginTop: 5}}>绑定后才可以使用此功能</Text>
                    <Button
                        onPress={()=> this.refs.buyDialog.toBuy()}
                        buttonStyle={{width: 113, height: 39, borderRadius:4 , backgroundColor: "#2fcc75",marginTop: 20}}
                        textStyle={{fontSize: 14, color: "#fff"}}
                        title="去绑卡"
                    />
                </View>
            )
        }
        if (!userInfo.class_info){
            return (
                <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: "#ffffff"}}>
                    <Text style={{fontSize: 16, color:"#858585"}}>您还没有加入班级</Text>
                    <Text style={{fontSize: 16, color:"#858585",marginTop: 5}}>加入班级后才能收到作业哦~</Text>
                    <Button
                        onPress={()=> this._toJoinClass()}
                        buttonStyle={{width: 113, height: 39, borderRadius:4 , backgroundColor: "#2fcc75",marginTop: 20}}
                        textStyle={{fontSize: 14, color: "#fff"}}
                        title="加入班级"
                    />
                </View>
            )
        }
        if (homeworkList && homeworkList.length){
            return (
                <ScrollView style={{width: width, marginTop: 9, backgroundColor: "#fff"}}>
                    {homeworkList.map((item,idx)=>this._renderItem(item,idx))}
                </ScrollView>
            )
        }
        return (
            <ScrollView>
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                    <Image source={require('./../assets/homework/meishoudaozuoye.png')} style={{height: 150, width: 250}}/>
                    <Text style={{fontSize: 16, color:"#858585",marginTop: 20}}>暂时还没有收到作业哦~</Text>
                </View>
            </ScrollView>
        )

    }
    _renderItem(item,idx){
        return (
            <TouchableHighlight key={idx}  underlayColor="#fff"  onPress={()=>this._toPaperStart(item)}>
                <View style={{}}>
                    <View style={{height: 107,paddingLeft: 24}}>
                        <View style={{flexDirection: 'row', alignItems: 'center',marginTop: 20, width: width * 0.7}}>
                            <Text numberOfLines={1} style={{fontSize: 16, color: "#353535"}}>{item.exam_title}</Text>
                            {item.score_exception ?
                                <View style={{
                                    marginLeft: 5,
                                    backgroundColor: '#1394fa',
                                    width: 44,
                                    height: 20,
                                    borderRadius: 3,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Text style={{fontSize: 10, color: "#fff"}}>待评分</Text>
                                </View>
                                :
                                <View style={{
                                    marginLeft: 5,
                                    backgroundColor: "#30cc75",
                                    width: 44,
                                    height: 20,
                                    borderRadius: 3,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Text style={{fontSize: 10, color: "#fff"}}>进行中</Text>
                                </View>
                            }
                            {!item.download ? <Image style={{width: 22, height: 22, marginLeft: 8}} source={require('../assets/word/weixiazai.png')}/> : null}
                        </View>
                        <View style={{flexDirection: 'row', marginTop: 15, alignItems: 'center'}}>
                            <Image style={{width: 12, height: 12}} source={require('./../assets/homework/fb.png')}/>
                            <Text style={{fontSize: 12, color: "#858585", marginLeft: 6}}>{formatDate(item.publish_time)}发布</Text>
                            <Image style={{width: 12, height: 12, marginLeft: 10}} source={require('./../assets/homework/end.png')}/>
                            <Text style={{fontSize: 12, color: "#858585", marginLeft: 6}}>{formatDate(item.finish_time)}结束</Text>
                        </View>
                        {item.score_exception ?
                            <View style={{marginTop: 15}}>
                                <Text style={{fontSize: 14, color: "#30cc75"}}>点击此处上传答案</Text>
                            </View>
                            :
                            <View style={{
                                flexDirection: 'row',
                                marginTop: 11,
                                alignItems: 'center',
                                display: 'flex',
                                justifyContent: 'center',
                                width: '85%'
                            }}>
                                <Progress.Bar
                                    progress={+item.exam_process}
                                    height={3}
                                    color="#30cc75"
                                    borderRadius={2}
                                    style={{flex: 1}}
                                    width={null}
                                    unfilledColor="#efefef"
                                    borderColor="#efefef"
                                    borderWidth={0}
                                    animated={false}
                                />
                                <Text style={{
                                    fontSize: 12,
                                    color: "#858585",
                                    marginLeft: 6,
                                    width: 80
                                }}>进度: {parseInt(+item.exam_process * 100)}%</Text>
                            </View>
                        }
                    </View>
                    <View style={styles.underLine}/>
                </View>
            </TouchableHighlight>
        )
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

    async _toPaperStart (exam) {
        let download = await RNFS.exists(PAPER_BASE_PATH + exam.exam_id + '.json');
        if (!download){
            return this.refs.download.startDown(exam);
        }
        if (+exam.status === 201){
            this.props.navigation.navigate('ExamResult', exam)
            return
        }
        // console.log(exam.finish_time, exam.finish_time + '000' < new Date().getTime())
        if (exam.finish_time + '000' < new Date().getTime()){
            Alert.alert('提示','作业已结束，不能开始答题！')
            return
        }
        this.props.navigation.navigate({routeName: 'PaperStart', params: {exam_attend : exam, qsIds: [], exam_type: 1}})
    }
    onChangePage(index){
        this.setState({currentPage: index})
    }
    _toTSZX () {
        if (this._checkBind()){
            this.props.navigation.push('TSZX')
        }
    }
    _toWord () {
        if (this._checkBind()){
            this.props.navigation.push('Word')
        }
    }
    _toSent(){
        if (this._checkBind()){
            this.props.navigation.push('Units')
        }
    }
    _toTSMN () {
        if (this._checkBind()){
            this.props.navigation.push('TSMN')
        }
    }
    _toKHZY(){
        if (this._checkBind()){
            this.props.navigation.navigate('homework')
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
    _toJoinClass () {
        this.props.navigation.push('JoinClass')
    }
    _toKefu(){
        const {userInfo, agentInfo} =  this.state
        this.props.navigation.push('Kefu', agentInfo)
    }


    async _getHomework(){
        this.lastRefuse = Date.now()
        try{
            let listData = await axios.get(global.API_HOST + '/v2/student/homework/list',{
                params: {
                    attend_status: 1,
                    pagesize: 100,
                    page: 1
                }
            })
            this.setState({netError: false})
            if (listData.data.retCode === 4001) {
                console.log('home login')
                this.props.navigation.navigate({routeName: 'Login', params: {kickass: true}});
                // NavigationActions.navigate('Login')
                return
            }
            if (listData.data.retCode === 0) {
                listData = listData.data.retData.list ? listData.data.retData.list : []
                let homeworkList = []
                for (let i in listData) {
                    let listItem = listData[i]
                    if (listItem.finish_time + '000' > new Date().getTime()) {
                        let json_file = PAPER_BASE_PATH + listItem.exam_id + '.json';
                        listItem.download = await RNFS.exists(json_file);
                        listItem.score_exception = await examAttendStorage.checkAnswerFinish(listItem.exam_attend_id) && !await examAttendStorage.checkScoreFinish(listItem.exam_attend_id)
                        homeworkList.push(listItem)
                    }
                }
                this.setState({homeworkList: homeworkList})
            }
        }catch (e) {
            this.refs.toast.show('网络通讯错误，请检查网络！', 3000);
            if (e.message === 'Network Error'){
                this.setState({netError: true})
            }
        }

    }
    _downError(){
        this.refs.toast.show('下载文件失败，请检查网络！', 3000);
    }
    // 下载成功回调
    _downFinish(exam){
        this._getHomework()
    }
}


const styles = StyleSheet.create({
    btnGroup: {
        width: 65, alignItems: 'center', justifyContent: 'center', flex: 1
    },
    btnGroupImg: {
        width: 50, height: 50
    },
    btnGroupText: {
        fontSize: 13, color: "#858585", marginTop: 8
    },
    underLine:{
        height: 1,
        width: width - 30,
        backgroundColor: "#efefef",
        alignSelf: 'center'
    }
});
