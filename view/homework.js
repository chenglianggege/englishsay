import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    TouchableHighlight,
    FlatList, DeviceEventEmitter, Dimensions, RefreshControl, Alert
} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import axios from 'axios';
import PaperStart from "./paper/start";
const {height, width} = Dimensions.get('window');
import { Button } from 'react-native-elements'
import BuyDialog from "./common/BuyDialog";
import NoNet from "./common/NoNet";
var Progress = require('react-native-progress');
import Download from './common/Download'
import RNFS from "react-native-fs";
import examAttendStorage from "../libs/examAttendStorage";

export default class HomeWork extends React.Component<Props> {
    constructor(props) {
        super(props);
        console.log('props.routeName',this.props.navigation.state.routeName)
        this.state = {
            userInfo: {},
            attend_status: this.props.navigation.state.routeName === 'unFinish' ? 1 : 2,
            loading: false,
            listData: [],
            total: 0,
            page: 1,
            refreshing: false,
            loadOnEndReached: false,
            netError: false
        }
        this.loading = false
        this.lastRefuse = 0
    }
    componentDidMount() {

        let _this = this
        this._navListener = this.props.navigation.addListener('didFocus', async () => {
            try {
                console.log('get userInfo')
                let userInfo = await global.storage.load({key: 'userInfo'})
                console.log(userInfo)
                await this.setState({userInfo: userInfo})
                if (!this.state.listData.length) {
                    return _this._getHomework()
                }
                if (Date.now() - _this.lastRefuse > 5 * 1000) {
                    return _this._getHomework()
                }

            }catch (e) {
                console.log('get userInfo', e)
                this.props.navigation.navigate({routeName: 'Login', params: {kickass: true}});
            }
        });
        this.deEmitter = DeviceEventEmitter.addListener('FinishReload',async ()=>{
            await this.setState({page: 1, refreshing: true})
            this._getHomework()
        });
        this.onProcessEmitter = DeviceEventEmitter.addListener('onProcess',async (exam_id)=>{
            Log('onProcess', exam_id)
            if (this._isMounted){
                this._getHomework(exam_id)
            }
        });

    }
    componentWillUnmount() {
        this.deEmitter.remove();
        this._navListener.remove();
        this.onProcessEmitter.remove();
    }

    render() {
        const {userInfo, netError} = this.state
        return (
            <View>
                <View style={{height: '100%', backgroundColor:"#f5f5f5"}}>
                    {netError ? <NoNet onPress={()=>this._getHomework()} /> :
                    <FlatList
                        extraData={this.state}
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                        onEndReached={this._onEndReached}
                        keyExtractor={(item) => item.exam_attend_id}
                        initialNumToRender={8}
                        data={this.state.listData}
                        renderItem={({item}) => this._renderItem(item)}
                        onEndReachedThreshold={Platform.OS === 'ios' ? 0 : 0.1}
                        ListEmptyComponent={this._renderListEmpty}
                        ListFooterComponent={()=>this._renderListFooter()}
                        onScrollEndDrag={()=>this._onScrollEndDrag()}
                    />
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

    _onRefresh = async () => {
        console.log('_onRefresh')
        /*
        await this.setState({refreshing: true})
        if (Platform.OS === 'android'){
            this._onScrollEndDrag()
        }
        */
        if (!this.loading){
            await this.setState({page: 1, refreshing: true});
            this._getHomework()
        }
    }
    _onScrollEndDrag = async ()=>{
        /*
        console.log('_onScrollEndDrag')
        if (this.state.refreshing){
            await this.setState({page: 1});
            this._getHomework()
        }
        */
    }
    _onEndReached = async ()=>{
        console.log('_onEndReached',this.state.refreshing, this.loading)
        if (this.state.refreshing || this.loading){
            return
        }
        const {listData, total, page} = this.state
        if (listData.length >= total) {
            //this.refs.toast.show('没有更多了！');
            return
        }
        await this.setState({page: this.state.page + 1, loadOnEndReached: true});
        this._getHomework()
    }
    _renderListEmpty = ()=>{
        let {userInfo} = this.state
        let isBindCard = userInfo.study_card && userInfo.study_card.expire_status === 1
        return (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                {isBindCard ?
                    <Image source={require('./../assets/homework/meishoudaozuoye.png')} style={{width: 263}}/> :
                    <Image source={require('./../assets/homework/zuoyebangka.png')} style={{width: 263}}/>
                }
                {isBindCard ?
                    (
                        <View  style={{alignItems: 'center', justifyContent: 'center'}}>
                            <Text>{!this.state.userInfo.class_info ? '加入班级后才能收到作业哦~' : (this.state.attend_status === 1 ? '暂时还没有收到作业哦~' : '暂时还没有已完成的作业哦~')}</Text>
                            {!this.state.userInfo.class_info ?
                                <Button
                                    onPress={() => this._toJoinClass()}
                                    buttonStyle={{
                                        width: 112,
                                        height: 39,
                                        backgroundColor: "#30cc75",
                                        borderRadius: 3,
                                        marginTop: 30
                                    }}
                                    textStyle={{fontSize: 15}}
                                    title="加入班级"
                                />:null
                            }
                        </View>
                    )

                    :
                    <View  style={{alignItems: 'center', justifyContent: 'center'}}>
                        <Text>亲，需要绑定学习卡才能使用哦~</Text>
                        <Button
                            onPress={()=> this.refs.buyDialog.toBuy()}
                            buttonStyle={{width: 112, height: 39, backgroundColor: "#30cc75",borderRadius: 3, marginTop: 30}}
                            textStyle={{fontSize: 15}}
                            title="去绑卡"
                        />
                    </View>
                }
            </View>
        );
    }
    _renderListFooter(){
        const {loadOnEndReached, total, listData} = this.state
        let str = '正在加载数据...'
        if (!loadOnEndReached && total >= listData.length) {
            str =  '已经全部加载完毕'
        }
        if (listData.length === 0){
            return null
        }
        return (
            <View style={{alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 10}}><Text>{str}</Text></View>
        )
    }
    _renderItem (item) {
        let score = item.score / item.paper_score * 100
        if (this.state.attend_status === 1) {
            return (
                <View style={styles.taskBar}>
                    <TouchableHighlight onPress={()=>this._toPaperStart(item)} underlayColor="#fff">
                        <View style={[styles.taskDetail,{}]}>
                            <View style={{flexDirection: 'row', width: width * 0.7}}>
                                <Text numberOfLines={1} style={styles.taskTitle}>{item.exam_title}</Text>
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
                                        backgroundColor: item.is_expired ? '#ff8414' : "#30cc75",
                                        width: 44,
                                        height: 20,
                                        borderRadius: 3,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <Text style={{
                                            fontSize: 10,
                                            color: "#fff"
                                        }}>{item.is_expired ? '已逾期' : '进行中'}</Text>
                                    </View>
                                }
                                {!item.download && !item.is_expired ? <Image style={{width: 22, height: 22, marginLeft: 8}} source={require('../assets/word/weixiazai.png')}/> : null}
                            </View>
                            <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center'}}>
                                <Image style={styles.taskIcon} source={require('./../assets/homework/fb.png')} />
                                <Text style={styles.taskDesc}>{formatDate(item.publish_time)}发布</Text>
                                <Image style={[styles.taskIcon, {marginLeft: 10}]} source={require('./../assets/homework/end.png')} />
                                <Text style={styles.taskDesc}>{formatDate(item.finish_time)}结束</Text>
                            </View>
                            {item.score_exception ?
                                <View style={{marginTop: 15}}>
                                    <Text style={{fontSize: 14, color: "#30cc75"}}>点击此处上传答案</Text>
                                </View>
                                :
                                <View style={{flexDirection: 'row', marginTop: 11, alignItems: 'center', display: 'flex', justifyContent: 'center', width: '85%'}}>
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
                                    <Text style={{fontSize: 12, color: "#858585", marginLeft: 6, width: 60}}>进度: {parseInt(+item.exam_process*100)}%</Text>
                                </View>
                            }
                        </View>

                    </TouchableHighlight>
                </View>



            )
        }else{
            return (
                <View style={{height: 90, width: width - 20 ,backgroundColor: "#fff", borderRadius: 9, marginTop: 10, marginLeft: 10}}>
                    <TouchableHighlight onPress={()=>this._toPaperStart(item)} underlayColor="#fff">
                        <View style={{height: 90, width: width - 20, alignItems: 'center', flexDirection: 'row'}}  >
                            <View style={{width: 70, justifyContent: 'center', alignItems: 'center'}}>
                                <View><Text style={{fontSize: 20, color: "#30cc75"}}>{(+item.score).toFixed(1)}分</Text></View>
                                <View style={{marginTop: 5}}><Text style={{fontSize: 12, color: "#858585", opacity: 0.8}}>总分:{(+item.paper_score).toFixed(1)}</Text></View>
                            </View>
                            <View style={{height: 45, width: 1, backgroundColor: "#efefef"}}/>
                            <View style={{flex: 1, marginLeft: 10}}>
                                <Text numberOfLines={1} style={styles.taskTitle}>{item.exam_title}</Text>
                                <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center'}}>
                                    <View style={{flex: 1, flexDirection: 'row',alignItems: 'center'}}>
                                        <Image style={styles.taskIcon} source={require('./../assets/homework/end.png')} />
                                        <Text style={styles.taskDesc}>{formatDate(item.ended_at)}完成</Text>
                                    </View>
                                    <View style={{flex: 1, flexDirection: 'row',alignItems: 'center'}}>
                                        <Image style={styles.taskIcon} source={require('./../assets/homework/fb.png')} />
                                        <Text style={styles.taskDesc}>{formatDate(item.finish_time)}结束</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{position: 'absolute', right: 0, top: 0}}>
                                <View style={{flex: 1, alignItems: 'flex-end'}}>
                                    {score < 60 ? <Image style={{width: 35, height: 35}} source={require('./../assets/homework/cha.png')}/> : null}
                                    {score >= 60 && score < 80 ? <Image style={{width: 35, height: 35}} source={require('./../assets/homework/zhong.png')}/> : null}
                                    {score >= 80 && score < 90 ? <Image style={{width: 35, height: 35}} source={require('./../assets/homework/liang.png')}/> : null}
                                    {score >= 90 ? <Image style={{width: 35, height: 35}} source={require('./../assets/homework/you.png')}/> : null}
                                </View>
                            </View>
                        </View>
                    </TouchableHighlight>
                </View>


            )
        }

    }
    async _toPaperStart (exam) {
        //return console.log(exam)
        if (this.loading){
            return
        }

        // 已过期
        if (exam.is_expired && exam.status <= 200){
            Alert.alert('提示','作业已结束，不能开始答题！')
            return
        }
        // 检查预下载
        let download = await RNFS.exists(PAPER_BASE_PATH + exam.exam_id + '.json');
        if (!download && !exam.is_expired){
            return this.refs.download.startDown(exam);
        }

        // 已完成
        if (+exam.status === 201){
            this.props.navigation.navigate('ExamResult', exam)
            return
        }

        // 进入答题
        this.props.navigation.navigate({routeName: 'PaperStart', params: {exam_attend : exam, qsIds: [], exam_type: 1}})
    }
    _addCard(){
        this.props.navigation.push('StudyCard')
    }
    _toJoinClass () {
        this.props.navigation.push('JoinClass')
    }
    async _getHomework(exam_id) {
        if (!this.state.userInfo.class_info) {
            return
        }
        if (this.loading){
            return
        }
        this.lastRefuse = Date.now()
        console.log('_getHomework', this.state.page)
        exam_id = exam_id ? exam_id: 0
        try {
            // this.setState({refreshing: true});
            this.loading = true
            let listData = await axios.get(global.API_HOST + '/v2/student/homework/list',{
                params: {
                    attend_status: this.state.attend_status,
                    pagesize: 10,
                    page: exam_id ? 1 : this.state.page,
                    exam_id: exam_id
                }
            })
            this.setState({netError: false})
            if (listData.data.retCode === 4001) {
                this.props.navigation.navigate({routeName: 'Login', params: {kickass: true}});
                // NavigationActions.navigate('Login')
                return
            }
            if (listData.data.retCode === 0) {
                let total = listData.data.retData.total
                listData = listData.data.retData.list ? listData.data.retData.list : []
                // check local is download
                for (let i in listData) {
                    let json_file = PAPER_BASE_PATH + listData[i].exam_id + '.json';
                    listData[i].download = await RNFS.exists(json_file);
                    listData[i].score_exception = await examAttendStorage.checkAnswerFinish(listData[i].exam_attend_id) && !await examAttendStorage.checkScoreFinish(listData[i].exam_attend_id)

                }
                //单独更新一个exam_id
                if (exam_id) {
                    if (!listData.length){
                        return
                    }
                    let _listData = this.state.listData
                    for (let i in _listData) {
                        if (+_listData[i].exam_id === +exam_id){
                            _listData[i] = listData[0]
                            this.setState({listData: _listData})
                            return
                        }
                    }
                    return
                }
                if (this.state.page === 1) {
                    this.setState({listData: listData, total: total})
                    // this.setState({unFinishListData: this.state.unFinishListData.concat(listData.data.retData.list)})
                } else {
                    this.setState({listData: this.state.listData.concat(listData), total: total})
                }
                if (this.state.refreshing){
                    this.refs.toast.show('刷新作业列表成功！');
                }
                // this.setState({total: listData.data.retData.total})
            }
        }catch (e) {
            if (e.message === 'Network Error'){
                this.setState({netError: true})
            } else{
                LogServer(e.message, e)
                this.refs.toast.show('网络通讯错误，请检查网络！');
            }

        }finally {
            this.loading = false
            this.setState({loadOnEndReached: false, refreshing: false})
        }

    }
    _downFinish(exam){
        this._getHomework(exam.exam_id)
    }
    _downError(){
        this.refs.toast.show('下载文件失败，请检查网络！', 3000);
    }
}

const styles = StyleSheet.create({
    navContainer: {
        flex: 1,
        height: 50,
        alignItems:'center', justifyContent:'center',
        backgroundColor:"#fff"
    },
    navBtn: {
        fontSize: 16,
        color: "#333333",
        textAlign:'center'
    },
    navBtnIn: {
        color: "#6ab72b",
    },
    navLine: {
        height:2,
        borderRadius: 1, width: 34, marginTop: 12,
        backgroundColor: "#fff"
    },
    navActLine: {
        backgroundColor:'#6ab72b',
    },
    taskBar: {
        height: 108, width: width - 20 ,backgroundColor: "#fff", borderRadius: 9, marginTop: 10, alignSelf: 'center'
    },
    taskDetail: {
        marginTop: 20,
        marginLeft: 16,
        marginRight: 13
    },
    taskTitle: {
        fontSize: 16,
        color: "#353535"
    },
    taskIcon: {
        width: 12,
        height: 12
    },
    taskDesc: {
        marginLeft: 5,
        letterSpacing: 0,
        fontSize: 12, color: "#858585"
    }
})