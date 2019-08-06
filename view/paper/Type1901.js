import React, { Component } from 'react';
import {
    View, Text, StyleSheet, Image, Platform, TouchableOpacity,Alert, ScrollView, Modal, TextInput, Dimensions
} from 'react-native';
import SubBar from './SubBar'
import Toast, {DURATION} from 'react-native-easy-toast'
import { CheckBox } from 'react-native-elements'
import {LoaderScreen} from 'react-native-ui-lib'
import ImageViewer from 'react-native-image-zoom-viewer';
const {height, width} = Dimensions.get('window');

export default class Type1901 extends Component {
    constructor(props) {
        super(props);
        console.log(this.props)
        this.state = {info_idx: 0,sclowviewheight: 10, item_idx: 0,answerArr: [],loading: false, scoreLog: null,text1:'',text2:'',text3:'',text4:'',text5:'',index_qs:[],attention:''}
    }
    componentDidMount() {
        this._isMounted = true
        this._starting()
    }
    componentWillUnmount(){
        this._isMounted = false
    }
    componentWillReceiveProps (nextProps){
        if (nextProps.qs_idx !== this.props.qs_idx) {
            this._starting()
        }
    }
    async _starting () {
        await this.setState({info_idx: 0, item_idx: 0, answerArr: []})
        const {question, onFinish, onScore} = this.props
        try {
            question.info[1].info_content_img = question.info[0].info_content_img
        }catch (e) {}
        for (let info_idx = 0; info_idx < question.info.length; info_idx ++){

            if(info_idx === 0){
                await this.setState({info_idx: info_idx})
                const question_info = question.info[info_idx]
                try {
                    await this._infoAnswer(question_info)
                    console.log(this.state.answerArr)
                    for (let item_idx = 0; item_idx < question_info.items.length; item_idx ++){
                        const info_item = question_info.items[item_idx]
                        let answerArr = this.state.answerArr[info_item.item_id]
                        onScore({
                            score : answerArr.score,
                            item: info_item,
                            item_answer: answerArr.rightAnswer,
                            item_answer_type: 1,
                            user_answer: answerArr.answer
                        })
                    }
                }catch (e) {}
                this._openMax(question_info)
                if (!this._isMounted) return
            }else{
                await this.setState({info_idx: info_idx})
                const question_info = question.info[info_idx]
                try {
                    await this._infoAnswer(question_info)
                    console.log(this.state.answerArr)
                    for (let item_idx = 0; item_idx < question_info.items.length; item_idx ++){
                        const info_item = question_info.items[item_idx]
                        let answerArr = this.state.answerArr[info_item.item_id]
                        onScore({
                            score_params : this.state.scoreLog,
                            item: info_item,
                            item_answer: info_item.answers[0].answer_content,
                            item_answer_type: 2
                        })
                    }
                }catch (e) {}

                if (!this._isMounted) return
            }
            

        }
        if (this._isMounted) onFinish()

    }

    _infoAnswer (question_info) {
        let _this = this
        return new Promise(async (resolve, reject) => {
            const {answerArr,attention} = _this.state
            try {
                // 1 - 看题 时间 = 小题之和
                let waitSecond = 0;
                let answerSecond = 0;
                for (let item_idx = 0; item_idx < question_info.items.length; item_idx ++){
                    waitSecond += parseInt(question_info.items[item_idx].item_prepare_second)
                    answerSecond += parseInt(question_info.items[item_idx].item_answer_second)
                    // 先设置每题的答题为空结果
                    let rightAnswer = '-'
                    for (let i in question_info.items[item_idx].answer) {
                        if (parseInt(question_info.items[item_idx].answer[i].answer_is_right) === 1){
                            rightAnswer = ABC[i]
                        }
                    }
                    answerArr[question_info.items[item_idx].item_id] = {answer: '-', score: 0, rightAnswer: rightAnswer}
                }
                _this.setState({answerArr: answerArr})

                // 小题内容音频播放次数,默认1遍，即使给0也是播放一遍
                let playTimes = question_info.info_repet_times ? +question_info.info_repet_times: 1

                // 2 - 播放小题标题音频
                //修改提示语,会循环回来，第二题又回来啦
                _this.setState({attention: JSON.parse(question_info.info_content)[0].text})
                if (question_info){
                    //  如果没有info_content_source_content 则把source_content播放info_repet_times遍
                    if(this.state.info_idx === 1 ){
                        for (let i = 0; i< (!question_info.info_content_source_content ? playTimes : 1);i++){
                            //await _this.refs.subbar.play(question_info.info_content)
                            await _this.refs.subbar.play(JSON.parse(question_info.info_content)[0].audio)
                            if(this.state.info_idx === 0){
                                _this.setState({attention: JSON.parse(question_info.info_content)[1].text})
                                await _this.refs.subbar.play(JSON.parse(question_info.info_content)[1].audio)
                            }
                            if (!_this._isMounted) return reject()
                        }
                    }else{
                        _this.setState({attention: JSON.parse(question_info.info_content)[1].text})
                    }
                }
                
                
                if(this.state.info_idx === 0){
                    await _this.refs.subbar.wait(waitSecond, '请看题...')
                    if (!_this._isMounted) return reject()
                    //播放完为空
                    _this.setState({attention: ''})
                    
                    // 3 - 播放小题内容音频
                    if (question_info.info_content_source_content){
                        for (let i = 0; i< question_info.info_repet_times;i++){
                            await _this.refs.subbar.play(question_info.info_content_source_content)
                            if (!_this._isMounted) return reject()
                        }
                    }
                }else{
                    // 3 - 播放小题内容音频
                    if (question_info.info_content_source_content){
                        for (let i = 0; i< question_info.info_repet_times;i++){
                            await _this.refs.subbar.play(question_info.info_content_source_content)
                            if (!_this._isMounted) return reject()
                        }
                    }
                    _this.setState({attention: JSON.parse(question_info.info_content)[1].text})
                    await _this.refs.subbar.play(JSON.parse(question_info.info_content)[1].audio)
                    await _this.refs.subbar.wait(waitSecond, '请看题...')
                    if (!_this._isMounted) return reject()
                    //播放完为空
                    _this.setState({attention: ''})
                }

                
        
                // 52 - 播放小题标题音频
                //修改提示语  下面请在90s填空
                _this.setState({attention: JSON.parse(question_info.info_content)[2].text})
                if (question_info){
                    //  如果没有info_content_source_content 则把source_content播放info_repet_times遍
                    for (let i = 0; i< (!question_info.info_content_source_content ? playTimes : 1);i++){
                        //await _this.refs.subbar.play(question_info.info_content)
                        await _this.refs.subbar.play(JSON.parse(question_info.info_content)[2].audio)
                        if (!_this._isMounted) return reject()
                    }
                }
                if (this.state.info_idx === 0) {
                    //第一节填空
                    await _this.refs.subbar.wait(answerSecond, '请作答...')
                }else {
                    //第二节录音

                    try {
                        
                        //await this.setState({item_idx: 1})
                        //score             分数
                        //item              小题详细信息
                        //item_answer       正确答案
                        //item_answer_type  答题类型
                        //user_answer       用户答案 
                        const info_item = question_info.items[0]

                        let score = await this._itemAnswer(info_item)
                        console.log('asda22222sada222',score)
                        //this._pressCheckBox(info_item.item_id, 'text5', 3)
                        //此处上传不成功，现在怀疑只能上传单独类型，score返回来的是本地对象（题目的类型和各个参数而已）
                        //明天任务：
                        //查看onScore方法的具体操作
                        //测试分开上传，第二节单独上传，等待返回结果
                        //嗯 慢慢来
                        await this.setState({scoreLog: score})
                    }catch (e) {
                        if (e.message === 'RECORD_START_ERROR') {
                            Alert.alert('录音失败', '请检查录音权限并尝试重新打开App！',[
                                {text: '确认', onPress: () => onEnd()},
                            ], { cancelable: false })
                            return
                        }
                    }
                }
                if (!_this._isMounted) return reject()
                resolve()

            }catch (e) {
                LogServer('ANSWER_EXCEPTION', e.message)
                reject(e)
            }
        })

    }
    
    _itemAnswer (info_item) {
        let _this = this
        return new Promise(async (resolve, reject) => {
            const {onEnd, coreType, openType} = _this.props
            try {
                let audioPath = await _this.refs.subbar.record(info_item.item_answer_second);
                if (!_this._isMounted) return reject()
                resolve({
                    coreType: coreType,
                    refText: info_item.answers[0].answer_content,
                    attachAudioUrl: 1,
                    scale: parseFloat(info_item.item_score),
                    precision: 0.1,
                    qType: parseInt(openType),
                    recordFilePath: audioPath
                })

            }catch (e) {
                LogServer('ANSWER_EXCEPTION', e.message)
                reject(e)
            }
        })

    }
    render () {

        const {question} = this.props
        const {info_idx, item_idx, isImageShow, showImg} = this.state
        const question_info = question.info[info_idx]
        return (
            <View style={{flex: 1,backgroundColor:"#fff"}}>
                <View style={{flex: 5}}>
                    <View style={{height: 40, alignItems: 'center', flexDirection:'row',marginRight: 14, marginLeft:15}}>
                        <Text numberOfLines={1} style={[styles.titleText,{flex: 5}]}>{question.qs_title}</Text>
                        <View style={{flexDirection:'row', flex: 1, justifyContent:'flex-end'}}>
                            <Text style={[styles.titleText,{color: "#30cc75"}]}>{+info_idx+1}</Text>
                            <Text style={[styles.titleText,{}]}>/{question.info.length}</Text>
                        </View>
                    </View>
                    <View style={styles.underLine}/>
                    {question.info[0].info_content ? <Text style={[styles.titleText,{marginTop: 10, marginLeft:15}]}>{this.state.attention}</Text> : null}
                    {question_info.source_content && parseInt(question_info.source_type) === 2 ?
                        <Image resizeMode="contain" style={{height: 200, marginTop: 10}} source={{uri: PAPER_STATIC_HOST + question_info.source_content}}  /> : null}
                    {question_info.info_content_img ?
                        <ImageViewer
                            renderIndicator={()=>{}}
                            onClick={()=>{console.log(this.state.text1,this.state.text2,this.state.text3)}}
                            resizeMode="contain"
                            style={{height: 200, marginTop: 10}}
                            enableImageZoom={false}
                            backgroundColor="#fff"
                            imageUrls={[{url: PAPER_STATIC_HOST + question_info.info_content_img}]}
                        />
                        : null}
                    {question_info.info_content_img ?
                        <View style={{width: '100%',marginTop:-50,flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}}>
                            <Image style={{width: 15 ,height: 23}} source={require('./../../assets/paper/doublehand.png')}/>
                            <Text style={{color:"#AAAAAA",marginLeft:5,marginRight:10}}>放大图片</Text>
                        </View>
                        : null}    
                    <ScrollView ref={component => this._scrollView=component} keyboardShouldPersistTaps={'always'} style={{width:width,backgroundColor: '#fff', marginTop: this.state.sclowviewheight}}>
                        {this.state.info_idx === 0 ? this._renderChoiceList(question_info) : this._ranswerList()}
                    </ScrollView>
                </View>
                {isImageShow ?
                    <Modal visible={true} transparent={true}
                        onRequestClose={()=> {
                            this.setState({
                                isImageShow: false,
                            });
                        }}>
                        <ImageViewer imageUrls={[{url: showImg}]}
                            onClick={(e)=>{
                            //console.log('onClick', e)
                            this.setState({
                                isImageShow: false,
                            });
                        }}
                        saveToLocalByLongPress={false}/>
                    </Modal> : null}
                <SubBar style={{flex: 1}} ref="subbar"/>
                <Toast ref="toast" position="center"/>
            </View>
        )
    }
    _openMax(a){
        //第二节题号
        this.setState({index_qs:[a.items[0].item_no.toString(),a.items[1].item_no.toString(),a.items[2].item_no.toString(),a.items[3].item_no.toString(),a.items[4].item_no.toString()]})
    }
    _ranswerList() {
        return (
            <View style={{marginLeft:15}}>
                <Text style={styles.titleText}>{this.state.index_qs[0]+'.'+this.state.text1}</Text>
                <Text style={styles.titleText}>{this.state.index_qs[1]+'.'+this.state.text2}</Text>
                <Text style={styles.titleText}>{this.state.index_qs[2]+'.'+this.state.text3}</Text>
                <Text style={styles.titleText}>{this.state.index_qs[3]+'.'+this.state.text4}</Text>
                <Text style={styles.titleText}>{this.state.index_qs[4]+'.'+this.state.text5}</Text>
            </View>
        )        
    }
    _showInputMy(num_y){
        if (Platform.OS === 'ios'){
            this.setState({sclowviewheight:-100})
            setTimeout(() => {
                this._scrollView.scrollTo({x:0, y:num_y+10, animated:true})
            }, 200)
        }
    }
    _noneInputMy(num_y){
        if (Platform.OS === 'ios'){
            this.setState({sclowviewheight:10})
            setTimeout(() => {
                this._scrollView.scrollTo({x:0, y:0, animated:true})
            }, 200)
        }
    }
    _renderChoiceList (question_info) {
        return (
            <View>
                <View style={styles.inputOut}>
                    <View style={styles.inputSection}>
                        <TextInput
                            style={styles.inputStyle}
                            underlineColorAndroid="transparent"
                            onFocus={(e)=>{
                                try{this._showInputMy(0)}catch(err){}
                            }}
                            onBlur={(e)=>{
                                try{this._noneInputMy(0)}catch(err){}
                            }}
                            onChangeText={(text1) => {
                                this.setState({text1})
                                //小题id，答案，分数
                                this._pressCheckBox(question_info.items[0].item_id, text1, question_info.items[0].item_content.toLowerCase().split('|').indexOf(text1.toLowerCase()) !== -1 ? question_info.items[0].item_score : 0)
                            }}
                            value={this.state.text1}
                            placeholder={question_info.items[0].item_no.toString()}
                        />
                    </View>    
                </View>
                <View style={styles.inputOut}>
                    <View style={styles.inputSection}>
                    <TextInput
                            style={styles.inputStyle}
                            underlineColorAndroid="transparent"
                            onFocus={(e)=>{
                                try{this._showInputMy(60)}catch(err){}
                            }}
                            onBlur={(e)=>{
                                try{this._noneInputMy(0)}catch(err){}
                            }}
                            onChangeText={(text2) => {
                                this.setState({text2})
                                //小题id，答案，分数
                                this._pressCheckBox(question_info.items[1].item_id, text2, question_info.items[1].item_content.toLowerCase().split('|').indexOf(text2.toLowerCase()) !== -1 ? question_info.items[1].item_score : 0)
                            }}
                            value={this.state.text2}
                            placeholder={question_info.items[1].item_no.toString()}
                        />
                    </View>    
                </View>
                <View style={styles.inputOut}>
                    <View style={styles.inputSection}>
                    <TextInput
                            style={styles.inputStyle}
                            underlineColorAndroid="transparent"
                            onFocus={(e)=>{
                                try{this._showInputMy(120)}catch(err){}
                            }}
                            onBlur={(e)=>{
                                try{this._noneInputMy(0)}catch(err){}
                            }}
                            onChangeText={(text3) => {
                                this.setState({text3})
                                //小题id，答案，分数
                                this._pressCheckBox(question_info.items[2].item_id, text3, question_info.items[2].item_content.toLowerCase().split('|').indexOf(text3.toLowerCase()) !== -1 ? question_info.items[2].item_score : 0)
                            }}
                            value={this.state.text3}
                            placeholder={question_info.items[2].item_no.toString()}
                        />
                    </View>    
                </View>
                <View style={styles.inputOut}>
                    <View style={styles.inputSection}>
                    <TextInput
                            style={styles.inputStyle}
                            underlineColorAndroid="transparent"
                            onFocus={(e)=>{
                                try{this._showInputMy(180)}catch(err){}
                            }}
                            onBlur={(e)=>{
                                try{this._noneInputMy(0)}catch(err){}
                            }}
                            onChangeText={(text4) => {
                                this.setState({text4})
                                //小题id，答案，分数
                                this._pressCheckBox(question_info.items[3].item_id, text4, question_info.items[3].item_content.toLowerCase().split('|').indexOf(text4.toLowerCase()) !== -1 ? question_info.items[3].item_score : 0)
                            }}
                            value={this.state.text4}
                            placeholder={question_info.items[3].item_no.toString()}
                        />
                    </View>    
                </View>
                <View style={styles.inputOut}>
                    <View style={styles.inputSection}>
                    <TextInput
                            style={styles.inputStyle}
                            underlineColorAndroid="transparent"
                            onFocus={(e)=>{
                                try{this._showInputMy(240)}catch(err){}
                            }}
                            onBlur={(e)=>{
                                try{this._noneInputMy(0)}catch(err){}
                            }}
                            onChangeText={(text5) => {
                                this.setState({text5})
                                //小题id，答案，分数
                                this._pressCheckBox(question_info.items[4].item_id, text5, question_info.items[4].item_content.toLowerCase().split('|').indexOf(text5.toLowerCase()) !== -1 ? question_info.items[4].item_score : 0)
                            }}
                            value={this.state.text5}
                            placeholder={question_info.items[4].item_no.toString()}
                        />
                    </View>  
                </View>
            </View>
        )
    }

    _pressCheckBox(item_id, answer, score) {
        const {answerArr} = this.state
        answerArr[item_id] = {answer: answer, score: score}
        this.setState({answerArr: answerArr})
    }
}
const styles = StyleSheet.create({
    inputSection: {
        alignItems: 'center',
        marginLeft: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        width: 330,
        height: 51,
        borderColor: 'gray',
        borderWidth: 1
    },
    inputOut: {
        marginTop: 10,
        marginLeft: 15
    },
    inputStyle: {
        width: 250,
        fontSize: 16,
        paddingLeft: 15,
        textAlign: 'center'
    },
    titleText: {
        fontSize: 16,
        color: "#898787",
        lineHeight: 26
    },
    underLine: {
        backgroundColor: "#f3f0f0",
        height: 1
    }
})