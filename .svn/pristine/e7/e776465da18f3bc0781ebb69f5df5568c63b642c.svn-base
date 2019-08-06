import React, { Component } from 'react';
import {
    View,
    Image,
    TouchableOpacity, Dimensions
} from 'react-native';
import {Dialog} from 'react-native-ui-lib';
import { Button } from 'react-native-elements'

const {height, width} = Dimensions.get('window');

export default class BuyDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {showBuyCard: false}
    }

    render(){
        const {showBuyCard} = this.state
        return (
            <Dialog overlayBackgroundColor='rgba(0,0,0,0.5)' width={width} height={height} visible={showBuyCard} onDismiss={() => this.setState({showBuyCard: false})}>
                <View style={{alignItems: 'center',justifyContent: 'center', height: height, marginTop: -60}}>
                    <View style={{marginLeft: 298 - 30}}>
                        <TouchableOpacity onPress={()=>this.setState({showBuyCard: false})}>
                            <Image style={{width: 30, height: 30}} source={require('./../../assets/personal/cha.png')}/>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Image style={{width: 298}} source={require('./../../assets/personal/bangka.png')}/>
                        <View style={{position:"absolute", marginTop: 230, marginLeft: 45}}>
                            <Button
                                onPress={()=> this._toBindCard()}
                                buttonStyle={{height: 43, width: 204,borderRadius: 4, backgroundColor:"#fff"}}
                                textStyle={{fontSize: 17,lineHeight: 18,color: "#55c372"}}
                                title="手动绑卡"
                                containerViewStyle={{marginLeft: 0, marginRight: 0}}
                            />
                            <Button
                                onPress={()=> this._toBuyCard()}
                                buttonStyle={{height: 43, width: 204,borderRadius: 4, backgroundColor:"#fff",marginTop: 14}}
                                textStyle={{fontSize: 17,lineHeight: 18,color: "#55c372"}}
                                title="在线购买"
                                containerViewStyle={{marginLeft: 0, marginRight: 0}}
                            />
                        </View>
                    </View>
                </View>
            </Dialog>
        )
    }

    toBuy(){
        const {userInfo} = this.props
        // 未绑卡，则只能绑卡
        if (!userInfo.study_card){
            return this.props.navigation.push('AddStudyCard')
        }
        let card_auth = +userInfo.study_card.card_auth
        // 不能在线买
        if (!card_auth || (card_auth & (1 << 2)) === 0 ){
            return this.props.navigation.push('AddStudyCard')
        }
        // 不能手动绑卡
        if ((card_auth & (1 << 1)) === 0){
            return this.props.navigation.push('ConfirmOrder')
        }

        this.setState({showBuyCard: true})
    }
    async _toBuyCard(){
        this.setState({showBuyCard: false})
        this.props.navigation.push('ConfirmOrder')
    }
    async _toBindCard(){
        this.setState({showBuyCard: false})
        this.props.navigation.push('AddStudyCard')
    }

}
