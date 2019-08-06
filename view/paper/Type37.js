import React, { Component } from 'react';
import {
    View, Text, StyleSheet, Image, Platform, TouchableOpacity, Alert, ScrollView, Dimensions
} from 'react-native';
import SubBar from './SubBar'
import Toast, {DURATION} from 'react-native-easy-toast'
var {height,width} =  Dimensions.get('window');

// 逐子题进行看题-音频-录音
export default class Type5 extends Component {
    constructor(props) {
        super(props);
        console.log(this.props)
        this.state = {info_idx: 0, item_idx: 0}
    }
    async componentDidMount() {
        this._isMounted = true
        this._starting()
    }
    componentWillReceiveProps (nextProps){
        if (nextProps.qs_idx !== this.props.qs_idx) {
            this._starting()
        }
    }
    componentWillUnmount(){
        this._isMounted = false
    }
    async _starting () {
        await this.setState({info_idx: 0, item_idx: 0})
        const {question, onFinish, onScore, onEnd} = this.props
        for (let info_idx = 0; info_idx < question.info.length; info_idx ++){
            await this.setState({info_idx: info_idx})
            const question_info = question.info[info_idx]
            // 1 - 播放小题标题音频
            if (question_info.source_content){
                await this.refs.subbar.play(question_info.source_content)
                if (!this._isMounted) return
            }
            // 2 - 播放小题内容音频
            if (question_info.info_content_source_content){
                for (let i = 0; i< question_info.info_repet_times;i++){
                    await this.refs.subbar.play(question_info.info_content_source_content)
                    if (!this._isMounted) return
                }
            }
            for (let item_idx = 0; item_idx < question_info.items.length; item_idx ++){
                try {
                    await this.setState({item_idx: item_idx})
                    const info_item = question_info.items[item_idx]
                    let score = await this._itemAnswer(info_item)
                    onScore({
                        score_params : score,
                        item: info_item,
                        item_answer: info_item.answers[0].answer_content,
                        item_answer_type: 2
                    })
                }catch (e) {
                    if (e.message === 'RECORD_START_ERROR') {
                        Alert.alert('录音失败', '请检查录音权限并尝试重新打开App！',[
                            {text: '确认', onPress: () => onEnd()},
                        ], { cancelable: false })
                        return
                    }
                }
                if (!this._isMounted) return
            }
        }
        if (this._isMounted) onFinish()

    }

    _itemAnswer (info_item) {
        let _this = this
        return new Promise(async (resolve, reject) => {
            try {
                await _this.refs.subbar.wait(info_item.item_prepare_second, '请看题...')
                if (!_this._isMounted) return reject()

                if (info_item.source_content){
                    for (let i = 0; i< info_item.item_repet_times;i++){
                        await _this.refs.subbar.play(info_item.source_content)
                        if (!_this._isMounted) return reject()
                    }
                }

                let coreType = 'open.eval'
                let openType = _this.state.info_idx === 1 ? 7 : 6
                let audioPath = await _this.refs.subbar.record(info_item.item_answer_second);
                if (!_this._isMounted) return reject()
                resolve({
                    coreType: coreType,
                    refText: info_item.answers[0].answer_content,
                    attachAudioUrl: 1,
                    scale: parseFloat(info_item.item_score),
                    precision: 0.1,
                    qType: parseInt(openType),
                    recordFilePath: audioPath
                })
            }catch (e) {
                LogServer('ANSWER_EXCEPTION', e.message)
                reject(e)
            }
        })

    }

    render () {
        const {question} = this.props
        const {info_idx, item_idx} = this.state
        const first_question_info = question.info[0]
        const question_info = question.info[info_idx]
        const info_item = question_info.items[item_idx]
        return (
            <View style={{flex: 1,backgroundColor:"#fff"}}>
                <View style={{flex: 5}}>
                    <View style={{height: 40, alignItems: 'center', flexDirection:'row',marginRight: 14, marginLeft:15}}>
                        <Text numberOfLines={1} style={[styles.titleText,{flex: 5}]}>{question.qs_title}</Text>
                        <View style={{flexDirection:'row', flex: 1, justifyContent:'flex-end'}}>
                            <Text style={[styles.titleText,{color: "#30cc75"}]}>{+info_idx+1}</Text>
                            <Text style={[styles.titleText,{}]}>/{question.info.length}</Text>
                        </View>
                    </View>
                    <View style={styles.underLine}/>
                    <View style={[{marginTop: 10, marginLeft:15, marginRight:15,marginBottom: 40}]}>
                        <ScrollView style={{backgroundColor: '#fff'}}>
                        {info_idx === 0 && first_question_info.info_content ? <Text style={[styles.titleText,{marginTop: 10}]}>{first_question_info.info_content}</Text>: null}
                        {first_question_info.info_content_img? <Image resizeMode="contain" style={{height: 200, marginTop: 10}} source={{uri: PAPER_STATIC_HOST + first_question_info.info_content_img}}  /> : null}

                        {info_idx >0 && question_info.info_content ? <Text style={[styles.titleText,{marginTop: 10}]}>{question_info.info_content}</Text>: null}
                        {info_idx >0 && info_item.item_content ? <Text style={[styles.titleText,{marginTop: 10}]}>{info_item.item_content}</Text>:  null}
                        </ScrollView>
                    </View>

                </View>
                <SubBar style={{flex: 1}} ref="subbar"/>
                <Toast ref="toast" position="center"/>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    titleText: {
        fontSize: 16,
        color: "#898787",
        lineHeight: 26
    },
    underLine: {
        backgroundColor: "#f3f0f0",
        height: 1
    }
})