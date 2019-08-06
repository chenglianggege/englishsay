import React, { Component } from 'react';
import {
    View, Text, StyleSheet, Image, Platform, TouchableOpacity,Alert, ScrollView
} from 'react-native';
//import { Rating } from 'react-native-elements';
import Rating from '../../libs/rating/Rating';

export default class Type1 extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentWillReceiveProps (){

    }
    render () {
        //Log(this.props)
        const {item, item_answer} = this.props
        if(item_answer.score_result){

        }else{
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
                        <Text style={{fontSize: 16, textAlign: 'center'}}>参考答案</Text>
                    </View>
                    <Text style={{marginTop: 10, fontSize: 16}}>{item.item_content}</Text>
                </View>
            )
        }
        if (!item_answer.hasOwnProperty('score_result')) {
            return null
        }
        //let score_result = JSON.parse(item_answer.score_result)
        let score_result = item_answer.score_result
        console.log('score_result', score_result)
        return (
            <View>
                <View style={{borderWidth: 1, borderColor: "#dbdbdb", width: 85, height: 25, marginTop: 10, justifyContent:'center'}}>
                    <Text style={{fontSize: 16, textAlign: 'center'}}>得分评估</Text>
                </View>
                <Text style={styles.titleText}>总得分： {(+item_answer.exam_score).toFixed(1)}/{(+item.item_score).toFixed(1)}</Text>
                <View style={{flexDirection: 'row'}}>
                    <View style={{flexDirection: 'row', flex: 1}}>
                        <Text style={styles.titleText}>流利度： </Text>
                        <Rating
                            type="star"
                            fractions={1}
                            startingValue={(+score_result.result.fluency/item.item_score*5)}
                            readonly
                            imageSize={15}
                            style={{ marginTop: 13}}
                        />
                    </View>

                    <View style={{flexDirection: 'row',flex: 1}}>
                        <Text style={styles.titleText}>内  容： </Text>
                        <Rating
                            type="star"
                            fractions={1}
                            startingValue={(+score_result.result.coherence/item.item_score*5)}
                            readonly
                            imageSize={15}
                            style={{ marginTop: 13 }}
                        />
                    </View>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <View style={{flexDirection: 'row',flex: 1}}>
                        <Text style={styles.titleText}>准确度： </Text>
                        <Rating
                            type="star"
                            fractions={1}
                            startingValue={(+score_result.result.pronunciation/item.item_score*5)}
                            readonly
                            imageSize={15}
                            style={{ marginTop: 13 }}
                        />
                    </View>

                    {score_result.result.hasOwnProperty('speed') ?
                    <View style={{flexDirection: 'row',flex: 1}}>
                        <Text style={styles.titleText}>语  速： </Text>
                        <Text style={styles.titleText}>{score_result.result.speed}词/分钟</Text>
                    </View> : null }
                </View>
                <View style={{borderWidth: 1, borderColor: "#dbdbdb", width: 85, height: 25, marginTop: 10, justifyContent:'center'}}>
                    <Text style={{fontSize: 16, textAlign: 'center'}}>参考答案</Text>
                </View>
                <View style={{marginTop: 10}}>{this._renderAnswerText(item.answers[0].answer_content)}</View>

            </View>

        )
    }
    _renderAnswerText(answer_content){
        let answer_content_arr = answer_content.split('|')
        answer_content_arr = answer_content_arr.splice(0, 2);
        return answer_content_arr.map((item, index)=>(<Text key={index} style={{fontSize: 16}}>{(index+1) + '. ' +item} </Text>))
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