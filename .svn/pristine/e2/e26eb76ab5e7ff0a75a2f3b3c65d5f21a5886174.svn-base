import React, { Component } from 'react';
import BaseComponent from "./../../libs/BaseComponent";
import Header from './../common/Header'
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity, Dimensions
} from 'react-native';

import Type1 from './Type1'
import Type5 from './Type5'
import Type9 from './Type9'
import Type16 from './Type16'
import Type38 from './Type38'
import Type40 from './Type40'
import Type1901 from './Type1901'
import Sound from 'react-native-sound';
import { Button } from 'react-native-elements'
const {height, width} = Dimensions.get('window');

export default class ExamResultDetail extends BaseComponent {
    constructor(props) {
        super(props);
        const {item_idx, item_score, info_idx, qs_idx, paperData} = this.props.navigation.state.params
        this.state = {playing: false, item_idx: +item_idx, item_score: item_score, info_idx: +info_idx, qs_idx: +qs_idx, paperData: paperData}
        this.isBusy = false
    }
    componentWillUnmount(){
        
        if (this.sound){
            this.sound.release()
        }
    }
    render () {
        const {item_idx, info_idx, qs_idx, paperData, item_score} = this.state
        console.log('render', item_idx, info_idx, qs_idx)
        let question = paperData.paper_info.paper_detail[qs_idx]
        let paper_title = paperData.exam_attend.exam_title
        let info =  question.info[info_idx]
        /*
        if (!info.items.length){
            this.setState({info_idx: info_idx + 1})
            return null
        }
        */
        let item = info.items[item_idx]
        let hasNext = info_idx + 1 < question.info.length || item_idx +1 < info.items.length || qs_idx +1 < paperData.paper_info.paper_detail.length
        let item_answer = item_score.hasOwnProperty(item.item_id) ? item_score[item.item_id] : {}
        return (
            <View style={{backgroundColor: "#fff", height: '100%'}}>
                <Header title={paper_title} onPress={()=>this.props.navigation.goBack()}/>
                <View style={{height:45, marginLeft: 10, justifyContent: 'center',borderBottomWidth: 1, borderBottomColor:"#f2f2f2"}}>
                    <Text style={{fontSize: 16}}>{question.qs_title}</Text>
                </View>
                <TouchableOpacity onPress={()=>this._playAudio(item_answer, info ,item)} style={{justifyContent: 'center', alignItems: 'center', height: 110}}>
                    <Image source={this.state.playing ? require('./../../assets/exam/pause.png') :require('./../../assets/exam/ic_answer_playback.png')} style={{width: 60, height: 60, marginTop: 10}}/>
                    <Text style={{fontSize: 14, marginTop: 5}}>{this.state.playing ? '正在播放...' : (+item_answer.topic_type === 2 ? '我的录音' : '题目音频')}</Text>
                </TouchableOpacity>
                <View style={{height: 15, backgroundColor:"#f8f8f8"}}/>
                <ScrollView style={{marginLeft: 10, width: width - 30}}>
                    {this._renderQuestion(item_answer, question.qs_type, item)}
                </ScrollView>
                <View style={{width: width, flexDirection: 'row', marginBottom: 5, height: 45}}>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Button
                            title="上一题"
                            disabled={info_idx === 0 && item_idx === 0 && qs_idx === 0}
                            icon={{name: 'skip-previous', type: 'material-community'}}
                            textStyle={{fontSize: 16, color: "#fff"}}
                            onPress={()=> this._toPrev()}
                            buttonStyle={{height: 40, backgroundColor:"#30cc75",borderRadius: 5, padding: 0, width: width / 2 - 10}}
                            containerViewStyle={{marginLeft: 0, marginRight: 0,}}
                        />
                    </View>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Button
                            title="下一题"
                            disabled={!hasNext}
                            rightIcon={{name: 'skip-next', type: 'material-community'}}
                            textStyle={{fontSize: 16, color: "#fff"}}
                            onPress={()=> this._toNext()}
                            buttonStyle={{height: 40, backgroundColor:"#30cc75",borderRadius: 5, padding: 0, width: width / 2 - 10 }}
                            containerViewStyle={{marginLeft: 0, marginRight: 0,}}
                        />
                    </View>
                </View>

            </View>
        )
    }
    _toPrev(){
        const {item_idx, info_idx, qs_idx, paperData} = this.state
        if (this.sound){
            this.sound.release()
            this.setState({playing: false})
        }
        // 上一子题
        if (item_idx > 0 ) {
            this.setState({item_idx: item_idx - 1})
            return
        }
        // 上一小题
        //检查第一小题的子题数量是否大于0个
        let question = paperData.paper_info.paper_detail[qs_idx]
        if (info_idx > 1 || (info_idx === 1 && question.info[0].items.length > 0)) {
            this.setState({item_idx: 0, info_idx: info_idx - 1})
            return
        }
        // 上一大题
        if (qs_idx > 0) {
            // 检查上一大题的第一小题的子题数量是否大于0个
            let question = paperData.paper_info.paper_detail[qs_idx - 1]
            if (question.info[0].items.length === 0){
                this.setState({item_idx: 0, info_idx: 1, qs_idx: qs_idx - 1})
            } else {
                this.setState({item_idx: 0, info_idx: 0, qs_idx: qs_idx - 1})
            }

            //this.setState({item_idx: 0, info_idx: 0, qs_idx: qs_idx - 1})
            return
        }
    }
    _toNext(){
        const {item_idx, info_idx, qs_idx, paperData} = this.state
        if (this.sound){
            this.sound.release()
            this.setState({playing: false})
        }
        let question = paperData.paper_info.paper_detail[qs_idx]
        let info =  question.info[info_idx]
        // 下一子题
        if (item_idx + 1 < info.items.length) {
            this.setState({item_idx: item_idx + 1})
            return
        }
        // 下一小题
        if (info_idx + 1 < question.info.length) {
            this.setState({item_idx: 0, info_idx: info_idx + 1})
            return
        }
        // 下一大题
        if (qs_idx + 1 < paperData.paper_info.paper_detail.length) {
            // 检查下一大题的第一小题的子题数量是否大于0个
            question = paperData.paper_info.paper_detail[qs_idx + 1]
            if (question.info[0].items.length === 0){
                this.setState({item_idx: 0, info_idx: 1, qs_idx: qs_idx + 1})
            } else {
                this.setState({item_idx: 0, info_idx: 0, qs_idx: qs_idx + 1})
            }

            //this.setState({item_idx: 0, info_idx: 0, qs_idx: qs_idx + 1})
            return
        }
    }
    _renderQuestion(item_answer, qs_type, item){
        console.log('item_answer', item_answer)
        switch (+qs_type){
            case 5: // 朗读短文
                return (<Type5 item={item} item_answer={item_answer}/>)
            case 16: // 朗读句子
            case 41: // 朗读句子
                return (<Type16 item={item} item_answer={item_answer}/>)
            case 1: // 听小对话选择
            case 3: // 听长对话选择
            case 4: // 听短文选择
            case 42: // 听小对话选择，新增青岛
                return (<Type1 item={item} item_answer={item_answer}/>)
            case 38: // 说出选项
                return (<Type38 item={item} item_answer={item_answer}/>)
            case 40: // 朗读单词
                return (<Type40 item={item} item_answer={item_answer}/>) 
            default:
                return (<Type9 item={item} item_answer={item_answer}/>)

        }

    }
    _playAudio (item_answer, info , item){
        if (this.isBusy) {
            return
        }
        if (this.state.playing) {
            this.setState({playing: false})
            this.sound.release()
            return
        }
        this.isBusy = true
        this.setState({playing: true})
        let topic_type = parseInt(item_answer.topic_type)
        let audioUrl = ''
        // 口语题播放录音
        if (topic_type === 2) {
            audioUrl = 'https://' + item_answer.user_answer + '.mp3'
        }else{
            // 听力题播放题目音频
            if (info.info_content_source_content) {
                audioUrl = PAPER_STATIC_HOST + info.info_content_source_content
            }else if (info.source_content) {
                audioUrl = PAPER_STATIC_HOST + info.source_content
            } else if (item.source_content) {
                audioUrl = PAPER_STATIC_HOST + item.source_content
            }
        }
        if (!audioUrl){
            return
        }
        Log('audioUrl', audioUrl)
        let _this = this
        Sound.setCategory('Playback');
        this.sound = new Sound(audioUrl, '', async (error) => {
            this.isBusy = false
            if (error) {
                _this.setState({playing: false})
                return;
            }
            _this.sound.play((success) => {
                _this.setState({playing: false})
                _this.sound.release()
            });
        })
    }
    _toBack () {
        this.props.navigation.goBack()
    }
}