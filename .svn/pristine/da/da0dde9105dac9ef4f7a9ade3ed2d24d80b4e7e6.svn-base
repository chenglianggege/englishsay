import React, { Component } from 'react';
import {
    View, Text, StyleSheet, Image, Platform, TouchableOpacity,Alert, ScrollView
} from 'react-native';
export default class Type40 extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render () {
        //Log(this.props)
        const {item, item_answer} = this.props
        if (!item_answer.hasOwnProperty('score_result')) {
            return null
        }
        //let score_result = JSON.parse(item_answer.score_result)
        //Log(score_result)
        let score_result = item_answer.score_result
        return (
            <View>
                <View style={{borderWidth: 1, borderColor: "#dbdbdb", width: 85, height: 25, marginTop: 10, justifyContent:'center'}}>
                    <Text style={{fontSize: 16, textAlign: 'center'}}>得分评估</Text>
                </View>
                <Text style={styles.titleText}>总得分： {(+item_answer.exam_score).toFixed(1)}/{(+item.item_score).toFixed(1)}</Text>
                <View style={{flexDirection: 'row', flexWrap: 'wrap',marginTop: 30}}>
                    {this._renderColorText()}
                </View>

            </View>

        )
    }
    _renderColorText(){
        const {item, item_answer} = this.props
        //let score_result = JSON.parse(item_answer.score_result)
        let score_result = item_answer.score_result
        return score_result.result.words.map((word,index)=>this._renderWord(word, index))

    }
    _renderWord(word, idx){
        return word.phonics.map((item,index)=>this._renderColorItem(item, idx + '_' + index))
    }
    _renderColorItem(item, index){
        let color = ''
        let score = item.overall / this.props.item.item_score * 100
        if (score < 30){
            color = "#f44116"
        }
        if (score >= 30 && score < 60){
            color = "#ff8414"
        }
        if (score >= 60 && score < 75){
            color = "#1394fa"
        }
        if (score >= 75){
            color = "#41b612"
        }
        return (<Text key={index} style={{color: color, fontSize: 16}}>{item.spell}</Text>)
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