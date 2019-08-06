import React, { Component } from 'react';
import {
    View, Text, StyleSheet, Image, Platform, TouchableOpacity,Alert, ScrollView
} from 'react-native';
// import { Rating } from 'react-native-elements';
import Rating from '../../libs/rating/Rating';
import WordDialog from '../common/WordDialog';
import { Icon } from 'react-native-elements'

export default class Type1 extends Component {
    constructor(props) {
        super(props);
        this.state = {showTips: false}
    }
    async componentDidMount() {
        try {
            await global.storage.load({key: 'TIPS-SENT-READ-5'})
            this.setState({showTips: false})
        }catch (e) {
            this.setState({showTips: true})
        }
    }
    render () {
        //Log(this.props)
        const {item, item_answer} = this.props
        if (!item_answer.hasOwnProperty('score_result')) {
            return null
        }
        let score_result = item_answer.score_result
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
                </View>
                <View style={{flexDirection: 'row'}}>
                    <View style={{flexDirection: 'row', flex: 1}}>
                        <Text style={styles.titleText}>完整度： </Text>
                        <Rating
                            type="star"
                            fractions={1}
                            startingValue={(+score_result.result.integrity/item.item_score*5)}
                            readonly
                            imageSize={15}
                            style={{ marginTop: 13 }}
                        />
                    </View>
                    <View style={{flexDirection: 'row', flex: 1}}>
                        <Text style={styles.titleText}>语    速： </Text>
                        <Text style={styles.titleText}>{score_result.result.speed}词/分钟</Text>
                    </View>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <Text style={styles.titleText}>评分说明:</Text>
                    <View style={{flexDirection: 'row', marginTop: 10,justifyContent: "center", alignItems: "center"}}>
                        <Text style={{fontSize: 14, marginLeft: 10}}>优</Text><View style={{width: 30, height: 10, backgroundColor:"#41b612", marginLeft: 5}} />
                        <Text style={{fontSize: 14, marginLeft: 10}}>良</Text><View style={{width: 30, height: 10, backgroundColor:"#1394fa", marginLeft: 5}} />
                        <Text style={{fontSize: 14, marginLeft: 10}}>中</Text><View style={{width: 30, height: 10, backgroundColor:"#ff8414", marginLeft: 5}} />
                        <Text style={{fontSize: 14, marginLeft: 10}}>差</Text><View style={{width: 30, height: 10, backgroundColor:"#f44116", marginLeft: 5}} />
                    </View>
                </View>
                {this._renderWordTips()}
                <Text style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, textAlign:"justify", lineHeight: 26,fontSize: 18}}>
                    {this._renderColorText()}
                </Text>
                <WordDialog ref="word" />
            </View>

        )
    }
    _renderColorText(){
        const {item, item_answer} = this.props
        //let score_result = JSON.parse(item_answer.score_result)
        let score_result = item_answer.score_result
        //Log(score_result)
        return score_result.result.sentences.map((item,index)=>this._renderSent(item, index))
    }
    _renderSent(item, index){
        if (item.hasOwnProperty('details')) {
            return item.details.map((word, widx)=>{
                return this._renderColorItem(word.word, word.overall, index + '_' + widx)
            })
        }else{
            return this._renderColorItem(item.sentence, item.overall, index)
        }
    }
    _renderColorItem(centent, overall, key){


        let color = ''
        let score = overall / this.props.item.item_score * 100
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
        let new_content = centent
        if (centent.substr(0, 1) === '\n' || centent.substr(0, 1) === '\r') {
            while (true){
                if (new_content.substr(0, 1) === '\n' || centent.substr(0, 1) === '\r') {
                    new_content = new_content.substr(1)
                }else{
                    break;
                }
            }
        }
        return (<Text key={key} onPress={()=>this._showWord(new_content, score)} style={{color: color, lineHeight: 26,fontSize: 18}}>{new_content} </Text>)

    }

    _renderWordTips(){
        const {showTips} = this.state
        if (!showTips){
            return null
        }
        return (
            <View style={{flex: 1, alignItems: "center", marginBottom: -10}} >
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

    _closeTips(){
        global.storage.save({key: 'TIPS-SENT-READ-5', data: 1})
        this.setState({showTips: false})
    }


    _showWord(word, score){
        this.refs.word.show(word, score)
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