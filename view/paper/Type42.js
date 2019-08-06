import React, { Component } from 'react';
import {
    View, Text, StyleSheet, Image, Platform, TouchableOpacity,Alert, ScrollView, Modal
} from 'react-native';
import SubBar from './SubBar'
import Toast, {DURATION} from 'react-native-easy-toast'
import { CheckBox } from 'react-native-elements'
import {LoaderScreen} from 'react-native-ui-lib'
import ImageViewer from 'react-native-image-zoom-viewer';

export default class Type42 extends Component {
    constructor(props) {
        super(props);
        console.log(this.props)
        this.state = {info_idx: 0, item_idx: 0,answerArr: [],loading: false,attention:''}
    }
    componentDidMount() {
        this._isMounted = true
        this._starting()
    }
    componentWillUnmount(){
        this._isMounted = false
    }
    componentWillReceiveProps (nextProps){
        if (nextProps.qs_idx !== this.props.qs_idx) {
            this._starting()
        }
    }
    async _starting () {
        await this.setState({info_idx: 0, item_idx: 0, answerArr: []})
        const {question, onFinish, onScore} = this.props
        for (let info_idx = 0; info_idx < question.info.length; info_idx ++){
            await this.setState({info_idx: info_idx})
            const question_info = question.info[info_idx]
            try {
                await this._infoAnswer(question_info)
                for (let item_idx = 0; item_idx < question_info.items.length; item_idx ++){
                    //info_item 小题详细信息
                    //item_id 小题ID
                    const info_item = question_info.items[item_idx]
                    let answerArr = this.state.answerArr[info_item.item_id]
                    //score             分数
                    //item              小题详细信息
                    //item_answer       正确答案
                    //item_answer_type  答题类型
                    //user_answer       用户答案
                    onScore({
                        score : answerArr.score,
                        item: info_item,
                        item_answer: answerArr.rightAnswer,
                        item_answer_type: 1,
                        user_answer: answerArr.answer
                    })
                }
            }catch (e) {}

            if (!this._isMounted) return

        }
        if (this._isMounted) onFinish()

    }

    _infoAnswer (question_info) {
        let _this = this
        return new Promise(async (resolve, reject) => {
            const {answerArr,attention} = _this.state
            try {
                //_this._scrollView.scrollTo({x:0, y:0, animated:true})
                // 1 - 看题 时间 = 小题之和
                let waitSecond = 0;
                let answerSecond = 0;
                for (let item_idx = 0; item_idx < question_info.items.length; item_idx ++){
                    waitSecond += parseInt(question_info.items[item_idx].item_prepare_second)
                    answerSecond += parseInt(question_info.items[item_idx].item_answer_second)
                    // 先设置每题的答题为空结果
                    let rightAnswer = '-'
                    for (let i in question_info.items[item_idx].answer) {
                        if (parseInt(question_info.items[item_idx].answer[i].answer_is_right) === 1){
                            rightAnswer = ABC[i]
                        }
                    }
                    answerArr[question_info.items[item_idx].item_id] = {answer: '-', score: 0, rightAnswer: rightAnswer}
                }
                _this.setState({answerArr: answerArr})
                if(this.state.info_idx === 1){
                    setTimeout(() => {
                        this._toKefu()
                    }, 600)
                }
                // 小题内容音频播放次数,默认1遍，即使给0也是播放一遍
                _this.setState({attention: question_info.info_content})
                let playTimes = question_info.info_repet_times ? +question_info.info_repet_times: 1

                // 2 - 播放小题标题音频
                if (question_info.source_content){
                    //  如果没有info_content_source_content 则把source_content播放info_repet_times遍
                    for (let i = 0; i< (!question_info.info_content_source_content ? playTimes : 1);i++){
                        await _this.refs.subbar.play(question_info.source_content)
                        if (!_this._isMounted) return reject()
                    }
                }

                await _this.refs.subbar.wait(waitSecond, '请看题...')
                if (!_this._isMounted) return reject()

                // 3 - 播放小题内容音频
                if (question_info.info_content_source_content){
                    for (let i = 0; i< question_info.info_repet_times;i++){
                        await _this.refs.subbar.play(question_info.info_content_source_content)
                        if (!_this._isMounted) return reject()
                    }
                }

                // 4 - 播放子题音频
                for (let item_idx = 0; item_idx < question_info.items.length; item_idx ++){
                    let info_item = question_info.items[item_idx]
                    if (info_item.source_content){
                        for (let i = 0; i< info_item.item_repet_times;i++){
                            await _this.refs.subbar.play(info_item.source_content)
                            if (!_this._isMounted) return reject()
                        }
                    }
                }
                // 5 - 等待作答
                await _this.refs.subbar.wait(answerSecond, '请作答...')
                if (!_this._isMounted) return reject()
                resolve()

            }catch (e) {
                LogServer('ANSWER_EXCEPTION', e.message)
                reject(e)
            }
        })

    }
    _toKefu(){
        this._scrollView.scrollTo({x:0, y:0, animated:true})
    }
    render () {

        const {question} = this.props
        const {info_idx, item_idx, isImageShow, showImg} = this.state
        const question_info = question.info[info_idx]
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
                    {question.info[0].info_content ? <Text style={[styles.titleText,{marginTop: 10, marginLeft:15}]}>{this.state.attention}</Text> : null}
                    {question_info.source_content && parseInt(question_info.source_type) === 2 ?
                        <Image resizeMode="contain" style={{height: 200, marginTop: 10}} source={{uri: PAPER_STATIC_HOST + question_info.source_content}}  /> : null}
                    {question_info.info_content_img ?
                        <ImageViewer
                            renderIndicator={()=>{}}
                            resizeMode="contain"
                            style={{height: 200, marginTop: 10}}
                            enableImageZoom={false}
                            backgroundColor="#fff"
                            imageUrls={[{url: PAPER_STATIC_HOST + question_info.info_content_img}]}
                        />
                        : null}
                    {question_info.info_content_img ?
                        <View style={{width: '100%',marginTop:-50,flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}}>
                            <Image style={{width: 15 ,height: 23}} source={require('./../../assets/paper/doublehand.png')}/>
                            <Text style={{color:"#AAAAAA",marginLeft:5,marginRight:10}}>放大图片</Text>
                        </View>
                        : null}   
                    <ScrollView ref={component => this._scrollView = component}
                        style={{backgroundColor: '#fff', marginTop: 5, marginLeft:15}}>
                        {this._renderChoiceList(question_info)}
                    </ScrollView>
                </View>
                {isImageShow ?
                    <Modal visible={true} transparent={true}
                            onRequestClose={()=> {
                                this.setState({
                                    isImageShow: false,
                                });
                            }}>
                        <ImageViewer imageUrls={[{url: showImg}]}
                                        onClick={(e)=>{
                                         //console.log('onClick', e)
                                            this.setState({
                                                isImageShow: false,
                                            });
                                        }}
                                        saveToLocalByLongPress={false}/>
                    </Modal> : null}
                <SubBar style={{flex: 1}} ref="subbar"/>
                <Toast ref="toast" position="center"/>
            </View>
        )
    }
    _openMax(showImg){
        this.setState({showImg: showImg, isImageShow: true})
    }
    _renderChoiceList (question_info) {
        return question_info.items.map( (item, index) => this._renderItem(item, index) );
    }
    _renderItem (item, item_idx) {
        return (
            <View key={item.item_id}>
                <Text style={styles.titleText}>{item.item_content && item.item_content.trim() ? parseInt(item_idx+6)+'.'+item.item_content : parseInt(item_idx+1) + '. 请作答'}</Text>
                <View style={styles.viewCheckbox}>
                    {item.answers.map( (answer,index) => {
                        return (
                            <View key={answer.answer_id}>
                                {this.state.info_idx === 0 ?
                                    <CheckBox
                                        containerStyle={{backgroundColor: '#fff', borderColor:"#fff", width: 60}}
                                        checked={this.state.answerArr.length > 0 && this.state.answerArr[item.item_id] && this.state.answerArr[item.item_id].answer === ABC[index]}
                                        onPress={()=>this._pressCheckBox(item.item_id, ABC[index], +answer.answer_is_right === 1 ? item.item_score : 0)}
                                        title={ABC[index] + '. ' + answer.answer_content}
                                    /> : <CheckBox
                                        containerStyle={{backgroundColor: '#fff', borderColor:"#fff"}}
                                        checked={this.state.answerArr.length > 0 && this.state.answerArr[item.item_id] && this.state.answerArr[item.item_id].answer === ABC[index]}
                                        onPress={()=>this._pressCheckBox(item.item_id, ABC[index], +answer.answer_is_right === 1 ? item.item_score : 0)}
                                        title={ABC[index] + '. ' + answer.answer_content}
                                    />
                                }
                                {answer.source_content ? <Image resizeMode="contain" source={{uri: PAPER_STATIC_HOST + answer.source_content}} style={{marginLeft: 5, height: 100, width: 120, marginTop: 5}} /> : null}
                            </View>
                        )
                    } )}
                </View>
            </View>
        )
    }

    _pressCheckBox(item_id, answer, score) {
        const {answerArr} = this.state
        answerArr[item_id] = {answer: answer, score: score}
        this.setState({answerArr: answerArr})
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
    },
    viewCheckbox: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap', 
    }
})