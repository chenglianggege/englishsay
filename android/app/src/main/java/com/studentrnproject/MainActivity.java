package com.studentrnproject;

import android.os.Bundle; // here
import com.facebook.react.ReactActivity;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;
import com.flyme.notification.tools.utils.StatusbarColorUtils;
import android.os.Bundle; // here
import com.umeng.analytics.MobclickAgent;
import android.graphics.Color;
import android.app.Activity;
import android.view.WindowManager;

import org.devio.rn.splashscreen.SplashScreen; // here

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "studentRnProject";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        StatusbarColorUtils.setStatusBarDarkIcon(this, true);
        StatusbarColorUtils.setScreenKeepOn(this);
        SplashScreen.show(this);  // here
        super.onCreate(savedInstanceState);
        ReactDatabaseSupplier.getInstance(getApplicationContext()).setMaximumSize(60L * 1024L * 1024L);
        MobclickAgent.setSessionContinueMillis(1000);
    }

    @Override
    public void onResume() {
        super.onResume();
        MobclickAgent.onResume(this);
    }

    @Override
    public void onPause() {
        super.onPause();
        MobclickAgent.onPause(this);
    }
}
