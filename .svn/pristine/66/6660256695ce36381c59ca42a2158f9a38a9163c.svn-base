import React, { Component } from 'react';
import Header from './../common/Header'
import BaseComponent from "./../../libs/BaseComponent";
import { Button, Icon } from 'react-native-elements'
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
    Keyboard, DeviceEventEmitter, Dimensions,Linking,KeyboardAvoidingView
} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import {LoaderScreen} from 'react-native-ui-lib';
import axios from 'axios';
import ImagePicker from "react-native-image-picker";
import {currentVersion} from "react-native-update";
const {height, width} = Dimensions.get('window');
import DeviceInfo from 'react-native-device-info';

export default class Report extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {userInfo: null, loading: false, reportContent: '', phone: '',qq: '',  uploadIng: false, imageList: []}
    }

    async componentDidMount() {
        let userInfo = await global.storage.load({key: 'userInfo'})
        console.log(userInfo)
        this.setState({userInfo: userInfo})
        //this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow',this.keyboardDidShow);
        this.keyboardWillHideListener = Keyboard.addListener('keyboardDidHide',this.keyboardDidHide);
    }
    componentWillUnmount () {
        //this.keyboardWillShowListener && this.keyboardWillShowListener.remove();
        this.keyboardWillHideListener && this.keyboardWillHideListener.remove();
    }
    //键盘弹起后执行
    keyboardDidShow = () =>  {
        this._scrollView.scrollTo({x:0, y:200, animated:true});
    }

    //键盘收起后执行
    keyboardDidHide = () => {
        this._scrollView.scrollTo({x:0, y:0, animated:true});
    }
    render() {

        const {loading, uploadIng, imageList} = this.state
        return (
            <View style={{flex: 1, backgroundColor: '#f5f5f5'}}>
                <Header title="意见反馈" onPress={()=>this.props.navigation.goBack()}/>
                <ScrollView ref={component => this._scrollView=component} scrollEnabled={false} keyboardShouldPersistTaps="always" style={{height: height}}>
                    <View style={{height: 230, width: width, paddingLeft: 20, backgroundColor: "#fff"}}>
                        <Text style={{fontSize: 16, color: '#353535', marginTop: 15}}>问题描述</Text>
                        <TextInput
                            underlineColorAndroid="transparent"
                            onChangeText={(text)=>this.setState({reportContent: text})}
                            multiline
                            numberOfLines={5}
                            placeholder="请尽量详细描述问题（需不少于5字),能提供相关截图就更好了哦~"
                            placeholderTextColor="#aaaaaa"
                            style={{marginTop: 20, width: width - 40, textAlignVertical: 'top', height: 88}}
                            onFocus={this.keyboardDidHide}
                        />
                        <View style={{marginTop: 10, flexDirection: 'row'}}>
                            {imageList.map((item, idx)=>{
                                return (
                                    <View style={{marginRight: 10}} key={idx}>
                                        <Image source={{uri: STATIC_HOST + item}} style={{width: 60, height: 60}}/>
                                        <TouchableOpacity onPress={()=>this._removeImage(idx)} style={{position: 'absolute', right: 0, top: 0}}>
                                            <Image source={require('./../../assets/personal/Group.png')} style={{width: 16, height: 16}}/>
                                        </TouchableOpacity>
                                    </View>
                                )
                            })}
                            <TouchableOpacity underlayColor="#fff" onPress={()=>this._imagePicker()} style={{width: 60, height: 60}}>
                                <Image source={require('./../../assets/personal/img.png')} style={{width: 60, height: 60}}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{height: height + 400}}>
                        <View style={{width: width, paddingLeft: 20, marginTop: 15, backgroundColor: "#fff"}}>
                            <Text style={{fontSize: 16, color: '#353535', marginTop: 15}}>联系方式（选填，方便客服老师回访）</Text>
                            <TextInput
                                underlineColorAndroid="transparent"
                                onChangeText={(text)=>this.setState({phone: text})}
                                placeholder="电话"
                                placeholderTextColor="#aaaaaa"
                                style={{width: width - 40, textAlignVertical: 'center', height: 56}}
                                returnKeyType="done"
                                maxLength={11}
                                keyboardType="numeric"
                                returnKeyLabel="完成"
                                onFocus={this.keyboardDidShow}
                            />
                            <View style={{height: 1, width: width - 40, backgroundColor:"#efefef"}} />
                            <TextInput
                                underlineColorAndroid="transparent"
                                onChangeText={(text)=>this.setState({qq: text})}
                                placeholder="QQ"
                                maxLength={13}
                                keyboardType="numeric"
                                placeholderTextColor="#aaaaaa"
                                style={{width: width - 40, textAlignVertical: 'center', height: 56}}
                                returnKeyType="done"
                                returnKeyLabel="完成"
                                onFocus={this.keyboardDidShow}
                            />
                        </View>
                        <Button
                            disabled={loading}
                            loading={loading}
                            onPress={()=> this._submitReport()}
                            buttonStyle={styles.submitBtn}
                            textStyle={{fontSize: 17}}
                            title="提交"
                        />
                    </View>
                </ScrollView>
                {loading ? <LoaderScreen message="正在提交..." overlay/> : null}
                {uploadIng ? <LoaderScreen message="正在上传图片..." overlay/> : null}
                <Toast ref="toast" position="center"/>
            </View>
        )
    }

    _imagePicker () {
        const options = {
            title: '请选择',
            quality: 0.8,
            maxWidth: 500,
            maxHeight: 500,
            cancelButtonTitle: '取消',
            takePhotoButtonTitle: '拍照',
            chooseFromLibraryButtonTitle: '选择相册',
            allowsEditing: true,
            storageOptions: {
                skipBackup: true
            }
        };
        let _this = this
        let imageList = this.state.imageList
        if (imageList.length >= 3) {
            this.refs.toast.show('最多可以选择3张图片！');
            return
        }
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
                let formdata = new FormData();
                let index1 = response.uri.lastIndexOf(".");
                let index2 = response.uri.length;
                let suffix = response.uri.substring(index1 + 1, index2); //后缀名
                let fileName = '1.' + suffix
                formdata.append('file', {uri: response.uri, name: fileName, type: 'multipart/form-data',});
                try {
                    this.setState({uploadIng: true})
                    let res = await axios.post(API_HOST + '/v2/upload-file/image', formdata, {'Content-Type': 'application/x-www-form-urlencoded'})
                    console.log(res.data)
                    if (res.data.retCode === 4001) {
                        _this.props.navigation.navigate({routeName: 'Login', params: {kickass: true}});
                        return
                    }
                    if (res.data.retCode !== 0) {
                        this.refs.toast.show('图片上传失败，请换张图片吧！');
                        _this.setState({uploadIng: false})
                        return
                    }
                    imageList.push(res.data.retData.static)
                    this.setState({imageList: imageList})

                } catch (e) {
                    console.log(e)
                    this.refs.toast.show('网络通讯错误，请检查网络！');
                } finally {
                    _this.setState({uploadIng: false})
                }
            }
        });
    }
    _removeImage(idx){
        let imageList = this.state.imageList
        imageList.splice(idx, 1)
        this.setState({imageList: imageList})
    }
    async _submitReport(){
        const {reportContent, imageList, phone, qq} = this.state
        if (reportContent.length < 5) {
            this.refs.toast.show('请尽量详细描述问题,需不少于5字！');
            return;
        }

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
        }
        try {
            this.setState({loading: true})
            let res = await axios.post(API_HOST + '/v2/user/report', {
                report_content: reportContent,
                report_imgs: imageList.join(','),
                report_category: '意见反馈',
                report_device_info: JSON.stringify(log_device),
                report_product: Platform.OS === 'ios' ? 1001 : 1002,
                phone: phone,
                qq: qq,
            })
            if (res.data.retCode !== 0){
                this.refs.toast.show(res.data.retMsg);
                return
            }
            Alert.alert('意见反馈', '反馈提交成功！',[
                {text: '确认', onPress: () => this.props.navigation.goBack()},
            ], { cancelable: false })

        }catch (e) {
            console.log(e)
            this.refs.toast.show('网络通讯错误，请检查网络！');
        }finally {
            this.setState({loading: false})
        }
    }
}

const styles = StyleSheet.create({
    submitBtn: {
        width: width - 40,
        marginLeft: 5,
        height: 54,
        borderRadius: 8,
        backgroundColor: "#30cc75",
        marginTop: 25
    }
})