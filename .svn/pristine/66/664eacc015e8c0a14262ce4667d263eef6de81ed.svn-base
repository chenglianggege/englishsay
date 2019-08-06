import React, { Component } from 'react';
import {
    View,
    Image,
    Text
} from 'react-native';
import { Button } from 'react-native-elements'
export default class NoNet extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render(){
        const {onPress} = this.props
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Image source={require('./../../assets/common/nowifi.png')} style={{width: 232, height: 153}}/>
                <Text style={{fontSize: 17, color: "#858585", marginTop: 20}}>无网络，请检查wifi和移动网络</Text>
                <Button
                    onPress={onPress}
                    buttonStyle={{height: 40, width: 112,borderRadius: 3, backgroundColor:"#30cc75",marginTop: 30}}
                    textStyle={{fontSize: 14, color: "#ffffff"}}
                    title="刷新"
                    containerViewStyle={{marginLeft: 0, marginRight: 0}}
                />
            </View>
        )
    }
}