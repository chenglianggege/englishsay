import React, { Component } from 'react';
import {
    View,
    FlatList,
    Image,
    StyleSheet,
    TouchableHighlight,
    Platform,
    Text,
    DeviceEventEmitter,
    Dimensions, Alert
} from 'react-native'
import axios from 'axios';
import Header from './common/Header'
import Toast, {DURATION} from 'react-native-easy-toast'
import BaseComponent from './../libs/BaseComponent'
var Progress = require('react-native-progress');
import {LoaderScreen} from 'react-native-ui-lib'
const {height, width} = Dimensions.get('window');
import RNFS from "react-native-fs";
import Download from './common/Download'
import NoNet from "./common/NoNet";

export default class Units extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            listData: [],
            total: 0,
            loading:false,
            page: 1,
            refreshing: true,
            loadOnEndReached: true,
            netError: false
        }
    }

    async componentDidMount() {
        this._isMounted = true
        this._getUnits()
    }
    componentWillUnmount() {
        this._isMounted = false
    }

    render () {
        // console.log('render:this.state.refreshing', this.state.refreshing)
        const {loading, netError} =  this.state
        return (
            <View style={{flex: 1, backgroundColor: "#f5f5f5"}}>
                <Header title="课文跟读" onPress={()=>this.props.navigation.goBack()}/>
                {loading ? <LoaderScreen message="正在加载内容,请稍后..." overlay/> : null}
                {netError ? <NoNet onPress={()=>this._getUnits()} /> : null}
                {!loading && !netError ?
                <FlatList
                    extraData={this.state}
                    ItemSeparatorComponent={()=><View style={{flexDirection: 'row',alignItems: 'center', justifyContent: 'center'}}><View style={{height:1,backgroundColor:'#efefef', borderRadius: 1, width: '95%'}}/></View>}
                    keyExtractor={(item)=>item.unit_id}
                    data={this.state.listData}
                    renderItem={({item, index})=> this._renderItem(item, index)}
                    ListEmptyComponent={this._renderListEmpty}
                /> :null}
                <Toast ref="toast" position="center"/>
            </View>
        );
    }
    _renderItem (item,index) {
        return (
            <View key={item.unit_id} style={{alignSelf: 'center', marginTop: 10}}>
                <TouchableHighlight  onPress={()=>this._toSent(item)} underlayColor="#fff">
                    <View style={{flexDirection: 'row', height: 79, width: width - 20, backgroundColor: "#fff", borderRadius: 4}}>
                        <View style={{width: 54}}>
                            <Image style={{width: 54, height: 79}} source={require('../assets/sent/kewenicon.png')}/>
                        </View>
                        <View style={{marginLeft: 15}}>
                            <Text style={{fontSize: 16, color: "#353535", marginTop: 13}} numberOfLines={1}>{item.unit_name}</Text>
                            <Text style={{fontSize: 12, color: "#858585", width: width - 70, marginTop: 15}}>{item.paper_num}篇课文</Text>
                        </View>

                    </View>
                </TouchableHighlight>
            </View>
        );
    }
    _renderListEmpty = ()=>{
        return  (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Image source={require('./../assets/homework/meishoudaozuoye.png')} style={{width: 263}}/>
                <View  style={{alignItems: 'center', justifyContent: 'center'}}>
                    <Text>莫急~ 内容正在路上，还有几站地就到 ~</Text>
                </View>
            </View>
        );
    }
    async _getUnits () {
        if (this.loading){
            return
        }
        try {
            this.loading = true
            this.setState({loading: true})
            let listData = await axios.get(global.API_HOST + '/v2/student/exercise/list/units',{
                params: {}
            })
            this.setState({netError: false})
            if (listData.data.retCode === 0) {
                listData = listData.data.retData || []
                this.setState({listData: listData})
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
            this.loading = false
            this.setState({loading: false})
        }
    }

    async _toSent(item){
        this.props.navigation.navigate({routeName: 'Sent', params: item})
    }
    _toBack () {
        this.props.navigation.goBack()
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
    itemRt: {
        flexDirection: 'column',
        height: 150,
        width: width - 170,
    }
})