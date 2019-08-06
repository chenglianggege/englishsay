import React from 'react';
import {createBottomTabNavigator, createStackNavigator, createMaterialTopTabNavigator} from 'react-navigation';
import {StyleSheet, Image} from "react-native";
import Home from './home_old'
import HomeWork from './homework'
import Personal from './personal'
import Header from './common/Header'
import {Dimensions} from 'react-native'
var {height,width} =  Dimensions.get('window');

const homeworkTabs = createMaterialTopTabNavigator({
    unFinish: {
        screen: HomeWork,
        navigationOptions: ({navigation}) => ({
            title: '未完成'
        })
    },
    finish: {
        screen: HomeWork,
        navigationOptions: ({navigation}) => ({
            title: '已完成'
        })
    }
},{
    tabBarOptions: {
        labelStyle: {
            fontSize: 15,
            color: "#6ab72b",
        },
        tabStyle: {
            height: 45,
        },
        style: {
            backgroundColor: '#fff',
        },
        indicatorStyle: {
            backgroundColor: "#6ab72b",
            height: 3,
            width: 34,
            marginLeft: width / 4 - 17,
            borderRadius: 1,

        },
        pressColor: "#6ab72b",
        pressOpacity: 0.5 // 按下标签时的不透明度
    },
    animationEnabled: false
})
let MainNav = {
    home: {
        screen: createStackNavigator({screen: Home}),
        navigationOptions: ({navigation}) => ({
            title: '首页',
            tabBarLabel: '首页',
            tabBarIcon: ({ tintColor, focused }) => (
                <Image resizeMode='contain'
                    source={focused ? require('../assets/tabNav/shouye.png') : require('../assets/tabNav/shouyehui.png')}
                    style={[styles.footImage]}
                />
            )
        })
    },
    homework: {
        screen: createStackNavigator(
            {screen: homeworkTabs},
            {navigationOptions:{
                    header: (<Header title="作业" isMain />)
                }}),
        navigationOptions: ({navigation}) => ({
            title: '作业',
            tabBarIcon: ({ tintColor, focused }) => (
                <Image resizeMode='contain'
                    source={focused ? require('../assets/tabNav/zuoye.png') : require('../assets/tabNav/zuoyeweihui.png')}
                    style={[styles.footImage]}
                />
            )
        })
    },
    personal: {
        screen: createStackNavigator({screen: Personal},{headerMode: 'none'}),
        navigationOptions: ({navigation}) => ({
            title: '我的',
            tabBarIcon: ({ tintColor, focused }) => (
                <Image resizeMode='contain'
                    source={focused ? require('../assets/tabNav/wode.png') : require('../assets/tabNav/wodehui.png')}
                    style={[styles.footImage]}
                />
            )
        })
    },
};

delete MainNav.homework
let Main2 = createBottomTabNavigator(MainNav,{
    tabBarOptions: {
        activeTintColor: '#30cc75',
        inactiveTintColor: '#707070',
        indicatorStyle: { height: 0 },
        style: {
            height: 49,
            backgroundColor: "#fff"
        },
        labelStyle: {
            fontSize: 12,
            lineHeight: 24,
            height: 24,
            marginTop: -10,
            marginBottom: -1

        },
        tabStyle: {

        }
    }
})

export{Main2}

const styles = StyleSheet.create({
    footImage: {
        height: 25,
        width: 25,
        marginBottom: 0
    }
});
