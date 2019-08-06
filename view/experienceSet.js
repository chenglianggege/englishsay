import React, { Component } from 'react';
import Header from './common/Header'
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image, Alert
} from 'react-native';
import { Button ,List, ListItem} from 'react-native-elements'
import Toast from 'react-native-easy-toast'
import { Dialog } from 'react-native-ui-lib';
import _updateConfig from './../update.json';
import RNFS from "react-native-fs";

export default class experienceSet extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            userInfo: {}, 
            loading: false, 
            loadingStr: "",
            showTest: false, 
            showActionSheet: false, 
            agentInfo : null,
            cacheSize: '0M'
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
        this._getCacheSize()
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
    componentWillUnmount() {
        
    }
    _toLogout(){
        Alert.alert('退出账号','确认退出?',[
            {text: '取消', style: 'cancel'},
            {text: '确认', onPress: async () => {
                    await global.storage.remove({key: 'token'})
                    await global.storage.remove({key: 'userInfo'})
                    //this.props.navigation.replace('Login')
                    this.props.navigation.navigate({routeName: 'Login'});
                }},
        ],{ cancelable: false })
    }
    _toClear (){
        let _this = this
        Alert.alert('清除缓存','清除缓存后试卷等数据需要重新下载',[
            {text: '取消', style: 'cancel'},
            {text: '确认清除', onPress: async () => {
                    _this.setState({loading:true, loadingStr: '正在清除缓存...'})
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
                        _this.setState({loading:false})
                        this._getCacheSize()
                        Alert.alert('清除缓存','缓存清理完成')
                    })
                }},
        ],{ cancelable: false })
    }
    _toLogout(){
        Alert.alert('退出账号','确认退出?',[
            {text: '取消', style: 'cancel'},
            {text: '确认', onPress: async () => {
                    await global.storage.remove({key: 'token'})
                    await global.storage.remove({key: 'userInfo'})
                    //this.props.navigation.replace('Login')
                    this.props.navigation.navigate({routeName: 'Login'});
                }},
        ],{ cancelable: false })
    }
    _showTest(){
        this.setState({showTest: true})
    }
    _renderTestDialog() {
        return (
            <View style={{backgroundColor:"#fff", borderWidth: 4, borderColor:"#30cc75", alignItems: 'center'}}>
                <View style={{justifyContent:'center', marginTop: 10}}>
                    <Text style={{textAlign:'center', fontSize: 18}}>注意事项</Text>
                </View>
                <View style={{height: 1, backgroundColor: "#e9e9e9", width:"100%", marginTop: 10}} />
                <View style={{marginTop: 10, width: 270}}>
                    <Text style={{fontSize: 16, marginTop:10}}>1、请确认你手机声音已经打开，或耳机已经连接好。</Text>
                    <Text style={{fontSize: 16, marginTop:20}}>2、请确认你的麦克风权限已经打开。</Text>
                    <Text style={{fontSize: 16, marginTop:20}}>3、在WIFI网络下使用，体验会更好。</Text>
                </View>
                <View style={{flexDirection: 'row', marginTop: 50}}>
                    <Button
                        buttonStyle={{ width: 120, height: 44, borderRadius: 1,borderWidth: 1, borderColor:"#30cc75", backgroundColor: "#fff"}}
                        textStyle={{fontSize: 17, color: "#30cc75"}}
                        title="取消测试"
                        onPress={()=> this.setState({showTest: false})}
                    />
                    <Button
                        buttonStyle={{ width: 120, height: 44, borderRadius: 1, borderColor:"#fff", backgroundColor: "#30cc75"}}
                        textStyle={{fontSize: 17, color: "#fff"}}
                        title="开始测试"
                        onPress={()=> this._toTest()}
                    />
                </View>
                <View style={{height: 10, backgroundColor: "#fff", marginTop: 10}} />
            </View>
        );
    }
    _toTest(){
        this.setState({showTest: false})
        this.props.navigation.push('Test')
    }
    render () {
        const {userInfo, cacheSize, showTest} =  this.state
        if (!userInfo.hasOwnProperty('user_id')){
            return null
        }
        let passPhone = userInfo.user_phone.substr(0, 3) + '****' + userInfo.user_phone.substr(-4);
        
        return (
            <View style={{flex: 1, backgroundColor: "#f5f5f5"}}>
                <Header title="设置" onPress={()=>this.props.navigation.goBack()}/>
                <ScrollView>
                    <List containerStyle={{marginTop:10, borderTopColor: "#e9e9e9"}}>
                        <ListItem
                            title='更换手机号'
                            leftIcon={<Image source={require('./../assets/personal/shoujihao.png')} style={styles.menuIcon} />}
                            underlayColor="#f5f5f5"
                            titleStyle={[styles.menuText]}
                            containerStyle={styles.menu}
                            rightTitle={passPhone}
                            rightTitleStyle={styles.rightTitleStyle}
                            rightIcon={{name: 'chevron-small-right', type: "entypo"}}
                            onPress={()=> this.props.navigation.push('Phone')}
                        />
                        <ListItem
                            title='修改密码'
                            leftIcon={<Image source={require('./../assets/personal/mima.png')} style={styles.menuIcon} />}
                            underlayColor="#f5f5f5"
                            titleStyle={[styles.menuText]}
                            containerStyle={styles.menu}
                            rightIcon={{name: 'chevron-small-right', type: "entypo"}}
                            onPress={()=> this.props.navigation.push('Passwd')}
                        />
                        <ListItem
                            title='修改姓名'
                            leftIcon={<Image source={require('./../assets/personal/xingming.png')} style={styles.menuIcon} />}
                            underlayColor="#f5f5f5"
                            titleStyle={[styles.menuText]}
                            containerStyle={styles.menu}
                            rightIcon={{name: 'chevron-small-right', type: "entypo"}}
                            onPress={()=> this.props.navigation.push('Username')}
                        />
                    </List>
                    <List containerStyle={{marginTop:10, borderTopColor: "#e9e9e9"}}>
                        <ListItem
                            title='清空缓存'
                            leftIcon={<Image source={require('./../assets/personal/huancun.png')} style={styles.menuIcon} />}
                            underlayColor="#f5f5f5"
                            titleStyle={[styles.menuText]}
                            containerStyle={styles.menu}
                            rightTitle={cacheSize}
                            rightTitleStyle={styles.rightTitleStyle}
                            rightIcon={{name: 'chevron-small-right', type: "entypo"}}
                            onPress={()=> this._toClear()}
                        />
                        <ListItem
                            title='设备测试'
                            leftIcon={<Image source={require('./../assets/personal/ceshi.png')} style={styles.menuIcon} />}
                            underlayColor="#f5f5f5"
                            titleStyle={[styles.menuText]}
                            containerStyle={styles.menu}
                            rightIcon={{name: 'chevron-small-right', type: "entypo"}}
                            onPress={()=> this._showTest()}
                        />
                    </List>

                    <Button
                        onPress={()=> this._toLogout()}
                        buttonStyle={{height: 56, backgroundColor:"#fff"}}
                        textStyle={{fontSize: 18, color: "#e95319"}}
                        title="退出账号"
                        containerViewStyle={{marginLeft: 0, marginRight: 0, marginTop: 20}}
                    />
                    
                </ScrollView>
                <Dialog width={300} overlayBackgroundColor='rgba(0,0,0,0.5)' visible={showTest} onDismiss={() => this.setState({showTest: false})}>
                    {this._renderTestDialog()}
                </Dialog>
                <Toast ref="toast" position="center"/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    menu: {
        marginTop: 0,borderBottomColor: "#e9e9e9", backgroundColor:"#ffffff"
    },
    menuText:{
        fontSize: 16,
        color: "#353535"
    },
    menuIcon: {
        height: 22,
        width: 22,
        marginLeft: 5,
        marginRight: 15
    },
    rightTitleStyle: {
        color: "#aaaaaa",fontSize: 14,
    }
})