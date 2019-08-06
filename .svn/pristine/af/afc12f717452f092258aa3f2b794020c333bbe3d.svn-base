import React, { Component } from 'react';
import {View, ScrollView, Image, StyleSheet, TouchableOpacity, Platform, Text, Dimensions, TouchableHighlight, FlatList} from 'react-native'
import axios from 'axios';
import Header from './common/Header'
import Toast, {DURATION} from 'react-native-easy-toast'
import BaseComponent from './../libs/BaseComponent'
const {height, width} = Dimensions.get('window');
import {LoaderScreen} from 'react-native-ui-lib'
import NoNet from "./common/NoNet";

export default class TSZX extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {userInfo: {},listData: [], loading:false,  netError: false}
    }
    async componentDidMount() {
        this._getQsTypes()
    }
    render () {
        const {loading, netError} =  this.state
        return (
            <View style={{flex: 1, backgroundColor: "#f5f5f5"}}>
                <Header title="听说专项" onPress={()=>this.props.navigation.goBack()}/>
                {loading ? <LoaderScreen message="正在加载内容,请稍后..." overlay/> : null}
                {netError ? <NoNet onPress={()=>this._getQsTypes()} /> : null}
                {!loading && !netError ?
                <FlatList
                    extraData={this.state}
                    ItemSeparatorComponent={()=><View style={{flexDirection: 'row',alignItems: 'center', justifyContent: 'center'}}><View style={{height:1,backgroundColor:'#efefef', borderRadius: 1, width: '95%'}}/></View>}
                    keyExtractor={(item)=>String(item.qs_type_id)}
                    data={this.state.listData}
                    renderItem={({item, index})=> this._renderItem(item, index)}
                    ListEmptyComponent={()=>this._renderListEmpty()}
                />: null}
                <Toast ref="toast" position="center"/>
            </View>
        );
    }
    async _getQsTypes () {
        try {
            this.setState({loading: true})
            let listData = await axios.get(global.API_HOST + '/v2/student/exercise/list/types')
            this.setState({netError: false})
            //console.log('listData', listData)
            if (listData.data.retCode === 0) {
                this.setState({listData: listData.data.retData ? listData.data.retData : []})
                return
            }
            this.refs.toast.show(listData.data.retMsg);
        }catch (e) {
            if (e.message === 'Network Error'){
                this.setState({netError: true})
            } else{
                this.refs.toast.show('网络通讯错误，请检查网络！');
            }
        }finally {
            this.setState({loading: false})
        }

    }
    _renderListEmpty(){
        return  (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Image source={require('./../assets/homework/meishoudaozuoye.png')} style={{width: 263}}/>
                <View  style={{alignItems: 'center', justifyContent: 'center'}}>
                    <Text>莫急~ 内容正在路上，还有几站地就到 ~</Text>
                </View>
            </View>
        );
    }
    _renderListFooter(){
        const {listData} = this.state
        if (listData.length === 0){
            return null
        }
        return (
            <View style={{marginTop: 10,alignItems: 'center', justifyContent: 'center'}}>
                <View style={{height:1,backgroundColor:'#efefef', borderRadius: 1, width: '95%'}}/>
                <Text style={{marginTop: 10, marginBottom: 10}}>已经全部加载完毕</Text>
            </View>

        )
    }
    _renderList () {
        return this.state.listData.map( item => this._renderItem(item) );
    }
    _renderItem (item, index) {
        return (
            <View key={item.qs_type_id} style={{alignSelf: 'center', marginTop: 10}}>
                <TouchableHighlight  onPress={()=>this._toPaperList(item.qs_type_id, item.qs_type_name)} underlayColor="#fff">
                    <View style={{flexDirection: 'row', height: 79, width: width - 20, backgroundColor: "#fff", borderRadius: 4}}>
                        <View style={{width: 54}}>
                            <Image style={{width: 54, height: 79}} source={require('../assets/tszx/zhuanxiang1.png')}/>
                        </View>
                        <View style={{marginLeft: 15}}>
                            <Text style={{fontSize: 16, color: "#353535", marginTop: 13}} numberOfLines={1}>{item.qs_type_name}</Text>
                            <Text style={{fontSize: 12, color: "#858585", width: width - 70, marginTop: 15}}>{item.paper_num}道题目</Text>
                        </View>

                    </View>
                </TouchableHighlight>
            </View>
        );
    }
    _toPaperList (qsTypeId, qsTypeName) {
        this.props.navigation.navigate({routeName: 'TSZXPaper', params: {qsType: qsTypeId, qsTypeName: qsTypeName}})
    }
}

const styles = StyleSheet.create({
    item: {
        marginTop:11,
        marginBottom: 11,
        marginLeft:10,
    },
    itemImg: {
        borderRadius: 11,
        width: (width - 40) / 3,
        height: (width - 40) / 3 / 213 * 250,
    },
    itemName: {
        width: (width - 40) / 3 - 22,
        position: 'absolute',
        marginLeft: 20,
        marginTop: 18,
        fontSize: 15,
        color: "#ffffff"
    }
})