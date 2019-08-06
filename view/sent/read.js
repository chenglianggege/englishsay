import React, { Component } from 'react';
import BaseComponent from "../../libs/BaseComponent";
import Header from './../common/Header'
import api from  './../../libs/serverApi'
import Toast, {DURATION} from 'react-native-easy-toast'
import {
    Dimensions,
    View,
    Image,
    Text,
    ScrollView,
    TouchableHighlight, NativeEventEmitter, DeviceEventEmitter, Animated, StyleSheet,
    Modal
} from 'react-native'
import axios from "axios/index";
import {LoaderScreen, Dialog} from 'react-native-ui-lib'
import { Button,Icon } from 'react-native-elements'
import RNFS from "react-native-fs";
import Sound from 'react-native-sound';
import LottieView from 'lottie-react-native';
import Rating from '../../libs/rating/Rating';
import WordDialog from '../common/WordDialog';

var Progress = require('react-native-progress');

const {height, width} = Dimensions.get('window');

export default class SentRead extends BaseComponent {
    constructor(props) {
        super(props);
        let params = this.props.navigation.state.params
        // recordStatus 0:未录音 1：正在录音 2：评分中
        this.state = {
            lastResult: null,
            paperData: params.paperData,
            idx: params.idx,
            currentResult: null,
            bastResult: null ,
            displayResult: null ,
            showTips: false,
            img_source_content: '',
            onPlay: false,
            recordStatus: 0,
            process: 0,
            player: [0,0,0,0],
            modalVisible: true,
            showWordTips: false
        }
        this.isBusy = false
        this.isProcess = false
        this.sound = null
        this.canJumpRecord = true
        this.animation = 0
    }
    async componentDidMount() {
        this._isMounted = true
        const eventEmitter = new NativeEventEmitter(Recorder)
        this.onRecordEndEmitter = eventEmitter.addListener('onScore', (result) =>this._onRecord(result));
        let _this = this
        this._navListener = this.props.navigation.addListener('didFocus', async () => {
            _this.initItem()
        });
        try {
            await global.storage.load({key: 'TIPS-SENT-READ'})
            this.setState({showWordTips: false})
        }catch (e) {
            this.setState({showWordTips: true})
        }
    }
    componentWillUnmount(){
        this._isMounted = false
        this.onRecordEndEmitter.remove();
        this._navListener.remove();
        clearInterval(this.animation)
        this._stopPlay()
        Recorder.skegnStop()
    }
    async initItem(){
        const {paperData, idx} = this.state
        let infos = paperData.paper_info.paper_detail[0].info

        let info = infos[idx]
        let item = info.items[0]
        let img_source_content = item.img_source_content ? PAPER_BASE_PATH + item.img_source_content.substring(item.img_source_content.lastIndexOf("/")+1) : ''
        try {
            let exists = await RNFS.exists(img_source_content)
            if (!exists){
                img_source_content = item.img_source_content ? PAPER_STATIC_HOST + item.img_source_content : ''
            }
            this.setState({img_source_content : img_source_content})
        }catch (e) {
            this.refs.toast.show('网络通讯错误，请检查网络！');
        }
        this._stopPlay()
        await this.setState({lastResult : null, currentResult: null, bastResult: null})
        this._getLastReust()
        this._playContent(item.source_content)
    }
    render () {
        const {paperData, modalVisible} = this.state
        let exam_attend = paperData.exam_attend
        return (
            <View style={{flex: 1}}>

                <Header title={exam_attend.exam_title} onPress={()=>this.props.navigation.goBack()}/>
                {this._renderMain()}
                <Toast ref="toast" position="center"/>
                <WordDialog ref="word" />
            </View>
        )
    }
    _renderMain(){

        const {paperData, idx, lastResult, currentResult, showTips, player, process, recordStatus} = this.state
        let infos = paperData.paper_info.paper_detail[0].info
        let info = infos[idx]
        let item = info.items[0]

        return (
            <View style={{alignItems: 'center', flex: 1, backgroundColor:"#f5f5f5"}}>
                <View style={{width: width - 20, marginTop: 10, backgroundColor: "#fff", flex: 9, borderRadius: 5}}>
                    <View style={{flexDirection: 'row', marginTop: 10}}>
                        <View style={{justifyContent: 'center', marginLeft: 10, flex: 1}}>
                            <Image source={require('./../../assets/word/title_bg.png')} style={{width: 58, height: 19}}/>
                            <Text style={{position: 'absolute', fontSize: 13, color: "#1fc766", width: 50, textAlign: "right"}}>{idx+1}/{infos.length}</Text>
                        </View>
                    </View>

                    <View style={{height: 133}}>
                        {this._renderStar()}
                    </View>


                    <View style={{flex: 1}}>
                        <View style={{flex: 1,justifyContent: 'center', alignItems: 'center'}}>
                            <View style={{flexDirection: 'row',  width: width - 40,justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap'}}>
                                {this._renderColorText(item.item_content)}
                            </View>
                            <TouchableHighlight  onPress={()=> this._playContent(item.source_content)} underlayColor="white">
                                <Image
                                    source={player[0] ? require('./../../assets/common/play_main.gif') : require('./../../assets/common/dancilaba.png')}
                                    style={{height: 16, width: 18, marginTop: 10}}
                                />
                            </TouchableHighlight>
                        </View>



                        <View style={{height: 160, alignItems: 'center'}}>
                            <View style={{height: 65}}>
                                {this._renderScore()}
                            </View>
                            <View style={{height: 95}}>
                                <View style={{alignItems: "center", marginTop: 20}}>
                                    <TouchableHighlight  onPress={()=> this._toRecord(item)} underlayColor="white">
                                        <View style={{alignItems: "center", width: 45, height: 45, justifyContent: 'center'}}>
                                            <Image source={require('./../../assets/common/huatong.png')} style={{width: 22, height: 34}}/>
                                            {recordStatus !== 0 ?
                                                <Progress.Circle
                                                    progress={process}
                                                    indeterminate={false}
                                                    size={45}
                                                    color="#30cc75"
                                                    borderRadius={50}
                                                    style={{position: 'absolute'}}
                                                    unfilledColor="#efefef"
                                                    borderWidth={0}
                                                    animated={false}
                                                    thickness={3}
                                                />
                                                : null
                                            }
                                        </View>
                                    </TouchableHighlight>
                                    <Text style={{fontSize: 12, color: "#aaaaaa", marginTop: 5}}>{recordStatus === 0 ? '点击录音' : (recordStatus === 1 ? '正在录音' : '正在评分')}</Text>
                                </View>
                            </View>
                        </View>

                        {this._renderNum()}

                    </View>

                </View>
                <View style={{width: width ,height: 10, backgroundColor: "#f5f5f5"}}/>
                <View style={{width: width - 20, backgroundColor: "#fff", flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    {
                        recordStatus === 0 ?
                            <View style={{margin: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                <Button
                                    onPress={()=> this._toList()}
                                    buttonStyle={{width: 92/375*width, height: 44, borderWidth: 1, borderColor: "#1fc766", borderRadius: 4,borderStyle: "solid", backgroundColor: "#fff",marginLeft: 9}}
                                    textStyle={{fontSize: 14, color: "#1fc766"}}
                                    title="列表"
                                    containerViewStyle={{marginLeft: 0, marginRight: 0}}
                                />
                                <Button
                                    onPress={()=> this._toNext()}
                                    buttonStyle={{width: 234/375*width, height: 44, borderWidth: 1, borderColor: "#1fc766", borderRadius: 4,borderStyle: "solid", backgroundColor: "#2fcc75",marginLeft: 12}}
                                    textStyle={{fontSize: 14, color: "#fff"}}
                                    title={idx + 1 >= infos.length  ? "完成": "下一题"}
                                    containerViewStyle={{marginLeft: 0, marginRight: 0}}
                                />
                            </View>
                            :
                            <View style={{margin: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: width - 20}}>
                                <Image source={require('./../../assets/common/record.gif')} style={{width: width - 20, height: 64}}/>
                            </View>
                    }

                </View>
                {this._renderTips()}
                <Toast ref="toast" position="center"/>
            </View>
        )

    }

    _renderTips(){
        const {showTips} = this.state
        return (
            <Dialog overlayBackgroundColor='rgba(0,0,0,0.5)' width={width}  height={height} style={{alignItems:"center", justifyContent:"center"}}  visible={showTips} onDismiss={() => this._closeTips()} animationConfig={{animation: "fadeIn"}}>
                <View style={{backgroundColor: "#ffffff", width: 328 ,height: 296, borderRadius: 5, justifyContent:"center"}}>
                    <View style={{height: 77, justifyContent: "center", alignItems: "center", flexDirection: "row"}}>
                        <Image source={require('./../../assets/common/biaoti1.png')} style={{width: 6, height: 10}}/>
                        <Image source={require('./../../assets/common/biaoti.png')} style={{width: 8, height: 13}}/>
                        <Text style={{color: "#353535", fontSize: 16, marginLeft: 14, marginRight: 14}}>提示说明</Text>
                        <Image source={require('./../../assets/common/biaoti.png')} style={{width: 8, height: 13}}/>
                        <Image source={require('./../../assets/common/biaoti1.png')} style={{width: 6, height: 10}}/>

                    </View>
                    <View style={{alignItems: "center", flexDirection: "row", marginLeft:30}}>
                        <View style={{width: 6, height: 6 ,borderRadius: 6, backgroundColor: "#2fcc75", marginRight: 10}}/>
                        <Text style={{color: "#353535", fontSize: 16}}>不同颜色代表不同的发音评测结果</Text>
                    </View>
                    <View style={{justifyContent: "center", alignItems: "center", flexDirection: "row", marginTop: 15}}>
                        <Text style={{color: "#41b612", fontSize: 14, marginRight: 40}}>绿色：优</Text>
                        <Text style={{color: "#1394fa", fontSize: 14}}>蓝色：良</Text>
                    </View>
                    <View style={{justifyContent: "center", alignItems: "center", flexDirection: "row", marginTop: 15}}>
                        <Text style={{color: "#ff8414", fontSize: 14, marginRight: 40}}>橙色：中</Text>
                        <Text style={{color: "#f44116", fontSize: 14}}>红色：差</Text>
                    </View>
                    <View style={{alignItems: "center", flexDirection: "row", marginTop: 20, marginLeft:30}}>
                        <View style={{width: 6, height: 6 ,borderRadius: 6, backgroundColor: "#2fcc75", marginRight: 10}}/>
                        <Text style={{color: "#353535", fontSize: 16}}>点击单词可以查看释义</Text>
                    </View>
                    <View style={{alignItems: "center", justifyContent:"center", marginTop: 20}}>
                        <Button
                            onPress={()=> this._closeTips()}
                            buttonStyle={{width: 234, height: 49, borderRadius: 4, backgroundColor: "#2fcc75"}}
                            textStyle={{fontSize: 17, color: "#fff"}}
                            title="我知道了"
                            containerViewStyle={{marginLeft: 0, marginRight: 0}}
                        />
                    </View>
                </View>
            </Dialog>

        )
    }

    _closeTips(){
        global.storage.save({key: 'TIPS-SENT-READ', data: 1})
        this.setState({showTips: false, showWordTips: false})
    }

    _renderWordTips(){
        const {showWordTips} = this.state
        if (!showWordTips){
            return <View style={{flex: 1}} />
        }
        return (
            <View style={{flex: 1, alignItems: "center"}} >
                <View style={{width: 240, height: 40, flexDirection: 'row',alignItems:"center", backgroundColor: "#1fc766", borderRadius: 5, }}>
                    <Text style={{flex: 1, textAlign: "center", color:"#ffffff", fontSize: 14}}>点击单词可以查看单词释义哦～</Text>
                    <Icon name='close' color={"#ffffff"} size={17} containerStyle={{marginTop: -15, marginRight: 10}} onPress={() => this._closeTips()} />
                </View>
                <View style={{
                    width: 0,
                    height: 0,
                    borderTopWidth: 10,
                    borderTopColor: '#1fc766',
                    borderRightWidth: 10,
                    borderRightColor: 'transparent',
                    borderLeftWidth: 10,
                    borderLeftColor: 'transparent',
                    borderBottomWidth: 5,
                    borderBottomColor: 'transparent',
                }} />
            </View>
        )
    }

    _renderScore(){
        const {lastResult, currentResult, bastResult, player} = this.state
        if (!bastResult || !lastResult){
            return null
        }
        return (
            <View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{height:1,backgroundColor:'#efefef', borderRadius: 1, width: (width - 60) / 2 - 34}}/>
                    <View style={{width: 68, alignItems: 'center'}}>
                        <Text style={{fontSize: 12, color: "#aaa",textAlign: 'center'}}>历史成绩</Text>
                    </View>
                    <View style={{height:1,backgroundColor:'#efefef', borderRadius: 1, width: (width - 60) / 2 - 34}}/>
                </View>

                <View style={{marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: "center"}}>
                        <View style={{flex: 1, alignItems: 'center'}}>
                            <TouchableHighlight  onPress={()=> this._playBack(bastResult, 1)} underlayColor="white">
                            <View>
                                <View style={{flexDirection: 'row', alignItems: 'center', width: 55}}>
                                    <Text style={{fontSize: 16, color: "#858585", width: 35}}>{parseInt(bastResult.exam_score)}</Text>
                                    <Image source={player[1] ? require('./../../assets/common/play_main.gif') : require('./../../assets/common/defenlaba.png')} style={{width: 12, height: 11}}/>
                                </View>
                                <Text style={{fontSize: 12, color: "#858585", marginTop: 5}}>最高得分</Text>
                            </View>
                            </TouchableHighlight>
                        </View>
                        <View style={{flex: 1, alignItems: 'center'}}>
                            <TouchableHighlight  onPress={()=> this._playBack(lastResult, 2)} underlayColor="white">
                                <View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', width: 55}}>
                                        <Text style={{fontSize: 16, color: "#858585", width: 35}}>{lastResult.hasOwnProperty('result') ? parseInt(lastResult.result.overall) : parseInt(lastResult.exam_score)}</Text>
                                        <Image source={player[2] ? require('./../../assets/common/play_main.gif') : require('./../../assets/common/defenlaba.png')} style={{width: 12, height: 11}}/>
                                    </View>
                                    <Text style={{fontSize: 12, color: "#858585", marginTop: 5}}>上次得分</Text>
                                </View>
                            </TouchableHighlight>
                        </View>

                    {currentResult ?
                            <View style={{flex: 1, alignItems: 'center'}}>
                                <TouchableHighlight onPress={() => this._playBack(currentResult, 3)} underlayColor="white">
                                    <View>
                                        <View style={{flexDirection: 'row', alignItems: 'center', width: 55}}>
                                            <Text style={{
                                                fontSize: 16,
                                                color: "#858585",
                                                width: 35
                                            }}>{currentResult.hasOwnProperty('result') ? parseInt(currentResult.result.overall) : parseInt(currentResult.exam_score)}</Text>
                                            <Image
                                                source={player[3] ? require('./../../assets/common/play_main.gif') : require('./../../assets/common/defenlaba.png')}
                                                style={{width: 12, height: 11}}/>
                                        </View>
                                        <Text style={{fontSize: 12, color: "#858585", marginTop: 5}}>本次得分</Text>
                                    </View>
                                </TouchableHighlight>
                            </View>

                    :null}
                </View>
            </View>
        )
    }
    _renderNum(){
        let displayResult = this.state.displayResult
        if (!displayResult){
            return null
        }
        displayResult = displayResult.hasOwnProperty('result') ? displayResult : JSON.parse(displayResult.score_result)
        let score = String(parseInt(+displayResult.result.overall)).split('')
        //分数
        let scoreImgs = [
            require('./../../assets/number/0.png'),
            require('./../../assets/number/1.png'),
            require('./../../assets/number/2.png'),
            require('./../../assets/number/3.png'),
            require('./../../assets/number/4.png'),
            require('./../../assets/number/5.png'),
            require('./../../assets/number/6.png'),
            require('./../../assets/number/7.png'),
            require('./../../assets/number/8.png'),
            require('./../../assets/number/9.png'),

        ]
        return (
            <View style={{position: 'absolute' , marginTop: 150, marginLeft: width - 110}}>
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                    {score.map((item, idx)=>{return (<Image key={idx} source={scoreImgs[+item]} style={{width: 28, height: 42}}/>)})}
                </View>
                <Image source={require('./../../assets/number/heng.png')} style={{width: 66, height: 11, marginTop: 5}}/>
            </View>
        )
    }
    _renderColorText(item_content){
        let currentResult = this.state.displayResult
        if (!currentResult){
            let words = item_content.split(' ')
            return (words.map((word, idx)=>{return (<Text key={idx} style={{fontSize: 21, color: "#353535", textAlign: 'center'}}>{word} </Text>)}))
        }
        currentResult = currentResult.hasOwnProperty('result') ? currentResult : JSON.parse(currentResult.score_result)

        if (!currentResult.result.hasOwnProperty('words')) {
            return null;
        }

        let words = currentResult.result.words
        console.log('22588as555',words)
        return (
            words.map((word, idx)=>{
                let overall = parseInt(word.scores.overall)
                if (overall < 30) {
                    return ( <Text key={idx} onPress={()=>this._showWord(word.word, overall)} style={{fontSize: 21, color: "#f44116", textAlign: 'center'}}>{word.word} </Text>)
                }
                if (overall >= 30 && overall < 60) {
                    return ( <Text key={idx} onPress={()=>this._showWord(word.word, overall)} style={{fontSize: 21, color: "#ff8414", textAlign: 'center'}}>{word.word} </Text>)
                }
                if (overall >= 60 && overall < 75) {
                    return ( <Text key={idx} onPress={()=>this._showWord(word.word, overall)} style={{fontSize: 21, color: "#1394fa", textAlign: 'center'}}>{word.word} </Text>)
                }
                return ( <Text key={idx} onPress={()=>this._showWord(word.word, overall)} style={{fontSize: 21, color: "#41b612", textAlign: 'center'}}>{word.word} </Text>)
            })
        )


    }
    _renderStar(){
        const {showTips} = this.state
        let displayResult = this.state.displayResult
        if (!displayResult){
            return null
        }
        displayResult = displayResult.hasOwnProperty('result') ? displayResult : JSON.parse(displayResult.score_result)
        return (
            <View style={{alignItems: 'center', justifyContent: 'center', marginTop: 20}}>
                <View style={{flexDirection: 'row', width: width - 20}}>
                    <View style={{flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={styles.titleText}>流利度： </Text>
                        <Rating
                            type="star"
                            fractions={1}
                            startingValue={(+displayResult.result.fluency/100*5)}
                            readonly
                            imageSize={15}
                            style={{ marginTop: 13}}
                        />
                    </View>
                    <View style={{flexDirection: 'row',flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={styles.titleText}>准确度： </Text>
                        <Rating
                            type="star"
                            fractions={1}
                            startingValue={(+displayResult.result.pronunciation/100*5)}
                            readonly
                            imageSize={15}
                            style={{ marginTop: 13 }}
                        />
                    </View>
                </View>

                <View style={{flexDirection: 'row', width: width - 20}}>
                    <View style={{flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={styles.titleText}>完整度： </Text>
                        <Rating
                            type="star"
                            fractions={1}
                            startingValue={(+displayResult.result.integrity/100*5)}
                            readonly
                            imageSize={15}
                            style={{ marginTop: 13 }}
                        />
                    </View>
                    <View style={{flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={styles.titleText}>语    速： </Text>
                        <Text style={styles.titleText}>{displayResult.result.speed}词/分钟</Text>
                    </View>
                </View>


                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
                    <View style={{height:1,backgroundColor:'#efefef', borderRadius: 1, width: width - 70}}/>
                </View>

                <View style={{flexDirection: 'row', marginTop: 15}}>
                    {this._renderWordTips()}
                    <View style={{width: 22, marginRight: 25}}>
                        <TouchableHighlight  onPress={()=> this.setState({showTips: !showTips})} underlayColor="white">
                            <Image  source={require('./../../assets/common/Oval.png')} style={{width: 22, height: 22}}/>
                        </TouchableHighlight>
                    </View>
                </View>
            </View>
        )
    }


    async _toNext(){
        if (this.state.recordStatus !== 0){
            return
        }
        const {paperData, idx} = this.state
        const {paper_info} = paperData
        let infos = paper_info.paper_detail[0].info
        if (idx >= infos.length - 1){
            this._toList()
        }else{
            await this.setState({idx: idx + 1})
            this.initItem()
        }

    }
    _toList(){
        this.props.navigation.goBack()
    }
    async _getLastReust(){
        const {paperData, idx, currentResult, lastResult} = this.state
        const {exam_attend, paper_info} = paperData
        let infos = paper_info.paper_detail[0].info
        let info = infos[idx]
        let item = info.items[0]
        try {
            let ret = await axios.get(global.API_HOST + '/v2/student/exercise/item-history',{
                params: {
                    exam_attend_id: exam_attend.exam_attend_id,
                    item_id: item.item_id,
                }
            })
            console.log(12345,ret)
            if (ret.data.retCode === 0){
                let last = ret.data.retData.last
                let best = ret.data.retData.best
                /*
                if (last && last.hasOwnProperty('user_answer')) {
                    last.score_result = await axios.get(SCORE_HOST + '/' + last.user_answer.substr(-24))
                    best.score_result = await axios.get(SCORE_HOST + '/' + best.user_answer.substr(-24))
                }
                */
                this.setState({
                    lastResult: lastResult ? lastResult : last,
                    bastResult: best,
                    //currentResult: currentResult ? currentResult : ret.data.retData.last,
                    displayResult: currentResult ? currentResult : last
                })
            }
        }catch (e) {
            this.refs.toast.show('网络通讯错误，请检查网络！');
        }

    }
    _playBack(result, p_idx){
        if (this.state.recordStatus !== 0){
            return
        }
        let player = [0, 0, 0, 0]
        player[p_idx] = 1
        this.setState({displayResult : result, player: player})
        let audioUrl = 'https://' + (result.hasOwnProperty('result') ? result.audioUrl : result.user_answer) + '.mp3'
        this.play(audioUrl, false)
    }
    _playContent(audioUrl){
        if (this.state.recordStatus !== 0){
            return
        }
        this.setState({player: [1, 0, 0, 0]})
        this.play(audioUrl, true)
    }
    _stopPlay(){
        if (this.sound){
            this.sound.release()
            this.setState({player: [0, 0, 0, 0]})
        }
    }
    _toRecord(item){
        if (this.isBusy){
            return
        }
        if (!this.canJumpRecord){
            return
        }
        this._stopPlay()
        // 正在录音中-》停止录音
        if (this.state.recordStatus === 1){
            this.isBusy = true
            this.isProcess = false
        }
        if (this.state.recordStatus === 0){
            this.record({
                duration: item.item_answer_second,
                request: {
                    coreType: 'sent.eval',
                    refText: item.answers[0].answer_content,
                    attachAudioUrl: 1,
                    scale: 100,
                    precision: 1,
                    qType: 0
                },
                userId: 'test'
            })
        }
    }
    async _onRecord(ret){
        if (!this._isMounted){
            return
        }

        this.isBusy = false
        let score = JSON.parse(ret)
        Log("recorder.onScore", score)
        const {lastResult, currentResult} =  this.state
        this.setState({recordStatus: 0, currentResult: score, lastResult: currentResult ? currentResult : lastResult})
        if (!score.hasOwnProperty('result')) {
            LogServer('RECORD_SCORE_ERROR', score)
        }
        const {paperData, idx} = this.state
        const {exam_attend, paper_info} = paperData
        let question = paper_info.paper_detail[0]
        let infos = question.info
        let info = infos[idx]
        let item = info.items[0]

        let saveRet = await axios.post(API_HOST + '/v2/student/exercise/save',{
            exam_attend_id: exam_attend.exam_attend_id,
            item_id: item.item_id,
            item_score: 100,
            exam_score: score.result.overall,
            user_answer: JSON.stringify(score),
            item_answer: item.answers[0].answer_content,
            item_answer_type: 2,
            qs_id: question.qs_id,
            qs_type: question.qs_type,
            item_no: item.item_no,
            score_type: 2
        })
        if (saveRet.data.retCode === 0) {
            // 更新列表页的进度和得分
            DeviceEventEmitter.emit('onSentProcess', {exam_id: exam_attend.exam_id, exam_score: score.result.overall, item_id: item.item_id});
        }
        this._getLastReust()
    }
    play(audioUrl, isLocal) {

        if (this.sound){
            this.sound.release()
        }
        let _this = this
        return new Promise(async (resolve, reject) => {
            _this.setState({onPlay: true})
            Sound.setCategory('Playback');
            let file_path = ''
            if (isLocal){
                let file_name = audioUrl.substring(audioUrl.lastIndexOf("/")+1);
                file_path = PAPER_BASE_PATH + file_name
                let exists = await RNFS.exists(file_path)
                if (!exists){
                    file_path = PAPER_STATIC_HOST + audioUrl
                }else{
                    let file_stat = await RNFS.stat(file_path)
                    if (!file_stat['size']) {
                        file_path = PAPER_STATIC_HOST + audioUrl
                    }
                }

            } else{
                file_path = audioUrl
            }

            console.log('file_path', file_path, isLocal)
            let sound = new Sound(file_path, '', async (error) => {
                if (error) {
                    console.log('failed to load the sound', error);
                    resolve()
                    return;
                }
                if (_this._isMounted){
                    sound.play((success) => {
                        console.log('audioUrl',audioUrl, success)
                        _this.setState({onPlay: false, player: [0, 0, 0, 0]})
                        sound.release()
                        resolve();
                    });
                }
            });
            _this.sound = sound

        })
    }
    record (recordOpt) {
        console.log('recordOpt', recordOpt)
        let _this = this
        if (this.sound){
            this.sound.release()
        }
        return new Promise((resolve, reject) => {
            // 限制连续点击
            _this.canJumpRecord = false
            Sound.setCategory('PlayAndRecord');
            Recorder.skegnStart(recordOpt.request).then(()=>{
                //500毫秒后可停止
                setTimeout(function () {
                    _this.canJumpRecord = true
                },500)
                // 走进度条
                _this.setState({process: 0, recordStatus: 1})
                _this.process(recordOpt.duration,function (seconds) {
                    if (!_this._isMounted){
                        return
                    }
                    if (seconds === false) {
                        Recorder.skegnStop()
                        _this.setState({recordStatus: 2, process: 0})
                        return
                    }
                })
                resolve()
            }).catch(e=>{
                _this.canJumpRecord = true
                Recorder.skegnStop()
                LogServer('RECORD_START_ERROR', ret)
                reject();
            });
        })
    }
    async process (processSeconds, cb) {
        let _this = this
        _this.isProcess = true
        let now = 0
        let animation = setInterval(function () {
            if (_this._isMounted) {
                if (now > processSeconds) {
                    _this.isProcess = false
                }
                now = now + 0.1
                _this.setState({process: now / processSeconds})
                if (_this.isProcess) {
                    cb(now)
                }else{
                    cb(false)
                    clearInterval(animation)
                    console.log('clearInterval',animation)
                }
            }
        },100)
        this.animation = animation
        console.log('setInterval', this.animation)
    }

    _showWord(word, score){
        this._stopPlay()
        this.refs.word.show(word, score)
    }
}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 16, marginTop: 10
    }
})