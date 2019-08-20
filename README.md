svn迁入项目后项目部署
1、安装npm yarn 具体：https://reactnative.cn/docs/getting-started/
2、yarn install
3、安装CoCoapods https://www.jianshu.com/p/0ba9edf8428d
4、进入ios目录 pod install
5、支付宝模块由于react升级，旧方法过期，需要修改支付宝模块源码
打开node_modules/react-native-yunpeng-alipay/android/src/main/java/com/yunpeng/alipay/AlipayPackage.java
去掉createJSModules方法的@Override
注有空把ios本地：支付宝模块的安卓模块已经本地化、npm安装的模块只是实现IOS支付（化，就可以去掉这个模块了）

遇到的问题

1、由于友盟统计是用pod安装的，ios工程需要用xcode打开xcworkspace，不能直接打开xcodeproj!!


2、node_modules/react-native/third-party/glog-0.3.4/src/base/mutex.h:105:10: fatal error: 'config.h' file not found

node_modules/react-native/scripts/ios-install-third-party.sh
cd node_modules/react-native/third-party/glog-0.3.4
sh ../../scripts/ios-configure-glog.sh

3、ld: framework not found UMMobClick
clang: error: linker command failed with exit code 1 (use -v to see invocation)

cd ios
rm -rf Pods
pod install


4、error: Build input file cannot be found: '/Volumes/MyFile/www/stproduct2/EnglishSay/student.reactnavite/node_modules/react-native/Libraries/WebSocket/libfishhook.a'

Libraries->RCTWebSocket.xcodeproj->TARGETS->Build Phases ->Link Binary With Libraries
删除libfishhook.a引用重新再引用

5、Execution failed for task ':app:transformClassesWithDexBuilderForDebug'.
将以下内容添加到app / build.gradle文件中：
android { 
... //其他各种设置都在这里
compileOptions { 
targetCompatibility JavaVersion.VERSION_1_8 
} 
} 

6.QMP96B5DPW
搜索QMP96B5DPW 