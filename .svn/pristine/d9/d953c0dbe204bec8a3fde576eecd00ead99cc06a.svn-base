import React, { Component } from 'react';
import BaseComponent from './../../libs/BaseComponent'
import Header from './../common/Header'
import {Icon} from 'react-native-elements'

import {
    View,
    Text,
    StyleSheet,
    Image,
    Alert,
    BackHandler,
    DeviceEventEmitter,TouchableOpacity
} from 'react-native';

import Toast, {DURATION} from 'react-native-easy-toast'
import { Button } from 'react-native-elements'
import {Dimensions} from 'react-native'
var {height,width} =  Dimensions.get('window');
import axios from 'axios';
import RNFS from "react-native-fs";
import examAttendStorage from './../../libs/examAttendStorage'
var Progress = require('react-native-progress');

import ReadQuestion from './readQuestion'
import Type1 from './Type1'
import Type3 from './Type3'
import Type5 from './Type5'
import Type9 from './Type9'
import Type16 from './Type16'
import Type37 from './Type37'
import Type38 from './Type38'
import Type26 from './Type26'
import Type12 from './Type12'
import Type40 from './Type40'
import Type41 from './Type41'
import Type1901 from './Type1901'
import ExamResult from "../examResult";
import LottieView from 'lottie-react-native';
import {LoaderScreen, Dialog} from 'react-native-ui-lib'
import Type42 from './Type42';

export default class PaperExam extends BaseComponent {
    constructor(props) {
        super(props);
        const {paperData, exam_status, qs_idx} = this.props.navigation.state.params
        const {exam_attend} = paperData
        this.state = {
            userInfo: {},
            paperData: paperData,
            exam_status: +exam_status, //答题状态 0 显示大题 1正在答题中 2显示评分中
            qs_idx: +qs_idx,
            submitIng: false,
            exam_type: exam_attend.exam_type,
            scoreProcess: 0,//评分进度
            scoreStatus: 0,//评分状态 0 未评分 1评分中 2评分失败 3无法评分
            scoreErrMsg: ''//评分错误信息
        }

        this._stopBack = this._stopBack.bind(this);
    }
    async componentDidMount() {
        let _this = this
        _this._isMounted = true
        console.log('componentDidMount addEventListener hardwareBackPress')
        BackHandler.addEventListener('hardwareBackPress',this._stopBack);//取消返回
        this._navListener = this.props.navigation.addListener('didBlur', async () => {

            console.log('navigation didBlur removeEventListener hardwareBackPress')
            BackHandler.removeEventListener('hardwareBackPress', this._stopBack);
        });
        try {
            let userInfo = await global.storage.load({key: 'userInfo'})
            this.setState({userInfo: userInfo})
        }catch (e) {

        }
        const {paperData, qs_idx} = this.state
        const {exam_attend, paper_info} = paperData

        //初始化练习参与信息
        examAttendStorage.saveExamAttendInfo(exam_attend.exam_attend_id, {
            item_num: paper_info.item_num, //题目数量
            exam_type: exam_attend.exam_type, //练习类型
            qs_idx: qs_idx, //答题大题下标
            qs_num: paper_info.paper_detail.length //大题数量
        })

        this.scoreTask()
    }
    componentWillUnmount() {
        let _this = this
        _this._isMounted = false
        Recorder.skegnStop()
        this._navListener.remove();
        console.log('componentWillUnmount removeEventListener hardwareBackPress')
        BackHandler.removeEventListener('hardwareBackPress', this._stopBack);
        if (+this.state.exam_type === 1) {
            DeviceEventEmitter.emit('FinishReload');
        }

    }
    _stopBack() {
        return true
    }

    render () {
        const  {paperData, qs_idx, exam_status, submitIng} = this.state
        const {exam_attend, paper_info} = paperData
        const question = paper_info.paper_detail[qs_idx]
        if (exam_status === 2){
            return this._renderResult()
        }
        return (
            <View style={{height: '100%', backgroundColor:'#fff'}}>
                <Header
                    title={paperData.exam_attend.exam_title}
                    onPress={()=>this._toBack()}
                    rightWidth={100}
                    rightComponent={exam_status === 1 ?
                        <TouchableOpacity onPress={()=>{
                            DeviceEventEmitter.emit('PauseExam');
                        }} style={{flexDirection: 'row', alignItems:'center', justifyContent:'center'}}>
                            <Icon name='controller-paus'  type='entypo' color='#000'/>
                        </TouchableOpacity> : null
                    }
                />
                {exam_status === 0 ? <ReadQuestion question={question} onRead = {()=>this._onRead()} /> : null}
                {exam_status === 1 ? this._renderQuestion() : null}
            </View>
        )
    }
    _renderResult () {
        const {scoreProcess, scoreStatus} = this.state
        return (
            <View style={{height: '100%', backgroundColor:'#fff'}}>
                <Header
                    title="打分中"
                />

                <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                        <View style={{width: width, height: 215, alignItems: 'center', justifyContent: 'center'}}>
                            <LottieView source={require('./../../assets/paper/score.json')} autoPlay loop style={{}}/>
                        </View>
                        <View style={{marginTop: 40}}>
                            <Text style={{fontSize: 17, color: "#353535", textAlign: 'center'}}>这次，你会得多少分呢？</Text>
                            <Text style={{fontSize: 17, color: "#707070", marginTop: 20, textAlign: 'center'}}>打分中{parseInt(scoreProcess * 100)}%...</Text>
                            <Progress.Bar
                                progress={+scoreProcess}
                                indeterminate={+scoreProcess<=0}
                                height={6}
                                color="#30cc75"
                                borderRadius={3}
                                style={{marginTop: 30, marginBottom: 60}}
                                width={260}
                                unfilledColor="#efefef"
                                borderColor="#efefef"
                                borderWidth={0}
                                animated={true}
                            />
                        </View>
                    </View>
                </View>

                <Dialog
                    width={width - 50}
                    height={324}
                    style={{justifyContent: 'center', backgroundColor: "#fff", borderRadius: 10}}
                    visible={scoreStatus === 2}
                    overlayBackgroundColor='rgba(0,0,0,0.5)'
                    animationConfig={{animation: 'fadeIn', duration: 250}}
                    onDismiss={()=>{}}
                >
                    <View style={{alignItems: 'center', marginTop: 0}}>
                        <Text style={{fontSize: 17, color: "#353535", textAlign: 'center', width: "70%", lineHeight: 24}}>网络状况不佳，系统已将你的答案保存，建议网络环境改善后，重新进行上传</Text>
                        <Image source={require('./../../assets/exam/chongxinshangchuan.png')} style={{width: "80%", marginTop: 10}}/>
                    </View>
                    <View style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 15}}>
                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                            <Button
                                title="立即重传"
                                textStyle={{fontSize: 14, color: "#fff"}}
                                onPress={()=> this.scoreTask()}
                                buttonStyle={{height: 39, width: 113, backgroundColor:"#2fcc75",borderRadius: 6, padding: 0 }}
                                containerViewStyle={{marginLeft: 10, marginRight: 10, marginTop: 10, flex: 1}}
                            />
                        </View>
                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                            <Button
                                title="稍后上传"
                                textStyle={{fontSize: 14, color: "#fff"}}
                                onPress={()=> this._onEnd()}
                                buttonStyle={{height: 39, width: 113, backgroundColor:"#2fcc75",borderRadius: 6, padding: 0 }}
                                containerViewStyle={{marginLeft: 10, marginRight: 10, marginTop: 10, flex: 1}}
                            />
                        </View>
                    </View>
                </Dialog>
                <Dialog
                    width={width - 50}
                    height={324}
                    style={{justifyContent: 'center', backgroundColor: "#fff", borderRadius: 10}}
                    visible={scoreStatus === 3}
                    overlayBackgroundColor={'rgba(215, 215, 215, 0.6)'}
                    animationConfig={{animation: 'fadeIn', duration: 250}}
                    onDismiss={()=>{}}
                >
                    <View style={{alignItems: 'center', marginTop: 30}}>
                        <Text style={{fontSize: 17, color: "#353535", textAlign: 'center', lineHeight: 24}}>抱歉~服务器开小差了 T_T</Text>
                        <Text style={{fontSize: 17, color: "#353535", textAlign: 'center', lineHeight: 24}}>需要重新作答才能进行评分~</Text>
                        <Image source={require('./../../assets/exam/cuowu.png')} style={{width: "80%", marginTop: 10}}/>
                    </View>
                    <View style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 15}}>
                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                            <Button
                                title="重新作答"
                                textStyle={{fontSize: 14, color: "#fff"}}
                                onPress={()=> this._toReStart()}
                                buttonStyle={{height: 39, width: 113, backgroundColor:"#2fcc75",borderRadius: 6, padding: 0 }}
                            />
                        </View>
                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                            <Button
                                title="稍后作答"
                                textStyle={{fontSize: 14, color: "#fff"}}
                                onPress={()=> this._onEnd()}
                                buttonStyle={{height: 39, width: 113, backgroundColor:"#2fcc75",borderRadius: 6, padding: 0 }}
                            />
                        </View>
                    </View>
                </Dialog>
            </View>
        )
    }
    _renderQuestion(){
        const  {paperData, qs_idx} = this.state
        const {paper_info} = paperData
        const question = paper_info.paper_detail[qs_idx]
        switch (question.qs_type) {
            case '5': // 朗读短文
                return (
                    <Type5
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        coreType="para.eval"
                        openType="0"
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
            case '16': // 朗读句子
                return (
                    <Type16
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        coreType="sent.eval"
                        openType="0"
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
            case '17': // 信息获取 听小对话回答问题
                return (
                    <Type5
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        coreType="open.eval"
                        openType="6"
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
            case '18': // 信息获取-听长对话回答问题
                return (
                    <Type9
                        coreType="open.eval"
                        openType="6"
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
            case '21': // 根据情景提示回答问题
                return (
                    <Type5
                        coreType="open.eval"
                        openType="6"
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
            case '24': // 看图片回答问题
                return (
                    <Type5
                        coreType="open.eval"
                        openType="6"
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
            case '1901': // 新增
                return (
                    <Type1901
                        coreType="open.eval"
                        openType="7"
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )    
            case '9': // 情景问答
                return (
                    <Type9
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        coreType="open.eval"
                        openType="6"
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
            case '12': // 话题简述
                return (
                    <Type12
                        coreType="open.eval"
                        openType="7"
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
            case '1': // 听小对话选择
                return (
                    <Type1
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
            case '3': // 听长对话选择
            case '4': // 听短文选择
                return (
                    <Type3
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
            case '37': // 信息转述以及提问回答
                return (
                    <Type37
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
            case '38': // 听句子，选择正确答语
                return (
                    <Type38
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        coreType="choice.rec"
                        openType="0"
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
            case '26': // 听对话回答问题，先听后看题
                return (
                    <Type26
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        coreType="open.eval"
                        openType="6"
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
            case '40': // 读单词
                return (
                    <Type40
                        coreType="word.eval"
                        openType="0"
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
            case '41': // 读句子
                return (
                    <Type41
                        coreType="sent.eval"
                        openType="0"
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
            case '42': // 听小对话选
                return (
                    <Type42
                        question={question}
                        onFinish={()=>this._onFinish()}
                        onScore ={(parmas)=>this._onScore(parmas)}
                        onEnd={()=>this._onEnd()}
                        info_idx={0}
                        qs_idx={qs_idx}
                    />
                )
        }
        return (<View><Text>题型不支持！[{question.qs_type}]</Text></View>)

    }

    _toBack () {
        let _this = this
        Alert.alert('退出答题','确定退出答题？退出后将保存进度，下次可继续答题',[
            {text: '继续答题', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: '结束答题', onPress: () => {
                const {exam_attend} = _this.state.paperData
                //已完成的作业
                if (+_this.state.exam_type === 1 && +exam_attend.status === 201){
                    console.log('exit finish homework')
                    _this.setState({exam_status: 2})
                }else{
                    console.log('goBack')
                    _this.props.navigation.goBack()
                }
            }}
        ],{ cancelable: false })
    }
    _toResult () {
        const  {paperData} = this.state
        //this.props.navigation.navigate('ExamResult', paperData.exam_attend)
        this.props.navigation.replace('ExamResult', paperData.exam_attend)
    }
    _onRead () {
        console.log('_onRead')
        this.setState({exam_status: this.state.exam_status+1})
    }
    _toReStart(){
        const {paperData, exam_type} = this.state
        const {exam_attend} = paperData
        examAttendStorage.removeExamAttendInfo(exam_attend.exam_attend_id)
        examAttendStorage.removeExamAttendAnswer(exam_attend.exam_attend_id)
        DeviceEventEmitter.emit('onProcess', exam_attend.exam_id);
        this.props.navigation.replace({routeName: 'PaperStart', params: {exam_attend : exam_attend, qsIds: [], exam_type: exam_type}})
    }
    async _onScore (parmas) {
        console.log('_onScore', parmas.item_id)
        const {item} = parmas
        const {paperData, qs_idx} = this.state
        const {exam_attend, paper_info} = paperData
        const question = paper_info.paper_detail[qs_idx]
        parmas.qs_id = question.qs_id
        parmas.qs_type = question.qs_type
        parmas.exam_attend = exam_attend
        //保存答题信息
        let item_answer_file = exam_attend.exam_attend_id + '_' + item.item_id + '.json'
        console.log('item_answer_file', item_answer_file)
        RNFS.writeFile(EXAM_BASE_PATH + item_answer_file , JSON.stringify(parmas)).then(()=>{}).catch(e=>{
            LogServer("SAVE_LOCAL_ANSWER_EXCEPTION", e.message)
        })

        //缓存答案索引
        examAttendStorage.saveExamAttendAnswer(exam_attend.exam_attend_id, item.item_id, {
            item_id: item.item_id,
            answer_file: item_answer_file,
            score_status: 0 //评分状态 0未评分 1评分完成
        })

        // 总进度
        let attend_item_num = await examAttendStorage.getExamAttendAnswerNum(exam_attend.exam_attend_id)
        let exam_process = paper_info.item_num > 0 ? attend_item_num / paper_info.item_num : 0
        exam_process = exam_process > exam_attend.exam_process ? exam_process : exam_attend.exam_process

        //缓存答题进度
        examAttendStorage.saveExamAttendInfo(exam_attend.exam_attend_id, {
            exam_process: exam_process
        })

    }
    _onEnd(){
        const {paperData} = this.state
        const {exam_attend} = paperData
        DeviceEventEmitter.emit('onProcess', exam_attend.exam_id);
        this.setState({scoreStatus: 0})
        this.props.navigation.goBack()
    }
    async _onFinish () {
        const  {paperData, qs_idx, exam_status} = this.state
        const {paper_info, exam_attend} = paperData
        if (qs_idx +1 === paper_info.paper_detail.length) {
            this.setState({exam_status: exam_status+1})
            return
        }
        // 下一题 qs_idx +1
        this.setState({exam_status: 0 ,qs_idx: qs_idx +1})
        examAttendStorage.saveExamAttendInfo(exam_attend.exam_attend_id, {
            qs_idx: qs_idx + 1
        })
        console.log('qs_idx', qs_idx + 1)
        //paperData.qs_idx = qs_idx +1
        //this.props.navigation.replace('PaperExam',paperData)
    }

    //评分线程
    async scoreTask(){
        const {exam_attend, paper_info} = this.state.paperData
        this.setState({scoreStatus: 1}) //评分中

        //task 循环
        while (true){
            if (!this._isMounted) return
            try {
                //本次练习所有答案索引
                let items = await examAttendStorage.getExamAttendAllAnswer(exam_attend.exam_attend_id)
                let success_idx = 0;
                //评分循环
                while (success_idx < items.length){
                    let item = items[success_idx]
                    if (+item.score_status === 0){
                        console.log("score item", item)
                        await this.scoreWork(item)
                        console.log("score item", 'ok')
                        if (!this._isMounted) return
                        // 发送更新进度事件
                        DeviceEventEmitter.emit('onProcess', exam_attend.exam_id);
                    }
                    //评分成功继续下一个
                    success_idx++;
                    //评分进度
                    //console.log('123456',items.length,success_idx)
                    this.setState({scoreProcess: success_idx / paper_info.item_num})
                }
                console.log('score end', success_idx, paper_info.item_num, this.state.exam_status)
                // 检查评分状态
                if (this.state.exam_status === 2) {
                    // 评分题目成功数量对比试卷题目数量，完成了即退出task循环
                    if (success_idx >= paper_info.item_num){
                        break;
                    }
                    // 已完成的练习 当前重做的也都评完了
                    if (await examAttendStorage.checkScoreFinish(exam_attend.exam_attend_id) && exam_attend.status === 201){
                        break;
                    }
                }
                //遍历一次队列后等待1秒再重新遍历
                await this.sleep(1000)

            }catch (e) {
                Log("scoreTask",e)
                if (!this._isMounted) return
                //重要异常
                if (e.message === 'Death Error') {
                    if (this.state.exam_status === 1){
                        Alert.alert('答题失败','录音评分失败，请退出后重新答题',[
                            {text: '结束答题', onPress: () => this._onEnd()},
                        ],{ cancelable: false })
                    }
                    //显示重新答题按钮
                    this.setState({scoreStatus: 3, scoreErrMsg: '录音评分失败，请退出后重新答题'})
                    return;
                }
                //网络异常
                if (e.message === 'Network Error') {
                    //评分中状态则结束评分任务，让用户主动发起重试
                    if (this.state.exam_status === 2){
                        this.setState({scoreStatus: 2, scoreErrMsg: '网络开小差了，答案上传失败'})
                        return;
                    }
                }
                //其他在评分中状态异常
                if (this.state.exam_status === 2){
                    //评分页面状态评分队列为空
                    if (e.name === "NotFoundError"){
                        console.log('empty when scoring')
                        break;
                    }
                    this.setState({scoreStatus: 2, scoreErrMsg: e.message})
                    return;
                }

                //答题状态中的评分失败-等待1秒重试
                await this.sleep(1000)
            }
        }
        //全部评分成功
        if (!this._isMounted) return
        //end attend
        try {
            console.log('attend end')
            let saveRet = await axios.post(
                API_HOST + (+exam_attend.exam_type === 1 ? '/v2/student/homework/attend/end' : '/v2/student/exercise/attend/end'),
                {exam_attend_id: exam_attend.exam_attend_id})
            if (!this._isMounted) return
            if (saveRet.data.retCode !== 0) {
                this.setState({scoreStatus: 2, scoreErrMsg: saveRet.data.retMsg})
                return;
            }
            //全部答题完成后清理缓存
            if (await examAttendStorage.checkAnswerFinish(exam_attend.exam_attend_id)) {
                try {
                    await examAttendStorage.removeExamAttendInfo(exam_attend.exam_attend_id)
                    await examAttendStorage.removeExamAttendAnswer(exam_attend.exam_attend_id)
                }catch (e) {
                    LogServer('CLEAR_CACHE_EXCEPTION', e.message)
                }
            }

            // 发送更新进度事件
            DeviceEventEmitter.emit('onProcess', exam_attend.exam_id);
            //to exam result
            this.props.navigation.replace('ExamResult', exam_attend)
        }catch (e) {
            console.log(e)
            this.setState({scoreStatus: 2, scoreErrMsg: '网络开小差了，答案上传失败'})
        }

    }
    scoreWork(item){
        return new Promise(async (resolve, reject) => {
            if (+item.score_status === 1) {
                return resolve()
            }

            try {
                let answer_file = EXAM_BASE_PATH + item.answer_file
                console.log('answer file', answer_file)
                let exists = await RNFS.exists(answer_file)
                if (!exists) {
                    console.log('answer lost', answer_file)
                    return reject(new Error("Death Error"))
                }

                let answer = JSON.parse(await RNFS.readFile(answer_file))
                if (!answer.hasOwnProperty("item")){
                    console.log('answer file error', answer_file)
                    return reject(new Error("Death Error"))
                }
                //口语题要调评分引擎评分 选择题本地评分
                if (answer.item_answer_type === 2){
                    answer.score_params.recordFilePath = EXAM_BASE_PATH + answer.score_params.recordFilePath
                    console.log('wav file', answer.score_params.recordFilePath)
                    let exists = await RNFS.exists(answer.score_params.recordFilePath)
                    //文件丢失属于致命错误
                    if (!exists) {
                        console.log('wav file lost', answer.score_params.recordFilePath)
                        return reject(new Error("Death Error"))
                    }
                    let ret = await Recorder.skegnStart(answer.score_params);
                    answer.user_answer = ret
                    ret = JSON.parse(ret)
                    if (ret.hasOwnProperty('errId')) {
                        LogServer('SCORE_FAILED', ret)
                        //本地错误，仍然可以重新评分，如网络异常、参数错误、调用错误等情况
                        if (+(ret.errId.toString().substr(0, 1)) === 2) {
                            return reject(new Error("Network Error"))
                        }
                        //非本地错误，给0分并记录日志
                        answer.score = 0
                    }
                    answer.score = ret.hasOwnProperty('result') ? ret.result.overall : 0;
                }

                console.log('save item_id', answer.item.item_id)
                let saveRet = await axios.post(API_HOST + (+answer.exam_attend.exam_type === 1 ? '/v2/student/homework/save' : '/v2/student/exercise/save'),{
                    exam_attend_id: answer.exam_attend.exam_attend_id,
                    item_id: answer.item.item_id,
                    item_score: answer.item.item_score,
                    exam_score: answer.score,
                    user_answer: answer.user_answer,
                    item_answer: answer.item_answer,
                    item_answer_type: answer.item_answer_type,
                    qs_id: answer.qs_id,
                    qs_type: answer.qs_type,
                    item_no: answer.item.item_no
                })
                if (saveRet.data.retCode === 0) {
                    //删除评分索引文件和音频文件
                    if (answer.item_answer_type === 2){
                        try {RNFS.unlink(answer.score_params.recordFilePath)}catch (e) {}
                    }
                    try {RNFS.unlink(answer_file)}catch (e) {}
                    // 更新答案索引
                    examAttendStorage.saveExamAttendAnswer(answer.exam_attend.exam_attend_id, item.item_id, {
                        score_status: 1
                    })
                    return resolve()
                }
                //保存失败
                LogServer('SAVE_SCORE_EXCEPTION', saveRet.data.retMsg)
                return reject(new Error(saveRet.data.retMsg))
            }catch (e) {
                console.log(e)
                LogServer('SCORE_EXCEPTION', e.message)
                return reject(e)
            }
        })
    }


    sleep(timeout){
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                resolve()
            }, timeout)
        })
    }
}