import React, { Component } from 'react';
import BaseComponent from './../../libs/BaseComponent'
import Header from './../common/Header'
import {LoaderScreen} from 'react-native-ui-lib'

import {
    View,
    Text,
    StyleSheet,
    Image, DeviceEventEmitter, Alert, PermissionsAndroid, NetInfo, Platform, TouchableOpacity, BackHandler, Linking, ScrollView
} from 'react-native';
import api from  './../../libs/serverApi'
import Toast, {DURATION} from 'react-native-easy-toast'
import { Button } from 'react-native-elements'
import {Dimensions} from 'react-native'
import axios from "axios/index";
var {height,width} =  Dimensions.get('window');
import RNFS from 'react-native-fs';
import NoNet from "./../common/NoNet";
import examAttendStorage from "../../libs/examAttendStorage";

export default class PaperStart extends BaseComponent {
    constructor(props) {
        super(props);
        //exam_type 1： 作业 2：模拟专项练习
        //qsIds 答题题目IDs
        const {qsIds, exam_attend, exam_type} = this.props.navigation.state.params
        this.state = {
            userInfo: {},
            paperData: {},
            loading:true,
            exam: exam_attend,
            qsIds: qsIds,
            exam_type: +exam_type,
            netError: false
        }
    }
    async componentDidMount() {
        
        this._paperData()
        let _this = this
        //check and notice network status
        NetInfo.getConnectionInfo().then((connectionInfo) => {
            if (connectionInfo.type === 'none'){
                _this.refs.toast.show('当前网络不可用，请检查你的网络设置');
            }
            if (connectionInfo.type === 'cellular'){
                _this.refs.toast.show('您正在使用4G网络，建议切换至wifi后再进行答题');
            }
            console.log('Initial, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);
        }).catch((e)=>console.log('NetInfo.getConnectionInfo', e));


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
                }
            }
        }

    }
    componentWillUnmount() {
        DeviceEventEmitter.emit('ResultReload');
    }
    async _paperData () {

        const {exam ,exam_type, qsIds} = this.state
        let exam_attend_id = +exam.exam_attend_id //参与练习or作业ID
        console.log('exam', exam)
        try {
            this.setState({netError: false, loading: true})
            // 练习套题 如果已完成或者从未开始，则重新start一下参与新的一次练习
            if (exam_type === 2 && (!exam_attend_id || +exam.status === 201)) {
                console.log('start exercise', exam.exam_id)
                await axios.post(API_HOST + '/v2/student/exercise/attend/start', {exam_id: exam.exam_id})
                // 更新重置列表页的进度和得分
                DeviceEventEmitter.emit('onProcess', exam.exam_id);
            }
            let paper = exam_type === 1 ? await api.getHomeworkPaper(exam.exam_id, qsIds) : await api.getExercisePaper(exam.exam_id);
            console.log(11111111122222,paper)
            if (paper.retCode === 4001) {
                return this.props.navigation.navigate({routeName: 'Login', params: {kickass: true}});
            }
            if (paper.retCode !== 0) {
                this.setState({loading: false})
                return this.refs.toast.show(paper.retMsg);
            }
            let paperData = paper.retData
            //console.log('paperData', paperData)
            await this.setState({paperData: paperData})
            //处理评分失败
            if (+paperData.exam_attend.status === 200){
                let exam_attend_id = paperData.exam_attend.exam_attend_id
                //本地完成进度已完成 题目状态未完成 --> 前往评分页面
                if (await examAttendStorage.checkAnswerFinish(exam_attend_id)){
                    return this.props.navigation.replace('PaperExam',{paperData: paperData, exam_status: 2, qs_idx: 0})
                }
            }
            this.setState({loading: false})
        }catch (e) {
            this.setState({loading: false})
            if (e.message === 'Network request failed'){
                this.setState({netError: true})
            } else{
                LogServer(e.message, e)
                this.refs.toast.show('网络通讯错误，请检查网络！');
            }
            this.refs.toast.show('网络通讯错误，请检查网络！');
        }finally {

        }
    }

    render () {
        const {paperData, loading, netError} = this.state
        return (
            <View style={{height: '100%', backgroundColor:"#f5f5f5"}}>
                <Header title="准备答题" onPress={()=>this.props.navigation.goBack()}/>

                {netError ? <NoNet onPress={()=>this._paperData()} /> : null }

                {loading ? <LoaderScreen message="正在加载内容,请稍后..." overlay/> : null}
                {paperData.hasOwnProperty('paper_info') ?
                <View style={{flex: 1, backgroundColor:"#fff", width: width - 20, marginLeft: 10, marginTop: 10, marginBottom: 10, borderRadius: 4}}>
                    <Text style={{textAlign: 'center', marginTop: 37, fontSize: 20, color: "#585757", alignSelf:'center'}} numberOfLines={2}>{paperData.hasOwnProperty('exam_attend') ? paperData.exam_attend.exam_title : ''}</Text>
                    <View style={[styles.infoRow,{marginTop: 76}]}>
                        <View style={{flex: 1, flexDirection: 'row', marginLeft: 27, alignItems: 'center'}}>
                            <View style={styles.pointIcon} />
                            <Text style={[styles.infoText, {marginLeft: 15}]}>题目数量</Text>
                        </View>
                        <View style={{flex: 1, marginRight: 40}}>
                            <Text style={[{textAlign: 'right'}, styles.infoText]}>{paperData.hasOwnProperty('paper_info') ? paperData.paper_info.question_num : '0'}题</Text>
                        </View>
                    </View>
                    <View style={styles.underLine} />

                    <View style={[styles.infoRow]}>
                        <View style={{flex: 1, flexDirection: 'row', marginLeft: 27, alignItems: 'center'}}>
                            <View style={styles.pointIcon} />
                            <Text style={[styles.infoText, {marginLeft: 15}]}>总分</Text>
                        </View>
                        <View style={{flex: 1, marginRight: 40}}>
                            <Text style={[{textAlign: 'right'}, styles.infoText]}>{paperData.hasOwnProperty('paper_info') ? (+paperData.paper_info.paper_score).toFixed(1) : '0.0'}分</Text>
                        </View>
                    </View>

                    {+paperData.exam_attend.exam_type === 1 && paperData.exam_attend.exam_time > 0 ?
                    <View style={styles.underLine} />:null}
                    {+paperData.exam_attend.exam_type === 1 && paperData.exam_attend.exam_time > 0 ?
                    <View style={[styles.infoRow]}>
                        <View style={{flex: 1, flexDirection: 'row', marginLeft: 27, alignItems: 'center'}}>
                            <View style={styles.pointIcon} />
                            <Text style={[styles.infoText, {marginLeft: 15}]}>预计时间</Text>
                        </View>
                        <View style={{flex: 1, marginRight: 40}}>
                            <Text style={[{textAlign: 'right'}, styles.infoText]}>{Math.ceil(+paperData.exam_attend.exam_time / 60000)}分钟</Text>
                        </View>
                    </View>
                        :null}

                    <ScrollView style={{flex: 1, marginLeft: 20, marginTop: 10, marginRight: 10, marginBottom: 10, backgroundColor: "#fafafa", borderRadius: 4, paddingLeft: 10, paddingBottom: 25, paddingRight: 10}}>
                        {paperData.paper_info.paper_detail.map((item, idx) => {
                            return (
                                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}} key={idx}>
                                    <View style={{ width: 5, height: 5, backgroundColor: "#d7d7d7", borderRadius: 5}} />
                                    <Text style={{color: "#858585", fontSize: 14, marginLeft: 10}}>{item.qs_title}</Text>
                                </View>
                            )
                        })}
                    </ScrollView>
                </View> : null }

                {paperData.hasOwnProperty('paper_info') ?
                <View style={{width:width, height:64, backgroundColor: "#fff", flexDirection: 'row'}}>
                    {+paperData.exam_attend.exam_type === 1 ?
                        <View style={{alignItems: 'center', justifyContent: 'center', width: 130}}>
                            <View style={{flexDirection: 'row'}}>
                                <Image source={require('./../../assets/paper/shengyushijian.png')} style={{width:14, height: 14}}/>
                                <Text style={{fontSize: 14, color: "#aaaaaa", marginLeft: 3}}>剩余时间</Text>
                            </View>
                            <View style={{marginTop: 5}}>
                                <Text style={{fontSize: 16, color: "#353535"}}>{countDate(paperData.exam_attend.finish_time)}</Text>
                            </View>
                        </View> : null }

                    <Button
                        title="开始答题"
                        textStyle={{fontSize: 14, color: "#fff"}}
                        onPress={()=> this._toExam()}
                        buttonStyle={{height: 44, backgroundColor:"#2fcc75",borderRadius: 4, padding: 0 }}
                        containerViewStyle={{marginLeft: 10, marginRight: 10, marginTop: 10, flex: 1}}
                    />
                </View> : null }

                <Toast ref="toast" position="center"/>
            </View>
        );
    }
    async _toExam () {
        let paperData = this.state.paperData
        paperData.qs_idx = 0
        const {exam ,exam_type, qsIds} = this.state
        LogServer('START_EXAM', {exam_id: exam.exam_id})
        try {
            let exam_attend = paperData.exam_attend
            //已完成的重新开始
            if (+exam_attend.status === 201) {
                //模拟练习直接重新开始 作业可以重复做题
                if (exam_type === 2) {
                    try {
                        examAttendStorage.removeExamAttendInfo(exam_attend.exam_attend_id)
                        examAttendStorage.removeExamAttendAnswer(exam_attend.exam_attend_id)
                    }catch (e) {}
                    return this.props.navigation.replace('PaperExam',{paperData: paperData, exam_status: 0, qs_idx: 0})
                }
            }

            //未完成的继续答题
            let attend_info = await examAttendStorage.getExamAttendInfo(exam_attend.exam_attend_id)
            console.log('local_attend_info', exam_attend.exam_attend_id, attend_info)

            //attend_info.qs_idx 是上次未做完的一题
            let qs_idx = attend_info.hasOwnProperty('qs_idx') ? attend_info.qs_idx : 0
            qs_idx = qs_idx >= paperData.paper_info.question_num ? 0 :  qs_idx

            // 模拟练习不确认直接继续答题
            if (exam_type === 2 || qs_idx === 0){
                return this.props.navigation.replace('PaperExam',{paperData: paperData, exam_status: 0, qs_idx: qs_idx})
            }

            //作业要用户确认一下是继续还是重新答题
            Alert.alert('开始答题','当前练习还未完成，是否继续完成？',[
                {text: '重新开始', onPress: () => {
                        //重新开始
                        examAttendStorage.removeExamAttendInfo(exam_attend.exam_attend_id)
                        examAttendStorage.removeExamAttendAnswer(exam_attend.exam_attend_id)
                        this.props.navigation.replace('PaperExam',{paperData: paperData, exam_status: 0, qs_idx: 0})
                    }},
                {text: '继续答题', onPress: () => {
                        this.props.navigation.replace('PaperExam',{paperData: paperData, exam_status: 0, qs_idx: qs_idx})
                    }},
            ],{ cancelable: false })

        }catch (e) {
            this.props.navigation.replace('PaperExam',{paperData: paperData, exam_status: 0, qs_idx: 0})
        }
    }
    _toBack () {
        this.props.navigation.goBack()
    }
}

const styles = StyleSheet.create({
    startBtn: {
        height: 50,
        width: '100%',
        backgroundColor: "#30cc75",
    },
    infoRow: {
        marginTop: 21,
        flexDirection: 'row',
        width: '100%',
    },
    infoText: {
        fontSize: 16
    },
    pointIcon: {
        width: 8,
        height: 8,
        backgroundColor: "#30cc75",
        borderRadius: 100
    },
    underLine: {
        width: '90%',
        marginTop: 6,
        height: 1,
        borderWidth: 0,
        backgroundColor: "#f3f0f0",
        alignSelf:'center'
    }
})