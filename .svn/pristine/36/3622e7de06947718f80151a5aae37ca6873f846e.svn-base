import React, { Component } from 'react';
import {
    StyleSheet,
    Image,
    View,
    StatusBar, Dimensions,Platform,Alert, Linking
} from 'react-native';
import {Carousel} from 'react-native-ui-lib';
import { Button } from 'react-native-elements'

const {height, width} = Dimensions.get('window');
const loadImages = [require('../assets/load/01.jpg'),require('../assets/load/02.jpg'),require('../assets/load/03.jpg')]


export default class Launch extends Component<Props> {
    static navigationOptions = ({navigation, screenProps}) => ({
        header: null
    });
    constructor(props) {
        super(props);
        this.state = {imgIdx: 0}
    }
    componentWillMount(){
    }
    async componentDidMount() {

    }
    _toLogin(){
        this.props.navigation.replace('Login')
    }
    onChangePage(index){
        this.setState({imgIdx: index})
    }
    render() {
        const {imgIdx} = this.state
        return (
            <View style={{flex: 1}}>
                <StatusBar translucent={true} backgroundColor='transparent' barStyle="dark-content"/>
                <Carousel pageWidth={width} onChangePage={(index => this.onChangePage(index))}>
                    {loadImages.map((item,idx)=>{
                        return (
                            <Image key={idx} style={{width: width, height: height}} source={item}/>
                        )
                    })}
                </Carousel>
                {imgIdx + 1 === loadImages.length ? <View style={{justifyContent: 'center', alignItems: 'center', width: width, marginTop: height - height / 6, position: 'absolute'}} >
                    <Button
                        title="立即体验"
                        textStyle={{fontSize: 14, color: "#fff"}}
                        onPress={()=> this._toLogin()}
                        buttonStyle={{height: 42, backgroundColor:"#30cc75", borderRadius: 6, padding: 0, width: 139}}
                    />
                </View>: null}
            </View>
        )
    }
}