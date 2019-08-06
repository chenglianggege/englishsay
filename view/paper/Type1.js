import React, { Component } from 'react';
import {
    View, Text, StyleSheet, Image, Platform, TouchableOpacity,Alert, ScrollView
} from 'react-native';
import SubBar from './SubBar'
import Toast, {DURATION} from 'react-native-easy-toast'
import { CheckBox } from 'react-native-elements'


export default class Type1 extends Component {
    constructor(props) {
        super(props);
        console.log(this.props)
        this.state = {info_idx: 0, item_idx: 0, answer_id: 0, answerArr:  {answer: '-', score: 0, rightAnswer: '-'}}
    }
    componentDidMount() {
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
        await this.setState({info_idx: 0, item_idx: 0, answer_id: 0, answerArr:  {answer: '-', score: 0, rightAnswer: '-'}})
        const {question, onFinish, onScore} = this.props
        for (let info_idx = 0; info_idx < question.info.length; info_idx ++){
            const question_info = question.info[info_idx]
            for (let item_idx = 0; item_idx < question_info.items.length; item_idx ++){
                await this.setState({item_idx: item_idx, info_idx: info_idx})
                const info_item = question_info.items[item_idx]
                try {
                    await this._itemAnswer(info_item)
                    //await this._saveAnswer(info_item)
                    let answerArr = this.state.answerArr
                    onScore({
                        score : answerArr.score,
                        item: info_item,
                        item_answer: answerArr.rightAnswer,
                        item_answer_type: 1,
                        user_answer: answerArr.answer
                    })
                }catch (e) {}
                if (!this._isMounted) return
            }
        }
        if (!this._isMounted){
            return
        }
        onFinish()
    }

    _itemAnswer (info_item) {
        let _this = this
        return new Promise(async (resolve, reject) => {
            let rightAnswer = '-'
            for (let i in info_item.answer) {
                if (parseInt(info_item.answer[i].answer_is_right) === 1){
                    rightAnswer = ABC[i]
                }
            }
            _this.setState({answer_id: 0, answerArr:  {answer: '-', score: 0, rightAnswer: rightAnswer}})
            try {
                // 1 - 看题
                await _this.refs.subbar.wait(info_item.item_prepare_second, '请看题...')
                if (!_this._isMounted) return reject()

                // 2 - 播放子题音频
                if (info_item.source_content){
                    for (let i = 0; i< info_item.item_repet_times;i++){
                        await _this.refs.subbar.play(info_item.source_content)
                        if (!_this._isMounted) return reject()
                    }
                }

                // 3 - 等待作答
                await _this.refs.subbar.wait(info_item.item_answer_second, '请作答...')
                if (!_this._isMounted) return reject()
                resolve()

            }catch (e) {
                LogServer('ANSWER_EXCEPTION', e.message)
                reject(e)
            }
        })

    }

    render () {

        const {question} = this.props
        const {info_idx, item_idx} = this.state
        const question_info = question.info[info_idx]
        return (
            <View style={{flex: 1,backgroundColor:"#fff"}}>
                <View style={{flex: 5}}>
                    <View style={{height: 40, alignItems: 'center', flexDirection:'row',marginRight: 14, marginLeft:15}}>
                        <Text numberOfLines={1} style={[styles.titleText,{flex: 5}]}>{question_info.info_content ? question_info.info_content : question.qs_title}</Text>
                        <View style={{flexDirection:'row', flex: 1, justifyContent:'flex-end'}}>
                            <Text style={[styles.titleText,{color: "#30cc75"}]}>{+item_idx+1}</Text>
                            <Text style={[styles.titleText,{}]}>/{question_info.items.length}</Text>
                        </View>
                    </View>
                    <View style={styles.underLine}/>
                    <View style={[{marginTop: 10, marginLeft:15, marginBottom: 40}]}>
                        <ScrollView style={{backgroundColor: '#fff'}}>
                            <View style={{flexWrap: 'wrap'}}>
                                {this._renderItem(question_info.items[item_idx])}
                            </View>
                        </ScrollView>
                    </View>
                </View>
                <SubBar style={{flex: 1}} ref="subbar"/>
                <Toast ref="toast" position="center"/>
            </View>
        )
    }
    _renderItem (item) {
        return (
            <View key={item.item_id}>
                <Text style={styles.titleText}>{item.item_content}</Text>
                {item.answers.map( (answer,index) => {
                    return (
                        <View key={answer.answer_id} style={answer.source_content ? {flexDirection: 'row'} : {}} >
                            <CheckBox
                                containerStyle={{backgroundColor: '#fff', borderColor:"#fff"}}
                                checked={this.state.answer_id === answer.answer_id}
                                onPress={()=>this._pressCheckBox(answer.answer_id, ABC[index], parseInt(answer.answer_is_right) === 1 ? item.item_score : 0)}
                                title={ABC[index] + '.' +  answer.answer_content}
                            />
                            {answer.source_content ? <Image resizeMode="contain" source={{uri: PAPER_STATIC_HOST + answer.source_content}} style={{marginLeft: 5, height: 100, width: 120, marginTop: 5}} /> : null}
                        </View>)
                } )}
            </View>
        )
    }
    _renderChoice(index, answer, item_score){
        return (
            <TouchableOpacity
                onPress={()=>this._pressCheckBox(answer.answer_id, ABC[index], parseInt(answer.answer_is_right) === 1 ? item_score : 0)}
                style={{marginTop: 10, flexDirection: 'row', alignItems:'center'}}>
                <Text>{ABC[index]}. </Text>

            </TouchableOpacity>
        )
    }

    _pressCheckBox(answer_id, answer, score) {
        console.log(answer_id, answer, score)
        this.setState({answer_id: answer_id, answerArr:  {answer: answer, score: score}})
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