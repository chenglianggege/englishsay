import axios from "axios/index";
import BaseComponent from "./BaseComponent";
import {
    AsyncStorage,
    Platform,
    PermissionsAndroid,
    Dimensions,
    NativeModules,
    BackHandler,
    Linking
} from "react-native";
import Storage from 'react-native-storage';
// import Recorder from 'react-native-skegn'
const RNSkegn = NativeModules.RNSkegn;
import RNFS from 'react-native-fs';

import {
    currentVersion
} from 'react-native-update';
const {height, width} = Dimensions.get('window');
import DeviceInfo from 'react-native-device-info';


global.APP_VERSION = '1.0'
global.AGENT_ID = 1
global.API_HOST = 'http://192.168.0.109:8001'
//global.API_HOST = 'https://api.365speak.cn'
global.PAPER_STATIC_HOST = 'https://exam.17kouyu.com'
// global.PAPER_STATIC_HOST = 'https://stkouyu.oss-cn-hangzhou.aliyuncs.com'https://api.365speak.cn*https://api-cp.17kouyu.com
global.STATIC_HOST = 'https://static.365speak.cn'
global.SCORE_HOST = 'https://result.17kouyu.com/'
if (__DEV__) {
    // global.API_HOST = 'https://api.cp.17kouyu.com'
}
let path = RNFS.DocumentDirectoryPath;

console.log('DocumentDirectoryPath', path)
global.PAPER_BASE_PATH = path + '/paper/' //试卷文件目录
global.EXAM_BASE_PATH = path + '/' //答题结果记录目录
global.EXAM_ATTEND_ITEM_ANSWER = 'EXAM-ATTEND-ITEM-ANSWER'
global.EXAM_ATTEND_INFO = 'EXAM-ATTEND-INFO'
global.EXAM_ATTEND_PROCESS = 'EXAM-ATTEND-PROCESS'
global.SOURCE = 'WEBSITE' //志章写的‘OPPO’，oppo上过市场

global.Log = (...params) => { // 全局Log
    if (GLOBAL.__DEV__) {
        console.log(params);
    }
};
global.LogServer = (log_desc, log_text)=>{
    let log_device = {
        Platform: Platform.OS,
        currentVersion: currentVersion,
        width: width,
        height: height,
        apiLevel: DeviceInfo.getAPILevel(),
        brand: DeviceInfo.getBrand(),
        buildNumber: DeviceInfo.getBuildNumber(),
        bundleId: DeviceInfo.getBundleId(),
        deviceId: DeviceInfo.getDeviceId(),
        deviceName: DeviceInfo.getDeviceName(),
        maxMemory: DeviceInfo.getMaxMemory(),
        systemVersion: DeviceInfo.getSystemVersion(),
        uniqueId: DeviceInfo.getUniqueID(),
        version: DeviceInfo.getVersion(),
        source: global.SOURCE
    }
    let data = {log_desc: log_desc, log_text: JSON.stringify(log_text), log_device: JSON.stringify(log_device)}
    if (GLOBAL.__DEV__) {
        return console.log(data)
    }
    axios.post(API_HOST + '/v2/sys-log', data).then((ret)=>{}).catch((e)=>console('log error',e))
}

global.toUpdate = async (downloadUrl)=>{
    console.log(global.SOURCE)
    if (Platform.OS === 'ios'){
        return Linking.openURL(downloadUrl).catch(err => console.error('An error occurred', err));
    }
    if (global.SOURCE === 'WEBSITE') {
        return Linking.openURL(downloadUrl).catch(err => console.error('An error occurred', err));
    }
    //应用宝需要检查是否安装
    let yybInstall = await RNSkegn.checkInstall("com.tencent.android.qqdownloader");
    if (global.SOURCE === 'YYB' && !yybInstall) {
        return Linking.openURL(downloadUrl).catch(err => console.error('An error occurred', err));
    }
    Linking.canOpenURL("market://details?id=com.studentrnproject").then(supported => {
        if (!supported) {
            Linking.openURL(downloadUrl).catch(err => console.error('An error occurred', err));
        } else {
            Linking.openURL("market://details?id=com.studentrnproject").catch(err => console.error('An error occurred', err));
        }
    }).catch(err => Linking.openURL(downloadUrl).catch(err => console.error('An error occurred', err)));

}

global.storage = new Storage({
    size: 10000000,
    storageBackend: AsyncStorage,
    defaultExpires: null,
    enableCache: true,
    sync : {
        token(params){
            let {resolve} = params;
            resolve('')
        }
    }
})
global.storage.load({key: 'userInfo'}).then((userInfo)=>{
    LogServer('APP_RUN', userInfo)
}).catch(()=>{
    LogServer('APP_RUN', Date.now())
})


RNSkegn.skegnNew('1511140684000046', 'bd8f96907789ca51ab9f6edf5c9185df',(ret)=>{
    console.log('RNSkegn.skegnNew', ret)
    if (!ret) {
        LogServer('SkegnNewError', ret)
    }
})
global.Recorder = RNSkegn

function padLeftZero (str) {
    return ('00' + str).substr(-2)
}

//let path = Platform.OS === "ios" ?  RNFS.MainBundlePath : RNFS.DocumentDirectoryPath;


RNFS.mkdir(PAPER_BASE_PATH, {
    NSURLIsExcludedFromBackupKey: false
}).then(()=>{}).catch(e=>{
    Log('RNFS.mkdir', PAPER_BASE_PATH, e)
})
RNFS.mkdir(EXAM_BASE_PATH, {
    NSURLIsExcludedFromBackupKey: false
}).then(()=>{}).catch(e=>{
    Log('RNFS.mkdir', PAPER_BASE_PATH, e)
})

global.ABC = ['A','B', 'C', 'D', 'E', 'F']

global.GRADES = {1: '一年级', 2: '二年级', 3: '三年级', 4: '四年级', 5: '五年级', 6: '六年级', 7: '七年级', 8: '八年级', 9: '九年级', 10: '高一年级', 11: '高二年级', 13: '高三年级'}

global.formatDate = function (timeStamp) {
    let time = new Date(parseInt(timeStamp + '000'))
    return (padLeftZero(time.getMonth() + 1 )) + '月' + (padLeftZero(time.getDate())) + '日 ' + (padLeftZero(time.getHours())) + ':' + (padLeftZero(time.getMinutes()))
}
global.countDate = function (timeStamp) {
    let timeNow =  new Date();  //开始时间
    let timeTo = new Date(parseInt(timeStamp + '000'))
    let time = timeTo.getTime() - timeNow.getTime()  //时间差的毫秒数
    time  = time > 0 ? time : 0;
    let days = Math.floor(time / (24*3600*1000));
    let hours = Math.floor(time % (24*3600*1000) / (3600*1000))
    let minutes = Math.floor(time % (24*3600*1000) % (3600*1000) /(60*1000))
    return days + "天"+ padLeftZero(hours) +"时"+ padLeftZero(minutes) +"分钟"
}
global.exitApp = function(){
    console.log('exitApp')
    BackHandler.exitApp();
}
axios.defaults.timeout =  60000;
axios.defaults.headers.common['User-Agent'] =  'yys-'+Platform.OS+'-' + DeviceInfo.getVersion();
axios.interceptors.request.use(async (config) => {
    try {
        let token = await global.storage.load({key: 'token'})
        if (!config.hasOwnProperty('params')) {
            config['params'] = {}
        }
        config.params['token'] = token
    }catch (e) {
        console.log(e)
    }
    //Log(new Date().getTime(),'axios.request.config',config)
    return config
})

axios.interceptors.response.use(function (response) {
    //Log(new Date().getTime(),'axios.request.response',response)
    if (response.data.retCode === 4001) {
        try {
            BaseComponent.screen.nav().push('Login',{kickass: true});
        }catch (e) {
            Log('retCode: 4001, to Login exception', e)
        }
    }
    return response
}, function (error) {
    return Promise.reject(error)
})

