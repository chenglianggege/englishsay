import React, { Component } from 'react';
import Header from './../common/Header'
import BaseComponent from "./../../libs/BaseComponent";
import {
    StyleSheet,
    View,
    Alert,
    Text,
    Image
} from 'react-native';
import { Button } from 'react-native-elements'

export default class Userleave extends BaseComponent {
    render() {
        return (
            <View style={{height: '100%', backgroundColor: '#fff'}}>
                <Header title="注销账号" onPress={()=>this.props.navigation.goBack()}/>
                <View style={{marginTop: 40,flexDirection:'row',justifyContent:'center'}}>
                    <Image style={{width: 110,height: 125}} source={require('./../../assets/personal/zhongyaotihsi.png')}/>
                </View>
                <View style={{paddingLeft:30,paddingRight:30}}>
                    <Text style={{marginTop:5,fontSize:16,textAlign:'center',color:'#353535',fontWeight:'bold'}}>重要提示</Text>
                    <Text style={{marginTop:20,fontSize:14,lineHeight:21}}>1.注销英语说账号是<Text style={{color:"#f44116"}}>不可逆</Text>的操作!</Text>
                    <Text style={{fontSize:14,lineHeight:21}}>2.注销后，在学生端APP和PC上均无法使用该账号登录。</Text>
                    <Text style={{fontSize:14,lineHeight:21}}>3.注销后，资源内容、班级关系、作业、练习等所有用户数据将被清除。</Text>
                    <Text style={{fontSize:14,lineHeight:21}}>4.在学习卡到期前注销账号，购卡费用将不予退回</Text>
                </View>
                <View style={{paddingLeft:30,paddingRight:30}}>
                    <Button
                        onPress={()=> this.props.navigation.push('Userleavelast')}
                        buttonStyle={{height: 49, backgroundColor:"#fff",borderColor:'#30CC75',borderWidth:1,borderRadius:8}}
                        textStyle={{fontSize: 16, color: "#30CC75"}}
                        title="申请注销"
                        type="outline"
                        containerViewStyle={{marginLeft: 0, marginRight: 0, marginTop: 30}}
                    />
                </View>
                
            </View>
        )
    }
}

const styles = StyleSheet.create({
})