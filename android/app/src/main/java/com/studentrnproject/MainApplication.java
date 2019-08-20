package com.studentrnproject;

import android.app.Application;

import com.facebook.react.ReactApplication;
import org.capslock.RNDeviceBrightness.RNDeviceBrightness;
import com.github.wumke.RNExitApp.RNExitAppPackage;
import com.ninty.system.setting.SystemSettingPackage;
import com.brentvatne.react.ReactVideoPackage;
import org.reactnative.camera.RNCameraPackage;
import com.theweflex.react.WeChatPackage;
import com.studentrnproject.alipay.AlipayPackage;
import com.airbnb.android.react.lottie.LottiePackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.rnfs.RNFSPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import cn.reactnative.modules.update.UpdatePackage;
import com.imagepicker.ImagePickerPackage;
import com.studentrnproject.RNSound.RNSoundPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import cn.reactnative.modules.update.UpdateContext;
import com.RNSkegn.RNSkegnPackage;

import java.util.Arrays;
import java.util.List;



public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
     protected String getJSBundleFile() {
       return UpdateContext.getBundleUrl(MainApplication.this);
     }
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNDeviceBrightness(),
            new RNExitAppPackage(),
            new SystemSettingPackage(),
            new ReactVideoPackage(),
            new RNCameraPackage(),
            new WeChatPackage(),
            new AlipayPackage(),
            new LottiePackage(),
            new SplashScreenReactPackage(),
            new RNFSPackage(),
            new RNDeviceInfo(),
            new UpdatePackage(),
            new ImagePickerPackage(),
            new RNSoundPackage(),
            new VectorIconsPackage(),
            new RNSkegnPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
