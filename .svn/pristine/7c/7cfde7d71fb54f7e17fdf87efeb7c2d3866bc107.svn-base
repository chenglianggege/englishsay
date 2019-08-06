import React, { Component } from 'react';
import BaseComponent from "../../libs/BaseComponent";
import Header from './../common/Header'
import api from  './../../libs/serverApi'
import Toast, {DURATION} from 'react-native-easy-toast'
import {
    Dimensions,
    View,
    TouchableHighlight,
    Text,
    FlatList, DeviceEventEmitter
} from 'react-native'
import axios from "axios/index";
import {LoaderScreen} from 'react-native-ui-lib'
import NoNet from "./../common/NoNet";

const {height, width} = Dimensions.get('window');

export default class SentList extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {paperData: {}, exam: this.props.navigation.state.params, loading: true,item_score:{},netError: false}
    }
    async componentDidMount() {
        this._getPaper()
        this._isMounted = true
        let _this = this
        this.onProcessEmitter = DeviceEventEmitter.addListener('onSentProcess',async (exam)=>{
            Log('onWordProcess', exam)
            if (_this._isMounted){
                let item_score = _this.state.item_score
                if (!item_score.hasOwnProperty(exam.item_id) || item_score[exam.item_id].exam_score < exam.exam_score) {
                    item_score[exam.item_id] = exam
                }
                _this.setState({item_score: item_score})
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false
        this.onProcessEmitter.remove();
    }

    render () {
        const {loading, netError} = this.state
        return (
            <View style={{flex: 1, backgroundColor: "#fff"}}>
                {loading ? <LoaderScreen message="正在加载内容,请稍后..." overlay/> : null}
                {netError ? <NoNet onPress={()=>this._getPaper()} /> : null}
                {!loading && !netError ? this._renderMain() : null}
                <Toast ref="toast" position="center"/>
            </View>
        )
    }
    _renderMain(){
        const {paperData} = this.state
        //console.log(paperData)
        //return
        return (
            <View style={{flex: 1}}>
                <Header title={paperData.exam_attend.exam_title} onPress={()=>this.props.navigation.goBack()}/>
                <FlatList
                    extraData={this.state}
                    ItemSeparatorComponent={()=><View style={{flexDirection: 'row',alignItems: 'center', justifyContent: 'center'}}><View style={{height:1,backgroundColor:'#efefef', borderRadius: 1, width: '95%'}}/></View>}
                    keyExtractor={(item)=>item.info_id}
                    data={paperData.paper_info.paper_detail[0].info}
                    renderItem={({item, index})=> this._renderItem(item, index)}
                    ListFooterComponent={()=>this._renderListFooter()}
                />
            </View>
        )
    }
    _renderItem(info, idx){
        if (info.items.length === 0){
            return null;
        }
        const {item_score} = this.state
        let item = info.items[0]
        return (
            <TouchableHighlight key={info.info_id} onPress={()=>this._toItemStart(info, idx)} underlayColor="#fff">
                <View style={{height: 64}}>
                    <View style={{flexDirection: 'row', paddingTop: 10}}>
                        <Text style={{fontSize: 16, color: "#353535", width: width - 70, marginLeft: 10}} numberOfLines={2}>{item.item_content}</Text>
                        <View style={{width: 60, justifyContent:'center',alignItems:'center'}}>
                            {item_score.hasOwnProperty(item.item_id)
                                ?
                                <Text style={{fontSize: 14, color: "#f44116", textAlign:'center'}}>{(+item_score[item.item_id].exam_score).toFixed(0)}分</Text> :
                                <Text style={{fontSize: 14, color: "#aaaaaa", textAlign:'center'}}>未练习</Text>
                            }
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        )
    }
    _toItemStart(info, idx){
        const {paperData} = this.state
        this.props.navigation.navigate({routeName: 'SentRead', params: {paperData: paperData, info: info, idx: idx}})
    }
    _renderListFooter(){
        return (
            <View style={{marginTop: 10,alignItems: 'center', justifyContent: 'center'}}>
                <View style={{height:1,backgroundColor:'#efefef', borderRadius: 1, width: '95%'}}/>
                <Text style={{marginTop: 10, marginBottom: 10}}>我是有底线的~</Text>
            </View>
        )
    }
    async _getPaper(){
        const {exam} = this.state
        try {
            let ret = await api.getExercisePaper(exam.exam_id)
            this.setState({netError: false})
            if (ret.retCode !== 0) {
                return this.refs.toast.show(ret.retMsg);
            }
            //console.log('ret.retData', ret.retData)
            let exam_attend_result = ret.retData.exam_attend_result
            let item_score = {}
            for (let i in exam_attend_result) {
                item_score[exam_attend_result[i].item_id] = exam_attend_result[i]
            }
            this.setState({paperData: ret.retData, loading: false, item_score:item_score})

        }catch (e) {
            if (e.message === 'Network Error'){
                this.setState({netError: true})
            } else{
                this.refs.toast.show('网络通讯错误，请检查网络！');
            }
        }

    }
}