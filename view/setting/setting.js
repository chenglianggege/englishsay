import React, { Component } from 'react';
import Header from './../common/Header'
import BaseComponent from "./../../libs/BaseComponent";
import { Button ,List, ListItem } from 'react-native-elements'
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    TouchableHighlight,
    Image,
    ScrollView,
    Alert,
    Keyboard, Linking
} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import {LoaderScreen} from 'react-native-ui-lib';
import axios from 'axios';
import {
    isFirstTime,
    isRolledBack,
    packageVersion,
    currentVersion,
    checkUpdate,
    downloadUpdate,
    switchVersion,
    switchVersionLater,
    markSuccess,
} from 'react-native-update';
import _updateConfig from './../../update.json';
const {appKey} = _updateConfig[Platform.OS];
const version = 'v ' + (packageVersion ? packageVersion : '1.0.0')
import RNFS from 'react-native-fs';

export default class Setting extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {loading:false, isAskupdate:{}, loadingStr: '', cacheSize: '0M', appStoreReview: false}
    }
    async componentDidMount(){
        this._getCacheSize()
        let appStoreReview = await global.storage.load({key: 'appStoreReview'})
        let askToken = await global.storage.load({key: 'token'})
        let isAskupdate = await axios.get(global.API_HOST + '/v2/software/update',{params: {token: askToken ,package_version:packageVersion ,system:Platform.OS}})
            
        this.setState({appStoreReview: appStoreReview,isAskupdate:isAskupdate})
    }
    _getCacheSize (){
        let _this = this
        RNFS.readDir(PAPER_BASE_PATH).then(result => {
            //Log(result)
            let size = 0
            for (let i in result){
                size += result[i].size
            }
            _this.setState({cacheSize: (size / 1024 / 1024) .toFixed(2) + "M"})
        }).catch(e=>{})
    }
    componentWillUnmount() {}
    render() {
        return (
            <View style={{height: '100%'}}>
                <Header title="账号设置" onPress={()=>this.props.navigation.goBack()}/>
                <List containerStyle={{marginBottom: 20, marginTop:0, borderTopColor: "#f8f8f8"}}>
                    <ListItem
                        title='修改密码'
                        onPress={()=> this._toPasswd()}
                        underlayColor="#e9e9e9"
                        titleStyle={[styles.menuText]}
                        containerStyle={styles.menu}
                    />
                    <ListItem
                        title='更换手机号'
                        onPress={()=> this._toPhone()}
                        underlayColor="#e9e9e9"
                        titleStyle={[styles.menuText]}
                        containerStyle={styles.menu}
                    />
                    <ListItem
                        title='修改姓名'
                        onPress={()=> this._toUsername()}
                        underlayColor="#e9e9e9"
                        titleStyle={[styles.menuText]}
                        containerStyle={styles.menu}
                    />
                    {!this.state.appStoreReview ?
                    <ListItem
                        title='检查更新'
                        onPress={()=> this._checkUpdate()}
                        rightTitle={version}
                        underlayColor="#e9e9e9"
                        titleStyle={[styles.menuText]}
                        containerStyle={styles.menu}

                    />: null}
                    <ListItem
                        title='清除缓存'
                        onPress={()=> this._toClear()}
                        underlayColor="#e9e9e9"
                        titleStyle={[styles.menuText]}
                        containerStyle={styles.menu}
                        rightTitle={this.state.cacheSize}
                    />
                </List>

                <Button
                    onPress={()=> this._toLogout()}
                    buttonStyle={{height: 56, backgroundColor:"#fff"}}
                    textStyle={{fontSize: 18, color: "#e95319"}}
                    title="退出账号"
                    containerViewStyle={{marginLeft: 0, marginRight: 0}}
                />
                {this.state.loading ? <LoaderScreen message={this.state.loadingStr}  overlay/> : null}
            </View>
        )
    }
    _toPasswd (){
        this.props.navigation.push('Passwd')
    }
    _toPhone (){
        this.props.navigation.push('Phone')
    }
    _toUsername (){
        this.props.navigation.push('Username')
    }
    _toClear (){
        Alert.alert('清除缓存','清除缓存后试卷等数据需要重新下载',[
            {text: '取消', style: 'cancel'},
            {text: '确认清除', onPress: async () => {
                    RNFS.readDir(PAPER_BASE_PATH).then( async (result)=> {
                        Log(result)
                        for (let i in result){
                            try {
                                await RNFS.unlink(result[i].path)
                            }catch (e) {}
                        }
                    }).catch(e=>{}).finally(()=>{
                        try {
                            global.storage.clearMapForKey('PaperDownProcess')
                        }catch (e) {}
                        this._getCacheSize()
                        Alert.alert('清除缓存','缓存清理完成')
                    })
                }},
        ],{ cancelable: false })
    }
    _toBack () {
        this.props.navigation.goBack()
    }
    _toLogout(){
        Alert.alert('退出账号','确认退出?',[
            {text: '取消', style: 'cancel'},
            {text: '确认', onPress: async () => {
                    await global.storage.remove({key: 'token'})
                    await global.storage.remove({key: 'userInfo'})
                    this.props.navigation.replace('Login')
                }},
        ],{ cancelable: false })
    }
    _checkUpdate(){
        this.setState({loading:true, loadingStr: '正在检查更新...'})
        //在热更新的基础上，后台控制版本更新与否
        const {isAskupdate} =  this.state
        let ourAskupdata = isAskupdate.data.retData.is_update

        let _this = this
        checkUpdate(appKey).then(info => {
            console.log(info)
            if (info.upToDate === true) {
                _this.setState({loading:false})
                Alert.alert('提示', '当前应用版本已是最新版本');
                return
            }
            //已经有最新版本，后台还未提示更新。
            if (info.expired === true && ourAskupdata === 0) {
                _this.setState({loading:false})
                Alert.alert('提示', '当前应用版本已是最新版本');
                return
            }
            if (info.expired === true && ourAskupdata === 1) {
                _this.setState({loading:false})
                Alert.alert('提示', '您的应用版本已更新,请前往应用商店下载新的版本！',
                    [
                        {text: '好', onPress: ()=>{Linking.openURL(info.downloadUrl).catch(err => console.error('An error occurred', err));}}
                    ])
            }

            if (info.update === true && ourAskupdata === 1) {
                this._doUpdate(info)
            }
        }).catch(err => {
            this.setState({loading:false})
            Alert.alert('提示', '检查更新失败，请检查网络',[
                {text: '重试', onPress: ()=>this._checkUpdate()}
            ]);
        });
    }
    _doUpdate(info){
        this.setState({loading:true, loadingStr: '正在更新到v' + info.name + '...'})
        downloadUpdate(info).then(hash => {
            Alert.alert('提示', '更新完毕,请重启应用', [
                {text: '好', onPress: ()=>{switchVersion(hash);}}
            ]);
        }).catch(err => {
            //console.log('_doUpdate err:', err)
            LogServer('MANUAL_DO_UPDATE_ERR', err)
            this.setState({loading:false})
            Alert.alert('提示', '更新失败，请检查网络');
        });
    }
}
const styles = StyleSheet.create({
    menu: {
        marginTop: 0, borderBottomColor: "#e9e9e9"
    },
    menuText:{
        fontSize: 18,
        color: "#595959"
    },
    underLine:{
        height: 1,
    },

})
