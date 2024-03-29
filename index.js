import { AppRegistry, YellowBox } from 'react-native';
import {createStackNavigator} from 'react-navigation';
import Load from './view/load'
import {Main} from './view/main'
import {Main2} from './view/main2'
import Login from './view/login'
import TSZX from './view/tszx'
import TSMN from './view/tsmn'
import PaperStart from "./view/paper/start";
import PaperExam from "./view/paper/exam";
import TSZXPaper from "./view/tszxPaper";
import ExamResult from "./view/examResult";
import ExamResultDetail from "./view/exam/examDetail";
import JoinClass from "./view/personal/joinClass";
import StudyCard from "./view/personal/studyCard";
import AddStudyCard from "./view/personal/addStudyCard";
import Setting from "./view/setting/setting";
import Passwd from "./view/setting/passwd";
import Username from "./view/setting/username";
import Useragreement from "./view/setting/useragreement";
import Userprivacy from "./view/setting/userprivacy";
import Userleave from "./view/setting/userleave";
import Userleavelast from "./view/setting/userleavelast";
import Phone from "./view/setting/phone";
import Test from "./view/device/test";
import Reg from "./view/reg";
import Forget from "./view/forget";
import BuyCard from "./view/personal/buyCard";
import ConfirmOrder from "./view/personal/confirmOrder";
import PaySuccess from "./view/personal/paySuccess";
import Launch from "./view/launch";
import TestEngine from "./view/TestEngine";
import Word from "./view/word";
import Sent from "./view/sent";
import WordRead from "./view/word/read";
import WordList from "./view/word/list";
import SplashScreen from "react-native-splash-screen";
import Units from "./view/units";
import SentList from "./view/sent/list";
import SentRead from "./view/sent/read";
import Kefu from "./view/personal/kefu";
import Update from "./view/update";
import Report from "./view/personal/report";
import ExperienceVersion from "./view/experienceVersion"
import ExperiencePage from "./view/experiencePage"
import ExperienceHomework from "./view/experienceHomework"
import ExperienceSet from "./view/experienceSet"
import ExperienceTszx from "./view/experienceTszx"

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);
YellowBox.ignoreWarnings(['Remote debugger is in a background tab', 'Module RCTImageLoader']);
YellowBox.ignoreWarnings(['Module SafeAreaManager requires main queue setup', 'Module RCTImageLoader']);
YellowBox.ignoreWarnings(['Class RCTCxx', 'Module RCTImageLoader']);
YellowBox.ignoreWarnings(['Warning: componentWillReceiveProps is deprecated ', 'Module RCTImageLoader']);
YellowBox.ignoreWarnings(['Module RCTWeChat requires main', 'Module RCTHotUpdate requires main']);


require('./libs/Global');
if (__DEV__){
    SplashScreen.hide();
}
let App = createStackNavigator({

    Load: {screen: Load},
    TestEngine: {screen: TestEngine},
    WordRead: {screen: WordRead},
    SentRead: {screen: SentRead},
    Word: {screen: Word},
    Units: {screen: Units},
    Sent: {screen: Sent},
    Launch: {screen: Launch},
    Main: {screen: Main},
    Main2: {screen: Main2},
    StudyCard: {screen: StudyCard},
    BuyCard: {screen: BuyCard},
    PaySuccess: {screen: PaySuccess},
    AddStudyCard: {screen: AddStudyCard},
    ConfirmOrder: {screen: ConfirmOrder},
    Report: {screen: Report},
    ExperienceVersion: {screen: ExperienceVersion},
    ExperiencePage: {screen: ExperiencePage},
    ExperienceHomework: {screen: ExperienceHomework},
    ExperienceSet: {screen: ExperienceSet},
    ExperienceTszx: {screen: ExperienceTszx},
    PaperStart: {screen: PaperStart},

    Setting: {screen: Setting},


    Passwd: {screen: Passwd},




    JoinClass: {screen: JoinClass},



    TSZX: {screen: TSZX},

    Login: {screen: Login},
    Forget: {screen: Forget},
    Reg: {screen: Reg},

    Test: {screen: Test},

    Phone: {screen: Phone},
    Username: {screen: Username},
    Useragreement: {screen: Useragreement},
    Userprivacy: {screen: Userprivacy},
    Userleave: {screen: Userleave},
    Userleavelast: {screen: Userleavelast},




    Update: {screen: Update},

    ExamResult: {screen: ExamResult},
    ExamResultDetail: {screen: ExamResultDetail},
    TSMN: {screen: TSMN},

    TSZXPaper: {screen: TSZXPaper},


    PaperExam: {screen: PaperExam},

    WordList: {screen: WordList},
    SentList: {screen: SentList},
    Kefu: {screen: Kefu},

},{headerMode: 'none', navigationOptions: {
        gesturesEnabled: false,
    }});

AppRegistry.registerComponent('studentRnProject', () => App);
