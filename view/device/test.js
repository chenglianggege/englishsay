import React, { Component } from 'react';
import Header from './../common/Header'
import BaseComponent from "./../../libs/BaseComponent";
import { Button } from 'react-native-elements'
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
    Keyboard, Dimensions, PermissionsAndroid, NativeEventEmitter
} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import {LoaderScreen} from 'react-native-ui-lib';
import axios from 'axios';
import * as Progress from 'react-native-progress';
import Sound from 'react-native-sound';
const {height, width} = Dimensions.get('window');


export default class Test extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {step: 1,play_process: 0,play_status: 0}
        this.isBusy = false
        this.readTimer = 0
        this.process = true
        this.sound = null
    }

    async componentDidMount() {
        this._isMounted = true
        this.process = false
        const eventEmitter = new NativeEventEmitter(Recorder)
        this.deEmitter = eventEmitter.addListener('onScore', (result) =>this._onRecordEnd(result));
    }

    componentWillUnmount(){
        this.deEmitter.remove();
        this._isMounted = false
        if (this.sound){
            this.sound.release()
        }
        Recorder.skegnStop()
        if (this.readTimer) {
            clearInterval(this.readTimer)
            this.readTimer = 0
        }
    }

    render() {
        const {step} = this.state
        return (
            <View style={{height: '100%', backgroundColor: '#fff'}}>
                <Header title="设备测试" onPress={()=>this.props.navigation.goBack()}/>
                {step === 1 ? this._step1() : null}
                {step === 2 ? this._step2() : null}
                {step === 3 ? this._step3() : null}
            </View>
        )
    }
    _step1(){
        return (
            <View>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Image style={{width: 120, height: 150, marginTop: 30}} source={require('./../../assets/device/img_right.png')}/>
                    <Text style={{fontSize: 14}}>适合（2cm左右）略低于嘴巴</Text>
                </View>
                <View style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 30}}>
                    <View style={{flex:1,justifyContent: 'center', alignItems: 'center'}}>
                        <Image style={{width: 120, height: 150}} source={require('./../../assets/device/img_wrong_far.png')}/>
                        <Text style={{fontSize: 14}}>话筒距离太远（{'>'}5cm）</Text>
                    </View>
                    <View style={{flex:1,justifyContent: 'center', alignItems: 'center'}}>
                        <Image style={{width: 120, height: 150}} source={require('./../../assets/device/img_wrong_near.png')}/>
                        <Text style={{fontSize: 14}}>话筒距离太近（{'<'}1cm）</Text>
                    </View>
                </View>
                <View style={{justifyContent: 'center', alignItems: 'flex-end', flexDirection: 'row', marginTop: 10}}>
                    <Button
                        onPress={()=> this.setState({step: 2})}
                        buttonStyle={styles.submitBtn}
                        textStyle={{fontSize: 17}}
                        title="开始测试"
                    />
                </View>
            </View>
        )
    }
    _step2(){
        const {play_process, play_status} = this.state
        return (
            <View style={{marginLeft: 10, flex: 1}}>
                <View style={{flex: 2}}>
                    <View style={{marginTop: 10}}>
                        <Text style={{fontSize: 14, textAlign:'center'}}>推荐使用带麦克风的外置耳机设备</Text>
                    </View>
                    <View style={{marginTop: 30}}>
                        <Button
                            onPress={()=> this._playAudio()}
                            buttonStyle={styles.playerBtn}
                            containerViewStyle={{marginLeft: 0, marginRight: 0}}
                            textStyle={{fontSize: 17}}
                            title={play_status === 1 ? '正在播放' : "播放音频"}
                            icon={{name: play_status === 1 ? 'controller-paus' :'controller-play', type: 'entypo'}}
                        />
                    </View>
                    <Text style={{fontSize: 14, marginTop: 10}}>请点击播放音频按钮，检查音频播放</Text>
                    <View style={{marginTop: 30, flexDirection: 'row'}}>
                        <Text style={{fontSize: 14}}>播放进度</Text>
                        <Progress.Bar
                            progress={play_process}
                            width={width - 100}
                            height={5}
                            color="#69b72d"
                            borderRadius={2}
                            style={{marginTop: 8, marginLeft: 7, height:3}}
                            unfilledColor="#f5f5f5"
                            borderColor="#69b72d"
                            borderWidth={0}
                            animated={false}
                        />

                    </View>
                </View>
                {play_status === 2 ?
                <View style={{alignSelf: 'flex-end', flex: 1}}>
                    <View><Text style={{fontSize: 16, textAlign:'center'}}>能否听到音频？</Text></View>
                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 60}}>
                        <Button
                            onPress={()=> {
                                Alert.alert('设备测试','请检查设备音量以及耳机是否完好')
                            }}
                            buttonStyle={styles.noBtn}
                            textStyle={{fontSize: 17, color: "#30cc75"}}
                            title="否"
                        />
                        <Button
                            onPress={()=> this.setState({step: 3,play_process: 0})}
                            buttonStyle={styles.yesBtn}
                            textStyle={{fontSize: 17, color: "#fff"}}
                            title="是"
                        />
                    </View>
                </View>
                    : null
                }

            </View>
        )
    }


    _step3(){
        const {play_process, play_status} = this.state
        return (
            <View style={{marginLeft: 10}}>
                <View style={{}}>
                    <View style={{marginTop: 10}}>
                        <Text style={{fontSize: 14, textAlign:'center'}}>推荐使用带麦克风的外置耳机设备</Text>
                    </View>
                    <View style={{marginTop: 30}}>
                        <Button
                            onPress={()=> this._record()}
                            buttonStyle={styles.playerBtn}
                            containerViewStyle={{marginLeft: 0, marginRight: 0}}
                            textStyle={{fontSize: 17}}
                            title={play_status === 1 ? '正在录音' : "开始录音"}
                            icon={{name: 'microphone', type: 'font-awesome'}}
                        />
                    </View>
                    <Text style={{fontSize: 14, marginTop: 10}}>请点击开始录音按钮，检查设备录音</Text>
                    <Text style={{fontSize: 16, marginTop: 10}}>请用正常的声音准确的读出下面的内容：</Text>
                    <Text style={{fontSize: 16, marginTop: 10}}>One Two Three Four Five</Text>
                    <View style={{marginTop: 30, flexDirection: 'row'}}>
                        <Text style={{fontSize: 14}}>录音进度</Text>
                        <Progress.Bar
                            progress={play_process}
                            width={width - 100}
                            height={5}
                            color="#69b72d"
                            borderRadius={2}
                            style={{marginTop: 8, marginLeft: 7, height:3}}
                            unfilledColor="#f5f5f5"
                            borderColor="#69b72d"
                            borderWidth={0}
                            animated={false}
                        />

                    </View>
                </View>

            </View>
        )
    }

    _playAudio(){
        if (this.isBusy){
            return
        }
        if (this.state.play_status === 1){
            this.process = false
        } else {
            this.play('test.mp3')
        }
    }
    _record(){
        if (this.isBusy){
            return
        }
        if (this.process) {
            return
        }
        this.isBusy = true
        this.setState({play_status: 1, play_process: 0})
        let _this = this
        Sound.setCategory('Playback');
        let sound = new Sound('ding.mp3', Sound.MAIN_BUNDLE, (error)=> {
            console.log('load the sound', error);
            sound.play(async (success) => {
                sound.release()
                Sound.setCategory('PlayAndRecord');
                const rationale = {
                    'title': '请求录音权限',
                    'message': '评分引擎需要您的录音权限.'
                };
                try {
                    let check = Platform.OS === 'ios' ? true : await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
                    if (!check){
                        Alert.alert('获取权限','口语答题必须需要使用您手机的录音权限，禁止录音将无法答题,请前往手机系统设置打开本应用的录音权限！')
                        return
                    }
                }catch (e) {
                    Alert.alert('获取权限','口语答题必须需要使用您手机的录音权限，禁止录音将无法答题,请前往手机系统设置打开本应用的录音权限！')
                    return
                }

                Sound.setCategory('PlayAndRecord');

                Recorder.skegnStart({coreType: 'sent.eval', refText: 'One Two Three Four Five', scale: 100, userId: 'test'}).then(()=>{
                    _this.isBusy = false
                    _this.process = true
                    _this._process(5, function () {
                        Recorder.skegnStop()
                    })
                }).catch(e=>{
                    console.log(e)
                    Alert.alert('测试录音','录音失败！请检查网络是否正常，录音权限是否正常')
                })
            })
        })
    }
    _onRecordEnd (ret) {
        if (!this._isMounted){
            return
        }
        let score = JSON.parse(ret)
        Log("recorder.onScore", score)
        if (score.hasOwnProperty('result') && score.result.overall){
            Alert.alert('测试录音','录音成功！',[
                {text: '好', onPress: () => this.props.navigation.goBack()}])
            // this.props.navigation.goBack()
        } else{
            Alert.alert('测试录音','评分失败！请大声准确的读出要求朗读的内容并请检查麦克风是否完好！')
        }
        this.setState({play_status: 2})
    }

    play(audioUrl){
        let _this = this
        this.setState({play_status: 1, play_process: 0})
        return new Promise(async (resolve, reject) => {
            _this.isBusy = true
            Sound.setCategory('Playback');
            let sound = new Sound(audioUrl, Sound.MAIN_BUNDLE, async (error) => {
                _this.isBusy = false
                if (error) {
                    console.log('failed to load the sound', error);
                    resolve()
                    return;
                }
                // loaded successfully
                if (_this._isMounted){
                    _this.process = true
                    let duration = sound.getDuration()
                    console.log('duration in seconds: ' + duration, Date.now());
                    _this._process(duration,function () {
                        _this.sound.release()
                        _this.setState({play_status: 2})
                        resolve();
                    })
                    sound.play((success) => {
                        Log('player' , PAPER_STATIC_HOST + audioUrl ,success)
                        sound.release()
                    });
                }
            });
            _this.sound = sound
        })

    }

    _process (processSeconds, cb) {
        let _this = this
        let now = 0
        let readTimer = setInterval(function () {
            if (_this._isMounted) {
                now = now + 0.1
                if (now >= processSeconds || !_this.process) {
                    _this.process = false
                    _this.readTimer = clearInterval(readTimer)
                    cb()
                }else{
                    _this.setState({play_process: now / processSeconds})
                }
            }
        }, 100)
        this.readTimer = readTimer
    }

    _toBack () {
        this.props.navigation.goBack()
    }

}
const styles = StyleSheet.create({
    submitBtn: {
        width: 345,
        height: 51,
        borderRadius: 1,
        backgroundColor: "#30cc75",
        marginTop: 45

    },
    playerBtn: {
        width: 140,
        height: 40,
        borderRadius: 1,
        backgroundColor: "#30cc75",
    },
    noBtn: {
        width: width / 2 - 20,
        height: 45,
        borderRadius: 1,
        backgroundColor: "#fff",
        borderWidth:1,
        borderColor: "#30cc75"
    },
    yesBtn: {
        width: width / 2 - 20,
        height: 45,
        borderRadius: 1,
        backgroundColor: "#30cc75",
    }
})