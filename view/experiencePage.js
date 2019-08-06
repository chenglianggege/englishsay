import React, { Component } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Text,
    Dimensions, ScrollView
} from 'react-native'
import Header from './common/Header'
import { Button ,List, ListItem} from 'react-native-elements'
import BuyDialog from "./common/BuyDialog";
import BaseComponent from './../libs/BaseComponent'
const {width} = Dimensions.get('window');

export default class experiencePage extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            userInfo: {},
            listData: [],
            total: 0,
            loading:true,
            page: 1,
            refreshing: true,
            loadOnEndReached: true,
            netError: false
        }
    }

    async componentDidMount() {
        try {
            let userInfo = await global.storage.load({key: 'userInfo'})
            if (userInfo) {
                await this.setState({userInfo: userInfo})
            }
        }catch (e) {

        }
    }
    componentWillUnmount() {
        
    }
    _toWord () {
        this.props.navigation.push('Word')    
    }
    _toSent(){
        this.props.navigation.push('Units')
    }
    _toTSMN () {
        this.props.navigation.push('TSMN')
    }
    
    _toTSZX () {
        this.props.navigation.push('ExperienceTszx')
    }
    _toEXHOMEWORK () {
        this.props.navigation.push('ExperienceHomework')
    }
    render () {
        // console.log('render:this.state.refreshing', this.state.refreshing)
        const {userInfo, loading, netError} =  this.state
        return (
            <View style={{flex: 1, backgroundColor: "#fff"}}>
                <Header title="体验完整版" onPress={()=>this.props.navigation.goBack()}/>

                <View style={{width: width - 20, borderRadius: 4, marginLeft: 10,height: 150,display:'flex',flexDirection:'column',justifyContent:'center'}}>
                    <Image style={{width: '100%'}} source={require('./../assets/experience/shengjibanner.png')}/>
                </View>
                <View style={{width:width-20,marginLeft:10,marginTop:10}}>
                    <Text style={{fontSize: 16,color: "#353535"}}>
                        体验完成版功能
                    </Text>
                </View>
                <ScrollView>
                    <List containerStyle={{marginTop:10, borderTopColor: "transparent"}}>
                        <ListItem
                            onPress={()=> this._toWord()}
                            containerStyle={{borderBottomWidth:0}}
                            leftIcon={<Image source={require('./../assets/experience/dancigendu.png')} style={styles.menuIcon} />}
                            title="单词跟读"
                            subtitle="标准发音例句配图，练习理解两手抓"
                            subtitleStyle={{fontSize: 12,lineHeight: 14,color: "#858585",marginTop:8}}
                            rightIcon={<Image source={require('./../assets/experience/tiyan.png')} style={{marginRight:2}}/>}
                        />
                        <ListItem
                            onPress={()=>this._toSent()}
                            containerStyle={{borderBottomWidth:0}}
                            leftIcon={<Image source={require('./../assets/experience/kewengendu.png')} style={styles.menuIcon} />}
                            title="课文跟读"
                            subtitle="整段课文分段练习，得分高低看颜值"
                            subtitleStyle={{fontSize: 12,lineHeight: 14,color: "#858585",marginTop:8}}
                            rightIcon={<Image source={require('./../assets/experience/tiyan.png')} style={{marginRight:2}} />}
                        />
                        <ListItem
                            onPress={()=>this._toTSMN()}
                            containerStyle={{borderBottomWidth:0}} 
                            leftIcon={<Image source={require('./../assets/home/Group4.png')} style={styles.menuIcon} />}
                            title="听说模拟"
                            subtitle="正规考试流程模拟，轻车熟路全应对"
                            subtitleStyle={{fontSize: 12,lineHeight: 14,color: "#858585",marginTop:8}}
                            rightIcon={<Image source={require('./../assets/experience/tiyan.png')} style={{marginRight:2}} />}
                        />
                        <ListItem
                            onPress={()=>this._toTSZX()}
                            containerStyle={{borderBottomWidth:0}}
                            leftIcon={<Image source={require('./../assets/experience/tingshuomoni.png')} style={styles.menuIcon} />}
                            title="听说专项"
                            subtitle="标准发音例句配图，练习理解两手抓"
                            subtitleStyle={{fontSize: 12,lineHeight: 14,color: "#858585",marginTop:8}}
                            rightIcon={<Image source={require('./../assets/experience/tiyan.png')} style={{marginRight:2}} />}
                        />
                        <ListItem
                            onPress={()=>this._toEXHOMEWORK()}
                            containerStyle={{borderBottomWidth:0}}
                            onPress={()=> this._toEXHOMEWORK()}
                            leftIcon={<Image source={require('./../assets/experience/kehouzuoye.png')} style={styles.menuIcon} />}
                            title="课后作业"
                            titleStyle={{fontSize: 16,lineHeight: 16,color: "#353535"}}
                            subtitle="在家练口语，AI智能评分，准确方便"
                            subtitleStyle={{fontSize: 12,lineHeight: 14,color: "#858585",marginTop:8}}
                            rightIcon={<Image source={require('./../assets/experience/tiyan.png')} style={{marginRight:2}}/>}
                        />
                    </List>
                </ScrollView>
                <BuyDialog userInfo={userInfo} ref="buyDialog" navigation={this.props.navigation}/>
                <View style={{width:width,height:60,position:'relative',borderTopColor:'#efefef',borderTopWidth:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                    <Button
                        onPress={()=> this.refs.buyDialog.toBuy()}
                        buttonStyle={{width: 345, height: 51, borderRadius:4 , backgroundColor: "#2fcc75"}}
                        textStyle={{fontSize: 15, color: "#fff"}}
                        title="升级至完整版"
                    />
                    <Image source={require('./../assets/experience/biaozhi.png')} style={{width:16, height:14, position:"absolute",top:23,left:127}}/>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    item: {
        marginTop:11,
        marginBottom: 11,
        marginLeft:0,
        flexDirection: 'row'
    },
    itemImg: {
        borderRadius: 11,
        width: 138,
        height: 150,
    },
    itemName: {
        flex:1,
        marginLeft: 0,
        marginTop: 22,
        fontSize: 16,
        color: "#555555"
    },
    menuIcon: {
        height: 53,
        width: 53,
        marginLeft: 5,
        marginRight: 10
    },
    itemRt: {
        flexDirection: 'column',
        height: 150,
        width: width - 170,
    }
})