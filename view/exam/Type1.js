import React, { Component } from 'react';
import {
    View, Text, StyleSheet, Image, Platform, TouchableOpacity,Alert, ScrollView
} from 'react-native';


export default class Type1 extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render () {
        //Log(this.props)
        const {item, item_answer} = this.props
        return (
            <View>
                <View style={{borderWidth: 1, borderColor: "#dbdbdb", width: 85, height: 25, marginTop: 10, justifyContent:'center'}}>
                    <Text style={{fontSize: 16, textAlign: 'center'}}>得分评估</Text>
                </View>
                <Text style={{fontSize: 16, marginTop: 10}}>总得分： {(+item_answer.exam_score).toFixed(1)}/{(+item.item_score).toFixed(1)}</Text>
                <View style={[styles.underLine]} />

                <View style={{borderWidth: 1, borderColor: "#dbdbdb", width: 85, height: 25, marginTop: 10, justifyContent:'center'}}>
                    <Text style={{fontSize: 16, textAlign: 'center'}}>你的答案</Text>
                </View>
                <Text style={[{fontSize: 16, marginTop: 10},+item_answer.exam_score - item.item_score === 0 ? {color: "#30cc75"} : {color: "#e75947"}]}>{item_answer.user_answer}</Text>
                <View style={[styles.underLine]} />

                <View style={{borderWidth: 1, borderColor: "#dbdbdb", width: 85, height: 25, marginTop: 10, justifyContent:'center'}}>
                    <Text style={{fontSize: 16, textAlign: 'center'}}>题目问题</Text>
                </View>
                <Text style={{marginTop: 10, fontSize: 16}}>{item.item_content}</Text>
                {item.answers.map((answer, index) => this._renderChoice(answer, index))}

            </View>

        )
    }
    _renderChoice(answer, index){
        //Log(answer, index)
        return (
            <View style={{flexDirection: 'row'}} key={answer.answer_id}>
                <Text style={[{marginTop: 10, fontSize: 16},parseInt(answer.answer_is_right) === 1 ? {color: "#30cc75"} : {}]}>
                    {ABC[index] + '. ' + answer.answer_content}
                </Text>
                {answer.source_content ?
                    <Image resizeMode="contain" source={{uri: PAPER_STATIC_HOST + answer.source_content}} style={{marginLeft: 5, height: 100, width: 120}} />
                    : null}
            </View>
        )
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

    }
})