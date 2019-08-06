import React, { Component } from 'react';
import {
    StyleSheet,
    Image,
    View,
    StatusBar, Dimensions,Platform,Alert, Linking, BackHandler, Text
} from 'react-native';
const {height, width} = Dimensions.get('window');
import { Button } from 'react-native-elements'

export default class Update extends Component<Props> {
    static navigationOptions = ({navigation, screenProps}) => ({
        header: null
    });
    constructor(props) {
        super(props);
    }
    componentWillMount(){
        BackHandler.addEventListener('hardwareBackPress',this._stopBack);
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this._stopBack);
    }
    _stopBack() {
        return true
    }
    render() {

        return (
            <View style={{flex: 1, backgroundColor: "#fff", alignItems:'center'}}>
                <StatusBar translucent={true} backgroundColor='transparent' barStyle="dark-content"/>
                <Image style={[styles.load]} source={require('./../assets/home/banbendi.png')} />
                <Text style={styles.text}>
                    当前版本过低
                </Text>
                <Text style={styles.text}>更新至最新版本即可正常使用哦~</Text>
                <Button
                    title="立即更新"
                    textStyle={{fontSize: 14, color: "#fff"}}
                    onPress={()=> this._toUpdate()}
                    buttonStyle={{height: 39, backgroundColor:"#30cc75", borderRadius: 6, padding: 0, width: 112, marginTop: 26}}
                />
            </View>
        );
    }
    _toUpdate(){
        const {url} = this.props.navigation.state.params
        toUpdate(url)
    }
}

const styles = StyleSheet.create({
    load: {
        marginTop: 100
    },
    text: {
        fontSize: 17,
        color: "#707070",
        lineHeight: 24,
    }
});
