import React, { Component } from 'react';
import {
    View,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    Text,
    DeviceEventEmitter,
    Dimensions
} from 'react-native'
import axios from 'axios';
import Header from './common/Header'
import Toast, {DURATION} from 'react-native-easy-toast'
import { Button,Header as ElHeader } from 'react-native-elements'
import BaseComponent from './../libs/BaseComponent'
const {height, width} = Dimensions.get('window');
import {LoaderScreen} from 'react-native-ui-lib'
import NoNet from "./common/NoNet";
import Download from './common/Download'
import PaperListItem from './common/PaperListItem'
import RNFS from "react-native-fs";
import examAttendStorage from "../libs/examAttendStorage";


export default class TSMN extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {userInfo: {},agentInfo:null,listData: [],total: 0, loading:false, page: 1, refreshing: false, loadOnEndReached: true, submitIng: false, netError: false}
        this.loading = false
    }
    async componentDidMount() {
        this._isMounted = true
        this.deEmitter = DeviceEventEmitter.addListener('FinishReload',async ()=>{
            if (this._isMounted){
                await this.setState({page: 1, refreshing: true});
                this._getPapers()
            }
        });
        this.onProcessEmitter = DeviceEventEmitter.addListener('onProcess',async (exam_id)=>{
            Log('onProcess', exam_id)
            if (this._isMounted){
                this._getPapers(exam_id)
            }
        });
        try {
            let agentInfo = await global.storage.load({key: 'agentInfo'})
            if (agentInfo) {
                await this.setState({agentInfo: agentInfo})
            }
        }catch (e) {

        }
        this._getPapers()
    }
    componentWillUnmount() {
        this._isMounted = false
        this.deEmitter.remove();
        this.onProcessEmitter.remove();
    }
    _toKefu(){
        const {agentInfo} =  this.state
        this.props.navigation.push('Kefu', agentInfo)
    }
    _toExperiencePage(){
        this.props.navigation.push('ExperiencePage')
    }
    _toExperienceSet(){
        this.props.navigation.push('ExperienceSet')
    }
    render () {
        let params = this.props.navigation.state.params || {}
        let title = params.hasOwnProperty('title') ? params.title : '听说模拟'
        const {loading, netError} =  this.state
        return (
            <View style={{flex: 1, backgroundColor: "#fff"}}>
                <ElHeader 
                    centerComponent={{ text: '英语说体验版', style: { fontSize: 16,color: "#353535" } }}
                    leftComponent={<TouchableOpacity onPress={()=>this._toExperienceSet()}><Image source={require('./../assets/experience/touxiang.png')} style={styles.menuIcon} /></TouchableOpacity>}
                    rightComponent={<TouchableOpacity onPress={()=>this._toKefu()}><Image source={require('./../assets/experience/kefu.png')} style={styles.menuIcon} /></TouchableOpacity>}
                    backgroundColor={"#fff"}
                />
                
                
                <View>
                    <Image style={{width: width}} source={require('./../assets/experience/baozhitongbu.png')}/>
                </View>

                {loading ? <LoaderScreen message="正在加载内容,请稍后..." overlay/> : null}
                {netError ? <NoNet onPress={()=>this._getPapers()} /> : null}
                {!loading && !netError ?
                <FlatList
                    extraData={this.state}
                    ItemSeparatorComponent={()=><View style={{flexDirection: 'row',alignItems: 'center', justifyContent: 'center'}}><View style={{height:1,backgroundColor:'#efefef', borderRadius: 1, width: width - 40}}/></View>}
                    keyExtractor={(item)=>item.exam_id}
                    data={this.state.listData}
                    renderItem={({item, index})=> this._renderItem(item, index)}
                    ListFooterComponent={()=>this._renderListFooter()}
                    ListEmptyComponent={()=>this._renderListEmpty()}
                />: null}
                {this.state.submitIng ? <LoaderScreen message="正在重新提交上次答题结果..." overlay/> : null}
                <Download
                    onFinish={(exam)=>this._downFinish(exam)}
                    onError={()=>this._downError()}
                    ref="download"
                />
                <Toast ref="toast" position="center"/>
                <View style={styles.tiyanFooter}>
                    <Image style={{width: 82}} source={require('./../assets/experience/qukaitong.png')}/>
                    <View style={{height: '100%', width:120,marginLeft:15,flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{fontSize: 16, lineHeight: 20, color: "#353535"}}>体验完整版功能</Text>
                        <Text style={{fontSize: 12, lineHeight: 20, color: "rgba(149, 149, 149, 0.6), paddingTop:10"}}>完整版功能更加丰富 </Text>
                    </View>
                    <Button
                        onPress={()=>this._toExperiencePage()}
                        buttonStyle={{width: 94, height: 36, borderRadius:4 , backgroundColor: "#2fcc75"}}
                        textStyle={{fontSize: 14, color: "#fff"}}
                        title="去体验"
                    />                              
                </View>
            </View>
        );
    }
    _onRefresh = async () => {
        console.log('_onRefresh')
        if (this.loading){
            return
        }
        await this.setState({page: 1, refreshing: true});
        this._getPapers()

    }
    _onEndReached = async ()=>{
        console.log('_onEndReached')
        if (this.loading){
            return
        }
        if (this.state.listData.length >= this.state.total) {
            //this.refs.toast.show('没有更多了！');
            return
        }
        let page = this.state.page + 1
        await this.setState({page: page, loadOnEndReached: true});
        this._getPapers()
    }
    _renderListFooter(){
        const {loadOnEndReached, total, listData} = this.state
        if (listData.length === 0){
            return null
        }
        return (
            <View style={{marginTop: 10,alignItems: 'center', justifyContent: 'center'}}>
                <View style={{height:1,backgroundColor:'#efefef', borderRadius: 1, width: '95%'}}/>
                <Text style={{marginTop: 10, marginBottom: 10}}>已经全部加载完毕</Text>
            </View>

        )
    }
    _renderListEmpty(){
        return  (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Image source={require('./../assets/homework/meishoudaozuoye.png')} style={{width: 263}}/>
                <View  style={{alignItems: 'center', justifyContent: 'center'}}>
                    <Text>莫急~ 内容正在路上，还有几站地就到 ~</Text>
                </View>
            </View>
        );
    }
    async _getPapers (exam_id) {
        if (this.loading){
            return
        }
        const {refreshing} = this.state
        exam_id = exam_id ? exam_id: 0
        let params = this.props.navigation.state.params || {}
        console.log('params', params)
        let unit_id = params.hasOwnProperty('unit_id') ? params.unit_id : 0
        try {
            this.loading = true
            this.setState({loading: true})
            let listData = await axios.get(global.API_HOST + '/v2/student/exercise/list',{
                params: {paper_type: 6, page: exam_id ? 1 : this.state.page, pagesize: 5, exam_id: exam_id, unit_id: unit_id}
            })
            this.setState({netError: false})
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
                    listData = listData[0]
                    let _listData = this.state.listData
                    for (let i in _listData) {
                        if (+_listData[i].exam_id === +exam_id){
                            _listData[i] = listData
                            this.setState({listData: _listData})
                            return
                        }
                    }
                    return
                }

                if (this.state.page === 1) {
                    this.setState({listData: listData, total: total})
                } else {
                    this.setState({listData: this.state.listData.concat(listData), total: total})
                }
                if (refreshing){
                    this.refs.toast.show('列表刷新成功');
                }
                return
            }
            this.refs.toast.show(listData.data.retMsg);
        }catch (e) {
            if (e.message === 'Network Error'){
                this.setState({netError: true})
            } else{
                LogServer(e.message, e)
                this.refs.toast.show('网络通讯错误，请检查网络！');
            }
        }finally {
            this.setState({loading: false})
            this.loading = false
        }

    }
    _renderItem (item,index) {
        return (
            <TouchableHighlight key={item.exam_id} onPress={()=>this._toPaperStart(item, index)} underlayColor="#fff">
                <PaperListItem item={item} showAvgScore={false}/>
            </TouchableHighlight>
        );
    }
    async _toPaperStart (exam, index) {
        // 检查预下载
        let download = await RNFS.exists(PAPER_BASE_PATH + exam.exam_id + '.json');
        if (!download){
            return this.refs.download.startDown(exam);
        }
        if (+exam.status === 201){
            this.props.navigation.navigate('ExamResult', exam)
            return
        }
        this.props.navigation.navigate({routeName: 'PaperStart', params: {exam_attend : exam, qsIds: [], exam_type: 2}})
    }
    _toBack () {
        this.props.navigation.goBack()
    }
    _downFinish(exam){
        this._getPapers(exam.exam_id)
    }
    _downError(){
        this.refs.toast.show('下载文件失败，请检查网络！', 3000);
    }
}

const styles = StyleSheet.create({
    item: {
        marginTop:11,
        marginBottom: 11,
        marginLeft:0,
        flexDirection: 'row'
    },
    itemImg: {
        borderRadius: 11,
        width: 138,
        height: 150,
    },
    itemName: {
        flex:1,
        marginLeft: 0,
        marginTop: 22,
        fontSize: 16,
        color: "#555555"
    },
    itemRt: {
        flexDirection: 'column',
        height: 150,
        width: width - 170,
    },
    tiyanFooter: {
        flex: 1,
        width:'100%',
        height: 90, 
        paddingLeft:20,
        paddingRight:20,
        position: 'absolute', 
        bottom:0,
        flexDirection: 'row', 
        alignItems: 'center', 
        borderTopColor:'#efefef',
        borderTopWidth:1 ,
        backgroundColor: "#fff"
    }
})