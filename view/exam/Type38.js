import React, { Component } from 'react';
import {
    View, Text, StyleSheet, Image, Platform, TouchableOpacity,Alert, ScrollView
} from 'react-native';
//import { Rating } from 'react-native-elements';
//import Rating from '../../libs/rating/Rating';
export default class Type1 extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render () {
        const {item, item_answer} = this.props
        if (!item_answer.hasOwnProperty('score_result')) {
            return null
        }
        //let score_result = JSON.parse(item_answer.score_result)
        let score_result = item_answer.score_result
        return (
            <View>
                <View style={{borderWidth: 1, borderColor: "#dbdbdb", width: 85, height: 25, marginTop: 10, justifyContent:'center'}}>
                    <Text style={{fontSize: 16, textAlign: 'center'}}>得分评估</Text>
                </View>
                <Text style={styles.titleText}>总得分： {(+item_answer.exam_score).toFixed(1)}/{(+item.item_score).toFixed(1)}</Text>
                <Text style={styles.titleText}>匹配度： {score_result.result.confidence}</Text>
                <View style={[styles.underLine]} />
                <View style={{borderWidth: 1, borderColor: "#dbdbdb", width: 85, height: 25, marginTop: 10, justifyContent:'center'}}>
                    <Text style={{fontSize: 16, textAlign: 'center'}}>你的答案</Text>
                </View>
                <Text style={[{fontSize: 16, marginTop: 10},+item_answer.exam_score - item.item_score === 0 ? {color: "#30cc75"} : {color: "#e75947"}]}>{score_result.result.recognition ? score_result.result.recognition : '-'}</Text>
                <View style={[styles.underLine]} />

                <View style={{borderWidth: 1, borderColor: "#dbdbdb", width: 85, height: 25, marginTop: 10, justifyContent:'center'}}>
                    <Text style={{fontSize: 16, textAlign: 'center'}}>题目问题</Text>
                </View>
                <View style={{marginTop: 10}}>{this._renderAnswerText(item.answers[0].answer_content)}</View>

            </View>

        )
    }
    _renderAnswerText(answer_content){
        let answer_content_arr = answer_content.split('|')
        let true_answer = answer_content_arr.pop()
        //answer_content_arr = answer_content_arr.splice(answer_content_arr.length - 1, 1);
        return answer_content_arr.map((item, index)=>(<Text key={index} style={[{fontSize: 16}, true_answer === item ? {color: '#30cc75', lineHeight: 25}: {}]}>{ABC[index] + '. ' + item} </Text>))
    }
}
const styles = StyleSheet.create({
    underLine: {
        marginTop: 10,
        marginRight: 10,
        width: '95%',
        height: 1,
        borderWidth: 0,
        backgroundColor: "#f3f0f0",
        alignSelf:'center'
    },
    titleText: {
        fontSize: 16, marginTop: 10
    }
})