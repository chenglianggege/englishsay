import React, { Component } from 'react';
import {
    Dimensions,
    View,
    Text
} from 'react-native';
import {Header as ElHeader} from 'react-native-elements'
const {height, width} = Dimensions.get('window');


export default class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render () {
        const {title, isMain, onPress, rightComponent, rightWidth} = this.props
        return (
            <ElHeader
                statusBarProps={{ translucent: true , backgroundColor: 'transparent'}}
                leftComponent={isMain || !onPress ? null : {icon: 'chevron-thin-left', color: '#333', size: 22,containerStyle: {width: 50}, type: 'entypo', onPress: onPress}}
                centerComponent={(<View style={{width: width - (rightWidth ? rightWidth : 130), height: 30, justifyContent:'center'}} ><Text  numberOfLines={1} style={{color: isMain ? '#fff' : '#333', textAlign:'center', fontSize:20}}>{title}</Text></View>)}
                rightComponent={isMain || !onPress ? null : (rightComponent ? rightComponent : <View style={{width: 50}} />)}
                backgroundColor={isMain ? "#30cc75":"#fff"}
                outerContainerStyles={{paddingTop: 15, paddingLeft: 15, paddingRight: 15, paddingBottom: 5, height: 60}}
            />
        )
    }
}
