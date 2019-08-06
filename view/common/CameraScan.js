import React, { Component } from 'react';
import {
    View,
    Image,
    Text, Animated, Easing, StyleSheet,TouchableOpacity,Platform, NativeModules,StatusBar
} from 'react-native';
import { Button, Icon } from 'react-native-elements'
import { RNCamera } from 'react-native-camera'
const { StatusBarManager } = NativeModules;

export default class CameraScan extends Component {
    constructor(props) {
        super(props);
        this.state = {moveAnim: new Animated.Value(0), isEndAnimation: false, flashOn: false}
    }
    componentDidMount() {
        this.startAnimation();
    }
    componentWillUnmount() {
        this.setState({
            isEndAnimation:true,
        });
    }
    render(){
        const {onBarCodeRead, onBack} = this.props
        const {flashOn} = this.state
        return (
            <View style={{flex: 1}}>
                <StatusBar translucent={true} backgroundColor='transparent' barStyle="light-content"/>
                <RNCamera
                    style={styles.preview}
                    type={RNCamera.Constants.Type.back}
                    flashMode={flashOn ? RNCamera.Constants.FlashMode.on :RNCamera.Constants.FlashMode.off}
                    onBarCodeRead={onBarCodeRead}
                >
                    <TouchableOpacity onPress={onBack} style={{backgroundColor: "#000",marginTop: Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT}}>
                        <View style={{backgroundColor: "#000", flexDirection: 'row', marginLeft: 10, width: 50}}>
                            <Icon name='chevron-thin-left'  type='entypo' size={22} color='#fff'/>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.rectangleContainer}>
                        <View style={styles.rectangle}>
                        <Animated.View style={[
                            styles.border,
                            {transform: [{translateY: this.state.moveAnim}]}]}/>
                        </View>
                        <Text style={styles.rectangleText}>将二维码放入框内，即可自动扫描</Text>
                        <TouchableOpacity onPress={()=>this.setState({flashOn: !flashOn})} style={{marginTop: 50}}>
                            <Icon name={flashOn ? 'flashlight' : 'flashlight-off'}  type='material-community' color='#fff' size={50}/>
                        </TouchableOpacity>
                    </View>

                </RNCamera>
            </View>
        )
    }
    startAnimation = () => {
        this.state.moveAnim.setValue(0);
        Animated.timing(
            this.state.moveAnim,
            {
                toValue: 200,
                duration: 1500,
                easing: Easing.linear
            }
        ).start(() => {
            if (!this.state.isEndAnimation){
                this.startAnimation()
            }
        });
    };
}
const styles = StyleSheet.create({
    preview: {
        flex: 1,
    },
    rectangleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    rectangle: {
        height: 200,
        width: 200,
        borderWidth: 1,
        borderColor: '#00FF00',
        backgroundColor: 'transparent'
    },
    rectangleText: {
        flex: 0,
        color: '#fff',
        marginTop: 10
    },
    border: {
        flex: 0,
        width: 200,
        height: 2,
        backgroundColor: '#00FF00',
    }
})