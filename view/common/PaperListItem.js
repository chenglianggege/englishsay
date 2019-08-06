import React, { Component } from 'react';
import {
    View,
    Image,
    Text
} from 'react-native';
export default class PaperListItem extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render(){
        const {showAvgScore, item} = this.props
        if (showAvgScore) {
            return this._TB()
        }
        return this._MN()
    }
    _TB(){
        const {item} = this.props
        return (
            <View key={item.exam_id} style={{height: 74, flexDirection: 'row', alignItems: 'center'}}>
                {!item.download ? <Image style={{width: 22, marginLeft: 20}} source={require('./../../assets/common/weixiazai.png')} /> : null }
                {item.download && +item.exam_process < 1 ? <Image style={{width: 20, marginLeft: 20}} source={require('./../../assets/common/xunzhanghui.png')} /> : null }
                {item.download && +item.exam_process >= 1 && +item.avg_score <= 30 ? <Image style={{width: 20, marginLeft: 20}} source={require('./../../assets/common/chax.png')} /> : null }
                {item.download && +item.exam_process >= 1 && +item.avg_score > 30 && +item.avg_score <= 60 ? <Image style={{width: 20, marginLeft: 20}} source={require('./../../assets/common/zhongx.png')} /> : null }
                {item.download && +item.exam_process >= 1 && +item.avg_score > 60 && +item.avg_score <= 75 ? <Image style={{width: 20, marginLeft: 20}} source={require('./../../assets/common/liangx.png')} /> : null }
                {item.download && +item.exam_process >= 1 && +item.avg_score > 75 ? <Image style={{width: 20, marginLeft: 20}} source={require('./../../assets/common/youx.png')} /> : null }

                <View style={{flex: 1, marginLeft: 20, justifyContent: 'center'}}>
                    <View><Text style={{fontSize: 16, color: "#353535"}} numberOfLines={1}>{item.paper_title}</Text></View>
                    <View style={{flexDirection: 'row', marginTop: 10}}>
                        <View style={{flexDirection: 'row', width: 90, alignItems: 'center'}}>
                            <Image source={require('./../../assets/common/wancheng.png')} style={{width:12, height: 12}}/>
                            <Text style={{marginLeft: 6, fontSize: 12, color: '#858585'}}>进度：{parseInt(item.exam_process*100)}%</Text>
                        </View>
                        <View style={{flexDirection: 'row',marginLeft: 18, alignItems: 'center'}}>
                            <Image source={require('./../../assets/common/jifen.png')} style={{width:12, height: 12}}/>
                            <Text style={{marginLeft: 6, fontSize: 12, color: "#858585"}}>平均分：{(+item.avg_score).toFixed(0)}</Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
    _MN(){
        const {item} = this.props
        return (
            <View key={item.exam_id} style={{height: 74, flexDirection: 'row', alignItems: 'center'}}>
                {item.score_exception ? <Image style={{width: 22, marginLeft: 20}} source={require('./../../assets/common/shangchuan.png')} /> : null }
                {!item.score_exception && !item.download ? <Image style={{width: 22, marginLeft: 20}} source={require('./../../assets/common/weixiazai.png')} /> : null }
                {!item.score_exception && item.download && +item.exam_process < 1 ? <Image style={{width: 20, marginLeft: 20}} source={require('./../../assets/common/xunzhanghui.png')} /> : null }
                {!item.score_exception && item.download && +item.exam_process >= 1 && +item.ratio_score <= 30 ? <Image style={{width: 20, marginLeft: 20}} source={require('./../../assets/common/chax.png')} /> : null }
                {!item.score_exception && item.download && +item.exam_process >= 1 && +item.ratio_score > 30 && +item.ratio_score <= 60 ? <Image style={{width: 20, marginLeft: 20}} source={require('./../../assets/common/zhongx.png')} /> : null }
                {!item.score_exception && item.download && +item.exam_process >= 1 && +item.ratio_score > 60 && +item.ratio_score <= 75 ? <Image style={{width: 20, marginLeft: 20}} source={require('./../../assets/common/liangx.png')} /> : null }
                {!item.score_exception && item.download && +item.exam_process >= 1 && +item.ratio_score > 75 ? <Image style={{width: 20, marginLeft: 20}} source={require('./../../assets/common/youx.png')} /> : null }
                <View style={{flex: 1, marginLeft: 20, justifyContent: 'center'}}>
                    <View><Text style={{fontSize: 16, color: "#353535"}} numberOfLines={1}>{item.paper_title}</Text></View>
                    {item.score_exception ?
                        <View style={{marginTop: 10}}>
                            <Text style={{fontSize: 14, color: "#30cc75"}}>点击此处上传答案</Text>
                        </View>
                        :
                        <View style={{flexDirection: 'row', marginTop: 10}}>
                            <View style={{flexDirection: 'row', width: 90, alignItems: 'center'}}>
                                <Image source={require('./../../assets/common/wancheng.png')}
                                       style={{width: 12, height: 12}}/>
                                <Text style={{
                                    marginLeft: 6,
                                    fontSize: 12,
                                    color: '#858585'
                                }}>进度：{parseInt(item.exam_process * 100)}%</Text>
                            </View>
                            <View style={{flexDirection: 'row', marginLeft: 18, alignItems: 'center'}}>
                                <Image source={require('./../../assets/common/jifen.png')}
                                       style={{width: 12, height: 12}}/>
                                <Text style={{
                                    marginLeft: 6,
                                    fontSize: 12,
                                    color: "#858585"
                                }}>得分：{(+item.score).toFixed(1)}</Text>
                            </View>
                        </View>
                    }
                </View>

            </View>
        )
    }
}