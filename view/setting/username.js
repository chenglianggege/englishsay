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
    Keyboard
} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import {LoaderScreen} from 'react-native-ui-lib';
import axios from 'axios';

export default class Username extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {loading: false, username: ''}
    }

    async componentDidMount() {
        let userInfo = await global.storage.load({key: 'userInfo'})
        this.setState({username: userInfo.user_name})
    }

    componentWillUnmount() {
    }

    render() {
        const {loading, username} = this.state
        return (
            <View style={{height: '100%', backgroundColor: '#fff'}}>
                <Header title="修改姓名" onPress={()=>this.props.navigation.goBack()}/>
                <View style={{justifyContent:'center', alignItems: 'center'}}>
                    <View style={{marginTop: 20,width: 340, height: 45, flexDirection: 'row', borderWidth: 1, borderColor:"#e9e9e9", alignItems:'center', borderRadius: 5}}>
                        <Text style={{marginLeft: 15, fontSize: 16}}>你的姓名</Text>
                        <TextInput
                            onChangeText={username => this.setState({ username })}
                            style={{marginLeft: 15, width: 250}}
                            underlineColorAndroid="transparent"
                            placeholder="请输入你的姓名"
                            clearButtonMode="while-editing"
                            returnKeyType="done"

                        />
                    </View>
                    <Button
                        disabled={this.state.loading}
                        loading={this.state.loading}
                        onPress={()=> this._username()}
                        buttonStyle={styles.submitBtn}
                        textStyle={{fontSize: 17}}
                        title="确认修改"
                        icon={{name: 'check'}}
                    />
                </View>
                {loading ? <LoaderScreen message="Loading..." overlay/> : null}
            </View>
        )
    }
    _toBack () {
        this.props.navigation.goBack()
    }
    async _username(){
        const {username} = this.state
        if (!username){
            Alert.alert('修改姓名', '请输入你的姓名')
            return
        }
        if (username.length > 12){
            Alert.alert('修改姓名', '姓名的长度不能超过12个字符')
            return
        }
        try {
            this.setState({loading: true})
            let ret = await axios.post(API_HOST + '/v2/user/info/save', {user_name : username})
            if (ret.data.retCode === 0){
                let userInfo = await axios.get(global.API_HOST + '/v2/student/info')
                if (userInfo.data.retCode === 0) {
                    await global.storage.save({key: 'userInfo', data: userInfo.data.retData})
                }
                Alert.alert('修改姓名', '姓名修改成功！',[
                    {text: '好', onPress: async () => this.props.navigation.goBack()},
                ], { cancelable: false })
            }else{
                Alert.alert('修改姓名', ret.data.retMsg)
            }
        }catch (e) {
            this.refs.toast.show('网络通讯错误，请检查网络！')
        }finally {
            this.setState({loading: false})
        }
    }
}

const styles = StyleSheet.create({
    submitBtn: {
        width: 340,
        height: 51,
        borderRadius: 6,
        backgroundColor: "#30cc75",
        marginTop: 45
    }
})