import React, { Component } from 'react';
import Header from './common/Header'
import {
    Platform,
    StyleSheet,
    Text,
    View,Switch,
    TouchableOpacity,
    TouchableHighlight, ScrollView,
    Image, Dimensions, StatusBar, Alert, Linking
} from 'react-native';
import { Button, Avatar ,List, ListItem} from 'react-native-elements'
import ImagePicker from 'react-native-image-picker';
import axios from 'axios';
import Toast, {DURATION} from 'react-native-easy-toast'
import {LoaderScreen, Dialog, ActionSheet} from 'react-native-ui-lib';
import {checkUpdate, downloadUpdate, packageVersion, switchVersion,} from 'react-native-update';
import _updateConfig from './../update.json';
import RNFS from "react-native-fs";
import DeviceBrightness from 'react-native-device-brightness'

const {appKey} = _updateConfig[Platform.OS];
const version = 'v ' + (packageVersion ? packageVersion : '1.0.0')

const {height, width} = Dimensions.get('window');

export default class Personal extends Component {
    constructor(props) {
        super(props);
        this.state = {value:false,brightnessOld: 0,userInfo: {},isAskupdate: {}, loading: false, loadingStr: "",showTest: false, showActionSheet: false, agentInfo : null, appStoreReview: true, cacheSize: '0M'}
    }
    
    componentDidMount() {
        
        let _this = this
        this._navListener = this.props.navigation.addListener('didFocus', async () => {
            let userInfo = await global.storage.load({key: 'userInfo'})
            let agentInfo = await global.storage.load({key: 'agentInfo'})
            let appStoreReview = await global.storage.load({key: 'appStoreReview'})
            let askToken = await global.storage.load({key: 'token'})
            let isAskupdate = await axios.get(global.API_HOST + '/v2/software/update',{params: {token: askToken ,package_version:packageVersion ,system:Platform.OS}})
            
            
            _this.setState({userInfo: userInfo, agentInfo: agentInfo, appStoreReview: appStoreReview, isAskupdate:isAskupdate})
            _this._getCacheSize()

            let brightNessNumnow = await DeviceBrightness.getBrightnessLevel()
            DeviceBrightness.getBrightnessLevel().then(function(vava){
                console.log(brightNessNumnow,vava,"我不是你爸爸")
            })
        })
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
        this._navListener.remove();
    }
    render() {
        const {userInfo, cacheSize, showTest} =  this.state
        if (!userInfo.hasOwnProperty('user_id')){
            return null
        }
        let card_setting = JSON.parse(userInfo.study_card.card_setting)
        let card_auth = userInfo.study_card && +userInfo.study_card.card_auth
        let passPhone = userInfo.user_phone.substr(0, 3) + '****' + userInfo.user_phone.substr(-4);
        let time = new Date(userInfo.study_card.expire_time.replace(/-/g, '/'))
        let expire_time = time.getFullYear() + '年' + (time.getMonth() + 1) + '月' + time.getDate() + '日到期'
        return (
            <View style={{flex: 1, backgroundColor:"#f5f5f5"}}>
                <StatusBar translucent={true} backgroundColor='transparent' barStyle="dark-content"/>
                <View style={{width: width, height: 130, alignItems: 'center'}}>
                    <Image style={[{width: width, height: 130}]} source={require('./../assets/personal/gerenbeijing.png')}/>
                    <Text style={{fontSize: 20, color: "#fff", position: 'absolute', marginTop: 30}}>个人中心</Text>
                </View>
                <View style={{width: width - 20, borderRadius: 4, backgroundColor: "#ffffff", marginLeft: 10, marginTop: -55, height: 90, flexDirection: 'row' ,alignItems: 'center'}}>
                    <Avatar
                        rounded
                        source={userInfo.user_avatar ? {uri:userInfo.user_avatar + '?x-oss-process=style/111', cache:"force-cache"} :require('./../assets/personal/xueshengtouxiang.png')}
                        onPress={() => this._imagePicker()}
                        activeOpacity={0.7}
                        containerStyle={{marginLeft: 20}}
                        height={60}
                    />
                    <View style={{marginLeft: 10, flex: 1}}>
                        <Text style={{fontSize: 16, color: "#353535"}}>{userInfo['user_name'] ? userInfo['user_name']: userInfo['user_phone']}</Text>
                        <Text style={{fontSize: 14, color: "#aaaaaa", marginTop: 5}}>英语说陪你学习{userInfo['reg_days']}天啦</Text>
                    </View>
                    {userInfo.class_info && userInfo.class_info.hasOwnProperty('class_name') ?
                    <View style={{backgroundColor: 'rgba(47, 204, 117, 0.2)', height: 22, borderRadius: 4, flexDirection: 'row', alignSelf: 'flex-start',marginTop: 20, paddingRight: 5, paddingLeft: 10, alignItems: 'center'}}>
                        <Image source={require('./../assets/personal/banji1.png')} style={{width: 16, height: 13}} />
                        <Text style={{lineHeight: 22,fontSize: 12, color: "#30cc75", marginLeft: 5}}>{userInfo.class_info.class_name}</Text>
                    </View>: null}
                </View>
                <ScrollView>
                    <List containerStyle={{marginTop:10, borderTopColor: "#e9e9e9"}}>
                        {+card_setting.module_type ===  1 ?
                        <ListItem
                            title='加入班级'
                            leftIcon={<Image source={require('./../assets/personal/banji.png')} style={styles.menuIcon} />}
                            underlayColor="#f5f5f5"
                            titleStyle={[styles.menuText]}
                            containerStyle={styles.menu}
                            rightIcon={{name: 'chevron-small-right', type: "entypo"}}
                            onPress={()=> this._toJoinClass()}
                        /> : null}
                        {card_auth ?
                        <ListItem
                            title='我的学习卡'
                            leftIcon={<Image source={require('./../assets/personal/xuexika.png')} style={styles.menuIcon} />}
                            underlayColor="#f5f5f5"
                            titleStyle={[styles.menuText]}
                            containerStyle={styles.menu}
                            rightTitle={expire_time}
                            rightTitleStyle={styles.rightTitleStyle}
                            rightIcon={{name: 'chevron-small-right', type: "entypo"}}
                            onPress={()=> this._toStudyCard()}
                        />
                            : null}
                    </List>

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
                        <ListItem
                            title='注销账号'
                            leftIcon={<Image source={require('./../assets/personal/zhuxiaozhanghao.png')} style={styles.menuIcon} />}
                            underlayColor="#f5f5f5"
                            titleStyle={[styles.menuText]}
                            containerStyle={styles.menu}
                            rightIcon={{name: 'chevron-small-right', type: "entypo"}}
                            onPress={()=> this.props.navigation.push('Userleave')}
                        />
                    </List>
                    <List containerStyle={{marginTop:10, borderTopColor: "#e9e9e9"}}>
                        <ListItem
                            title='护眼模式'
                            leftIcon={<Image source={require('./../assets/personal/huyan.png')} style={styles.menuIcon} />}
                            underlayColor="#f5f5f5"
                            titleStyle={[styles.menuText]}
                            containerStyle={styles.menu}
                            rightIcon={<Switch
                                value={this.state.value}
                                onValueChange={(value)=>this._toSent1(value)}
                            />}
                        />
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
                            title='检查更新'
                            leftIcon={<Image source={require('./../assets/personal/gengxin.png')} style={styles.menuIcon} />}
                            underlayColor="#f5f5f5"
                            titleStyle={[styles.menuText]}
                            containerStyle={styles.menu}
                            rightTitle={version}
                            rightTitleStyle={styles.rightTitleStyle}
                            rightIcon={{name: 'chevron-small-right', type: "entypo"}}
                            onPress={()=> this._checkUpdate()}
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
                    <List containerStyle={{marginTop:10, borderTopColor: "#e9e9e9"}}>
                        <ListItem
                            title='用户协议'
                            leftIcon={<Image source={require('./../assets/personal/yonghuxieyi.png')} style={styles.menuIcon} />}
                            underlayColor="#f5f5f5"
                            titleStyle={[styles.menuText]}
                            containerStyle={styles.menu}
                            rightIcon={{name: 'chevron-small-right', type: "entypo"}}
                            onPress={()=> this.props.navigation.push('Useragreement')}
                        />
                        <ListItem
                            title='隐私权政策'
                            leftIcon={<Image source={require('./../assets/personal/yinsi.png')} style={styles.menuIcon} />}
                            underlayColor="#f5f5f5"
                            titleStyle={[styles.menuText]}
                            containerStyle={styles.menu}
                            rightIcon={{name: 'chevron-small-right', type: "entypo"}}
                            onPress={()=> this.props.navigation.push('Userprivacy')}
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
                {this.state.loading ? <LoaderScreen message={this.state.loadingStr}  overlay/> : null}
            </View>

        )
    }
    
    async _toSent1(v) {
        try{
            //await global.storage.save({key: 'brightNessValue', data: v})
        }catch(e){

        }
        this.setState({value: v})
        //console.log(v,'之前亮度'+this.state.brightnessOld)
        if(v){
            console.log(v,'第一个V')
            DeviceBrightness.setBrightnessLevel(0.3)
        }else{
            console.log(v,'第er个V')
            DeviceBrightness.setBrightnessLevel(0.8)
        }
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
    _toBack () {
        this.props.navigation.goBack()
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
    _toJoinClass () {
        let {userInfo} = this.state
        let isBindCard = userInfo.study_card && userInfo.study_card.expire_status === 1
        if (!isBindCard){
            return this.refs.toast.show('请绑定学习卡，解锁功能后使用！')
        }
        this.props.navigation.push('JoinClass')
    }
    _toStudyCard () {
        let {userInfo} = this.state
        let isBindCard = userInfo.study_card && userInfo.study_card.expire_status === 1
        if (isBindCard){
            this.props.navigation.push('StudyCard')
        } else{
            this.props.navigation.push('AddStudyCard')
        }
    }
    _toSetting(){
        this.props.navigation.push('Setting')
    }
    _showTest(){
        this.setState({showTest: true})
    }
    _toTest(){
        this.setState({showTest: false})
        this.props.navigation.push('Test')
    }
    _toConnect(){
        this.setState({showActionSheet: true})
    }
    _imagePicker () {
        const options = {
            title:'请选择',
            quality: 0.8,
            maxWidth: 500,
            maxHeight: 500,
            cancelButtonTitle:'取消',
            takePhotoButtonTitle:'拍照',
            chooseFromLibraryButtonTitle:'选择相册',
            allowsEditing: true,
            storageOptions: {
                skipBackup: true
            }
        };
        let _this = this
        ImagePicker.showImagePicker(options, async (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                // let source = { uri: response.uri };

                // You can also display the image using data:
                // let source = { uri: 'data:image/jpeg;base64,' + response.data };
                _this.setState({loading:true, loadingStr: '正在上传头像...'})
                // console.log('source',source, response)
                let formdata = new FormData();
                let index1 = response.uri.lastIndexOf(".");
                let index2 = response.uri.length;
                let suffix = response.uri.substring(index1 + 1, index2); //后缀名
                let fileName = '1.' + suffix

                formdata.append('file', {uri: response.uri, name: fileName, type: 'multipart/form-data',});
                try {
                    let res = await axios.post(API_HOST + '/v2/user/info/upload-avatar', formdata,{'Content-Type': 'application/x-www-form-urlencoded'})
                    console.log(res.data)
                    if (res.data.retCode === 4001) {
                        console.log('personal login')
                        _this.props.navigation.navigate({routeName: 'Login', params: {kickass: true}});
                        return
                    }
                    if (res.data.retCode !== 0){
                        this.refs.toast.show('头像上传失败，请换张图片吧！');
                        return
                    }
                    await axios.post(API_HOST + '/v2/user/info/save', {user_avatar: res.data.retData.static})
                    if (res.data.retCode !== 0){
                        return this.refs.toast.show('头像上传失败！' + res.data.retMsg);
                    }
                    let userInfo = await axios.get(global.API_HOST + '/v2/student/info')
                    if (userInfo.data.retCode === 0) {
                        _this.setState({userInfo: userInfo.data.retData})
                        await global.storage.save({key: 'userInfo', data: userInfo.data.retData})
                        this.refs.toast.show('头像上传成功！');
                    }

                }catch (e) {
                    console.log(e)
                    this.refs.toast.show('网络通讯错误，请检查网络！');
                }finally {
                    _this.setState({loading:false})
                }
            }
        });
    }
    _checkUpdate(){
        const {isAskupdate} =  this.state
        //在热更新的基础上，后台控制版本更新与否
        let ourAskupdata = isAskupdate.data.retData.is_update
        
        this.setState({loading:true, loadingStr: '正在检查更新...'})
        let _this = this
        checkUpdate(appKey).then(info => {
            console.log(info)
            if (info.upToDate === true) {
                _this.setState({loading:false})
                Alert.alert('检查更新', '当前应用版本已是最新版本');
                return
            }
            //已经有最新版本，后台还未提示更新。
            if (info.expired === true && ourAskupdata === 0) {
                _this.setState({loading:false})
                Alert.alert('检查更新', '当前应用版本已是最新版本');
                return
            }
            if (info.expired === true && ourAskupdata === 1) {
                _this.setState({loading:false})
                Alert.alert('检查更新', '发现新版本！请点击“好”前往下载，不及时更新会影响使用哦~',
                    [
                        {text: '好', onPress: ()=> toUpdate(info.downloadUrl)}
                    ])
            }

            if (info.update === true && ourAskupdata === 1) {
                this._doUpdate(info)
            }
        }).catch(err => {
            this.setState({loading:false})
            Alert.alert('检查更新', '检查更新失败，请检查网络',[
                {text: '重试', onPress: ()=>this._checkUpdate()},
                {text: '取消', style: 'cancel'},
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
