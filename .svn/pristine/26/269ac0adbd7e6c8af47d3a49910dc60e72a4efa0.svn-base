import React, { Component } from 'react';
import {
    View,
    FlatList,
    Image,
    StyleSheet,
    TouchableHighlight,
    Platform,
    Text,
    DeviceEventEmitter,
    Dimensions, Alert
} from 'react-native'
import axios from 'axios';
import Header from './common/Header'
import Toast, {DURATION} from 'react-native-easy-toast'
import BaseComponent from './../libs/BaseComponent'
var Progress = require('react-native-progress');
const {height, width} = Dimensions.get('window');
import {LoaderScreen} from 'react-native-ui-lib'
import RNFS from "react-native-fs";
import Download from './common/Download'
import PaperListItem from './common/PaperListItem'
import NoNet from "./common/NoNet";


export default class Sent extends BaseComponent {

    constructor(props) {
        super(props);
        let params = this.props.navigation.state.params
        this.state = {
            listData: [],
            total: 0,
            loading:false,
            page: 1,
            refreshing: true,
            loadOnEndReached: true,
            unit_info: params,
            netError: false
        }
    }

    async componentDidMount() {
        this._isMounted = true
        this.onProcessEmitter = DeviceEventEmitter.addListener('onSentProcess',async (exam)=>{
            Log('onSentProcess', exam)
            if (this._isMounted){
                this._getPapers(exam.exam_id)
            }
        });
        this._getPapers()
    }
    componentWillUnmount() {
        this._isMounted = false
        this.onProcessEmitter.remove();
    }

    render () {
        // console.log('render:this.state.refreshing', this.state.refreshing)
        const { unit_info, loading, netError} =  this.state
        return (
            <View style={{flex: 1, backgroundColor: "#fff"}}>
                <Header title={unit_info.unit_name} onPress={()=>this.props.navigation.goBack()}/>
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
                    ListEmptyComponent={this._renderListEmpty}
                /> : null}
                <Download
                    onFinish={(exam)=>this._cancelDown(exam)}
                    onError={()=>this._downError()}
                    ref="download"
                />

                <Toast ref="toast" position="center"/>
            </View>
        );
    }
    _renderListFooter(){
        const {listData} = this.state
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
    _renderListEmpty = ()=>{
        return  (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Image source={require('./../assets/homework/meishoudaozuoye.png')} style={{width: 263}}/>
                <View  style={{alignItems: 'center', justifyContent: 'center'}}>
                    <Text>莫急~ 内容正在路上，还有几站地就到 ~</Text>
                </View>
            </View>
        );
    }
    _renderItem (item,index) {
        return (
            <View>
                <TouchableHighlight key={item.exam_id} onPress={()=>this._toPaperStart(item)} underlayColor="#fff">
                    <PaperListItem item={item} showAvgScore={true}/>
                </TouchableHighlight>
            </View>
        );
    }

    async _getPapers (exam_id) {
        if (this.loading){
            return
        }
        const {unit_info} = this.state
        exam_id = exam_id ? exam_id: 0
        try {
            this.loading = true
            this.setState({loading: true})
            let listData = await axios.get(global.API_HOST + '/v2/student/exercise/list',{
                params: {paper_type: 5, page: exam_id ? 1 : this.state.page, pagesize: 30, exam_id: exam_id, unit_id: unit_info.unit_id}
            })
            this.setState({netError: false})
            //console.log(listData.data)

            if (listData.data.retCode === 0) {
                listData = listData.data.retData.list || []
                for (let i in listData){
                    let item = listData[i]
                    let json_file = PAPER_BASE_PATH + item.exam_id + '.json';
                    item.download = await RNFS.exists(json_file);
                    listData[i] = item
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

                this.setState({listData: listData})
                return
            }
            this.refs.toast.show(listData.data.retMsg);
        }catch (e) {
            if (e.message === 'Network Error'){
                this.setState({netError: true})
            } else{
                this.refs.toast.show('网络通讯错误，请检查网络！');
            }
        }finally {
            this.loading = false
            this.setState({loading: false})
        }

    }

    async _toPaperStart(item){
        if (this.loading){
            return
        }
        console.log('_toPaperStart', item)
        // 未下载
        if (!item.download){
            return this.refs.download.startDown(item);
        }
        // 下载了但是未开始成功
        if (!item.exam_attend_id) {
            return this.refs.download.startDown(item);
        }
        this.props.navigation.navigate({routeName: 'SentList', params: item})
    }
    // 下载成功回调
    async _cancelDown(exam){
        console.log('_cancelDown', exam)
        try {
            // 下载的exam未开始
            if (!exam.exam_attend_id){
                this.loading =  true
                let ret = await axios.post(API_HOST + '/v2/student/exercise/attend/start', {exam_id: exam.exam_id})
                if (ret.data.retCode !== 0) {
                    return this.refs.toast.show(ret.retMsg);
                }
            }
        }catch (e) {
            this.refs.toast.show('网络通讯错误，请检查网络！');
        }finally {
            this.loading =  false
        }
        // 更新下单个exam
        this._getPapers(exam.exam_id)
    }

    _downError(){
        this.refs.toast.show('下载文件失败，请检查网络！', 3000);
    }
    _toBack () {
        this.props.navigation.goBack()
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
    }
})