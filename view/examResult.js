import React, { Component } from 'react';
import BaseComponent from "../libs/BaseComponent";
import Header from './common/Header'
import {LoaderScreen} from 'react-native-ui-lib';
import Toast, {DURATION} from 'react-native-easy-toast'
import { Button, CheckBox } from 'react-native-elements'
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity, DeviceEventEmitter, Alert, Dimensions
} from 'react-native';
import api from  './../libs/serverApi'
import axios from 'axios';
import ExamResultDetail from "./exam/examDetail";
import NoNet from "./common/NoNet";
import examAttendStorage from "../libs/examAttendStorage";
var {height,width} =  Dimensions.get('window');

export default class ExamResult extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {loading: true, paperData: {}, item_score: {}, netError: false, checked: []}
    }
    componentDidMount() {
        this._isMounted = true
        this._paperData()
        this.deEmitter = DeviceEventEmitter.addListener('ResultReload',async ()=>{
            if (this._isMounted){
                this._paperData()
            }
        });
    }
    componentWillUnmount() {
        this._isMounted = false
        this.deEmitter.remove();
    }
    async _paperData () {
        let exam_attend = this.props.navigation.state.params
        let exam_id = '1123'
        let exam_type = 1
        if (exam_attend){
            exam_id = exam_attend.exam_id
            exam_type = parseInt(exam_attend.exam_type)
        }
        this.setState({loading: true, netError: false})
        try {
            let paper = exam_type === 1 ? await api.getHomeworkPaper(exam_id) : await api.getExercisePaper(exam_id);
            if (paper.retCode === 4001) {
                return this.props.navigation.navigate({routeName: 'Login', params: {kickass: true}});
            }
            if (paper.retCode !== 0) {
                this.setState({loading: false})
                return  this.refs.toast.show(paper.retMsg);
            }
            let paperData = paper.retData
            // 如果未完成则返回
            if (+paperData.exam_attend.status !== 201) {
                DeviceEventEmitter.emit('FinishReload');
                this.props.navigation.goBack()
                return
            }
            let checked = []
            paperData.paper_info.paper_detail.map((question, qs_idx) => checked[qs_idx] = true)

            let exam_attend_result = paperData.exam_attend_result
            let item_score = {}

            for (let i in exam_attend_result) {
                let result = exam_attend_result[i]
                if (+result.topic_type === 2){
                    result.score_result = JSON.parse(result.score_result)
                    /*
                    let token_id = result.user_answer.substr(-24)
                    let score_result = await axios.get(SCORE_HOST + '/' + token_id)
                    result.score_result = score_result.data
                    */
                }
                //console.log(result)
                item_score[result.item_id] = result
            }

            //处理评分失败
            let exam_attend_id = paperData.exam_attend.exam_attend_id
            //本地完成进度已完成 评分进度未完成 --> 前往评分页面
            if (!await examAttendStorage.checkScoreFinish(exam_attend_id)){
                return this.props.navigation.replace('PaperExam',{paperData: paperData, exam_status: 2, qs_idx: 0})
            }

            this.setState({paperData: paperData, item_score: item_score, checked: checked, loading: false})
            // console.log(this.state.paperData)
        }catch (e) {
            console.log(e.message)
            if (e.message === 'Network request failed'){
                this.setState({netError: true})
            } else{
                LogServer(e.message, e)
                this.refs.toast.show('网络通讯错误，请检查网络！');
            }
        }finally {
            this.setState({loading: false})
        }
    }
    render () {
        const {loading, paperData, netError, checked} = this.state

        return (
            <View style={{backgroundColor: "#fff", height: '100%'}}>
                <Header title="成绩单" onPress={()=>this.props.navigation.goBack()}/>
                {loading ? <LoaderScreen message="获取答题结果..." overlay/> : null}
                {netError ? <NoNet onPress={()=>this._paperData()} /> : null}
                {paperData.hasOwnProperty('exam_attend') ?
                <ScrollView>
                    <View>
                        <Image source={require('./../assets/examResult/report.png')} style={{height: 178, width: width}} />
                        <Text style={{fontSize: 40 ,color:"#fff" ,fontWeight:'bold',marginTop: 45, position: 'absolute', alignSelf:'center'}}>{(+paperData.exam_attend.score).toFixed(1)}分 </Text>
                        <Text style={{fontSize: 14 ,color:"#fff" ,position: 'absolute',marginTop: 130, marginLeft:10}}>试卷总分：{(+paperData.paper_info.paper_score).toFixed(1)}分 </Text>
                        <View style={{backgroundColor:"#fff" ,position: 'absolute',marginTop: 150, marginLeft:10, width:170, height: 1}}/>
                    </View>
                    <View style={{height:40, flexDirection: 'row', alignItems: 'center',borderBottomWidth: 1, borderBottomColor:"#f2f2f2"}}>
                        <Text style={{fontSize: 15, marginLeft: 10}}>颜色标注：</Text>
                        <Text style={{fontSize: 15, marginLeft: 10}}>满分</Text><View style={{marginLeft: 5,borderRadius: 100, borderWidth: 1, borderColor: "#30cc75", width: 16, height: 16}} />
                        <Text style={{fontSize: 15, marginLeft: 10}}>失分</Text><View style={{marginLeft: 5,borderRadius: 100, borderWidth: 1, borderColor: "#e75947", width: 16, height: 16}} />
                    </View>

                    {this._renderPaper()}

                </ScrollView> : null}
                {paperData.hasOwnProperty('exam_attend') ?
                    <View style={{flexDirection: 'row', height: 64, borderTopColor: "#efefef", borderTopWidth: 1}}>
                        <Button
                            onPress={()=> this._reDoExam()}
                            buttonStyle={{height: 44, backgroundColor:"#2fcc75",borderRadius: 4, padding: 0 }}
                            textStyle={{fontSize: 18, color: "#fff"}}
                            title={"再做一次"}
                            containerViewStyle={{marginLeft: 10, marginRight: 10, marginTop: 10, flex: 1}}
                        />
                    </View>
                : null}
                <Toast ref="toast" position="center"/>
            </View>
        )
    }
    _renderPaper (){
        const {paperData} = this.state
        if (paperData.hasOwnProperty('paper_info')){
            return paperData.paper_info.paper_detail.map((question, qs_idx) => this._renderQuestionItem(question, qs_idx))
        }
    }
    _renderQuestionItem(question, qs_idx){
        return (
            <View style={{marginLeft: 10}} key={question.qs_id}>
                <View style={{height:40, justifyContent: 'center'}}>
                    <Text style={{fontSize: 16, color: "#353535"}}>{question.qs_title}</Text>
                </View>
                <View style={{marginLeft: -10, height: 30, backgroundColor:"#fafcf7"}}/>
                <ScrollView showsHorizontalScrollIndicator horizontal style={{marginTop: -30}}>
                    <View style={{flexDirection: 'row'}}>
                        <View>
                            <View style={{height: 30, justifyContent: 'center'}}><Text style={{fontSize: 16}}>题号</Text></View>
                            <View style={{height: 60, justifyContent: 'center', alignItems: 'center'}}><Text style={{fontSize: 16}}>得分</Text></View>
                        </View>
                        {question.info.map((info, info_idx) => this._renderInfo(info, qs_idx, info_idx))}
                    </View>
                </ScrollView>
                <View style={{marginLeft: -10, height: 15, backgroundColor:"#f8f8f8"}}/>
            </View>
        )
    }
    _renderInfo (info, qs_idx, info_idx){
        return info.items.map((item, item_idx) => this._renderItem(item, info, qs_idx, info_idx, item_idx))
    }
    _renderItem(item, info, qs_idx, info_idx, item_idx){
        const {item_score} = this.state
        return (
            <View style={{marginLeft: 10}} key={item.item_id}>
                <View style={{height: 30, justifyContent: 'center', alignItems: 'center'}}><Text style={{fontSize: 16}}>{item.item_no}</Text></View>
                <TouchableOpacity
                    style={{
                    height: 50 , width: 50, borderRadius: 100, borderWidth: 1.5,
                    borderColor: item_score.hasOwnProperty(item.item_id) && item_score[item.item_id].exam_score - item.item_score === 0 ? "#30cc75" : "#e75947",
                    justifyContent: 'center', alignItems: 'center', marginTop: 5}}
                    onPress={()=>this._toDetail(item_idx, info_idx, qs_idx)}
                >
                    <Text style={{fontSize: 16}}>{item_score.hasOwnProperty(item.item_id) ? (+item_score[item.item_id].exam_score).toFixed(1) : '0.0'}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    _toDetail (item_idx, info_idx, qs_idx) {
        const {paperData, item_score} = this.state
        this.props.navigation.navigate({routeName: 'ExamResultDetail',
            params: {
                item_score: item_score,
                qs_idx: qs_idx,
                item_idx: item_idx,
                info_idx: info_idx,
                paperData: paperData
        }})
    }
    _toBack () {
        this.props.navigation.goBack()
    }
    async _reDoExam () {
        let exam_attend = this.state.paperData.exam_attend
        console.log(exam_attend)
        //作业限制时间
        if (+exam_attend.exam_type === 1 && exam_attend.is_expired){
            Alert.alert('提示','作业已结束，不能再次答题！')
            return
        }
        let qsIds = []
        this.props.navigation.replace('PaperStart',{exam_attend : exam_attend, qsIds: qsIds, exam_type: +exam_attend.exam_type})
    }
}
const styles = StyleSheet.create({
    startBtn: {
        marginLeft: 10, marginRight: 10, marginTop: 10, flex: 1,
        backgroundColor: "#30cc75",
    },
    selectBtn: {
        marginLeft: 10, marginRight: 0, marginTop: 10,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#1fc766",
        height: 44, width: 92
    }
})