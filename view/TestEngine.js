import BaseComponent from "../libs/BaseComponent";
import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    StatusBar, Dimensions, Platform, Alert, Linking, BackHandler, NativeEventEmitter, PermissionsAndroid,TextInput
} from 'react-native';
import { Button } from 'react-native-elements'
import examAttendStorage from "../libs/examAttendStorage";
const {height, width} = Dimensions.get('window');

export default class TestEngine extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {path: '', log: '', recording: false, scoring: false}
    }
    async componentDidMount() {
        try {
            await this.test()
        }catch (e) {
            console.log('e', e.message)
        }
        console.log("222")
        const eventEmitter = new NativeEventEmitter(Recorder)
        this.onScoreEmitter = eventEmitter.addListener('onScore', this.onScore);

    }
    componentWillUnmount(){
        this.onScoreEmitter.remove();
        Recorder.stopRecord()

    }
    render() {
        const {recording, scoring, log} = this.state
        return (
            <View style={{flex: 1}}>
                <Button
                    onPress={this.checkPermission}
                    title="检查权限"
                    buttonStyle={styles.button}
                />
                <Button
                    onPress={this.requestPermission}
                    title="获取权限"
                    buttonStyle={styles.button}
                />
                <Button
                    onPress={this.startRecord}
                    title={recording ? "停止录音" : "开始录音"}
                    buttonStyle={styles.button}
                />
                <Button
                    onPress={this.startScore}
                    title={scoring ? "停止评分" : "开始评分"}
                    buttonStyle={styles.button}
                />
                <View style={{marginLeft: 20, marginTop: 20, marginBottom: 20, flex: 1}}>
                    <TextInput
                        multiline
                        scrollEnabled
                        editable={false}
                        value={log}
                        caretHidden
                        numberOfLines={5}
                        style={{width: width - 40, flex: 1, height: '100%', textAlignVertical: 'top', padding: 0, backgroundColor: "#000", color: "#fff"}}
                    />
                </View>

            </View>
        )
    }

    checkPermission = async ()=>{

        try {
            if (Platform.OS === 'ios'){
                let ret = Recorder.checkPermissionIOS()
                console.log("checkPermission:", ret)
                this.setState({log: this.state.log + "checkPermission:" + (ret ? "YES" : "NO") + "\n" })
            }
            if (Platform.OS === 'android'){
                let ret = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
                console.log('PermissionsAndroid', ret)
                this.setState({log: this.state.log + "checkPermission:" + (ret ? "YES" : "NO") + "\n" })
            }

            if (ret){
                alert('有录音权限')
            } else{
                alert('无权限')
            }

        }catch (e) {
            console.log(e)
        }


    }

    requestPermission = async () => {
        if (Platform.OS === 'ios'){
            Recorder.requestPermissionIOS()
            this.setState({log: this.state.log + "requestPermissionIOS" + "\n" })
        }
        if (Platform.OS === 'android'){
            const rationale = {
                'title': '请求录音权限',
                'message': '评分引擎需要您的录音权限.'
            };
            let result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
            this.setState({log: this.state.log + "requestPermission:"  + "\n" + JSON.stringify(result) + "\n"})

        }

    }

    startRecord = ()=>{
        const {recording} = this.state
        if (recording){
            this.stopRecord()
            return
        }
        let _this = this
        console.log('startRecord')
        this.setState({log: this.state.log + "startRecord" + "\n" , recording: true})
        Recorder.startRecord().then(ret=>{
            console.log('startRecord', ret)
            this.setState({log: this.state.log + "record file: " + ret + "\n" })
            _this.setState({path: ret})
        }).catch(e=>{
            console.log(e)
            this.setState({log: this.state.log + "Exception: " + e.message + "\n" , recording: false})
        })
    }
    stopRecord = ()=>{
        console.log('stopRecord')
        this.setState({log: this.state.log + "stopRecord" + "\n" , recording: false})
        Recorder.stopRecord();
    }
    startScore = ()=>{
        const {scoring} = this.state
        if (scoring){
            this.setState({log: this.state.log + "stopScore " + "\n" , scoring: false})
            Recorder.skegnStop()
            return
        }
        console.log('startScore', this.state.path)
        this.setState({log: this.state.log + "startScore : " + this.state.path + "\n"})
        Recorder.skegnStart({
            coreType: 'sent.eval',
            userId: 'szztest',
            refText: 'hello',
            attachAudioUrl: 1,
            scale: 100,
            precision: 0.1,
            qType: 0,
            recordFilePath: this.state.path
        }).then(ret =>{
            console.log('Score start')
            this.setState({log: this.state.log + "score start " + "\n" , scoring: true})
        }).catch(e=>{
            console.log(e)
            this.setState({log: this.state.log + "Exception: " + e.message + "\n" , scoring: false})
        })
    }
    onScore = (ret) =>{
        console.log('Score Result', ret)
        this.setState({log: this.state.log + "score result : " + ret + "\n" , scoring: false})
    }
    async test (){
        return new Promise((resolve, reject) => {
            reject(new Error("Death Error"))
        })
    }
}

const styles = StyleSheet.create({
    button: {
        marginTop:20
    }
});
