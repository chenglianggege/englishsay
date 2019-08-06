package com.tt.setting;


import android.content.Context;
import android.util.Log;

import com.tt.listener.OnInitEngineListener;
import com.tt.util.AiUtil;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

public class EngineSetting {
    private static final String TAG = "17kouyu";
    private String native_res_path2 = "%s/native.res";
    public File provisionFile;
    private String provisionPath;
    private String serverAddress = "ws://api.17kouyu.com:8080";
    private String serverList = "";
    private int connectTimeout = 10;
    private int serverTimeout = 60;
    private String nativeResourcePath;
    private boolean isVADEnabled = true;
    private int vadSeek = 60;
    private boolean isSDKLogEnabled = true;
    private boolean isUseOnlineProvision;
    private boolean isNeedUpdateOnlineProvision;
    private String userId = "userId";
    private OnInitEngineListener onInitEngineListener;
    private static EngineSetting mEngineSetting;
    private Context mContext;



    private EngineSetting(Context context) {
        this.mContext = context;
    }

    public static EngineSetting getInstance(Context context) {
        return mEngineSetting == null ? (mEngineSetting = new EngineSetting(context)) : mEngineSetting;
    }

    public EngineSetting getDefaultCloudInstance() {
        EngineSetting setting = new EngineSetting(this.mContext);

            setting.setProvisionPath("").setServerAddress(this.serverAddress).setConnectTimeout(this.connectTimeout).setServerTimeout(this.serverTimeout).setVADEnabled(this.isVADEnabled).setVadSeek(this.vadSeek).setSDKLogEnabled(this.isSDKLogEnabled).setUseOnlineProvision(this.isUseOnlineProvision).setNeedUpdateOnlineProvision(this.isNeedUpdateOnlineProvision);

        return setting;
    }

    public EngineSetting getDefaultNativeInstance() {
        EngineSetting setting = new EngineSetting(this.mContext);
        if (this.getDefaultProvisionFile() == null) {
            Log.e("17kouyu", "provision file is null!");
        } else {
            this.provisionFile = this.getDefaultProvisionFile();
            setting.setProvisionPath(this.provisionFile.getAbsolutePath()).setNativeResourcePath(this.getNativeResourcePath()).setVADEnabled(this.isVADEnabled).setVadSeek(this.vadSeek).setSDKLogEnabled(this.isSDKLogEnabled).setUseOnlineProvision(this.isUseOnlineProvision).setNeedUpdateOnlineProvision(this.isNeedUpdateOnlineProvision);
        }

        return setting;
    }

    public File getDefaultProvisionFile() {
        try {
            InputStream is = this.mContext.getAssets().open("skegn.provision");
            File provisionFile = new File(AiUtil.externalFilesDir(this.mContext), "skegn.provision");
            AiUtil.writeToFile(provisionFile, is);
            is.close();
            return provisionFile;
        } catch (IOException var3) {
            var3.printStackTrace();
            return null;
        }
    }

    private String getProvisionPath() {
        return this.provisionPath;
    }

    private EngineSetting setProvisionPath(String provisionPath) {
        this.provisionPath = provisionPath;
        return this;
    }

    public String getServerAddress() {
        return this.serverAddress;
    }

    public EngineSetting setServerAddress(String serverAddress) {
        this.serverAddress = serverAddress;
        return this;
    }

    public String getServerList() {
        return this.serverList;
    }

    public EngineSetting setServerList(String serverList) {
        this.serverList = serverList;
        return this;
    }

    public int getConnectTimeout() {
        return this.connectTimeout;
    }

    public EngineSetting setConnectTimeout(int connectTimeout) {
        this.connectTimeout = connectTimeout;
        return this;
    }

    public EngineSetting setServerTimeout(int serverTimeout) {
        this.serverTimeout = serverTimeout;
        return this;
    }

    public int getServerTimeout() {
        return this.serverTimeout;
    }

    public String getNativeResourcePath() {
        String resourceDir = new String(AiUtil.unzipFile(this.mContext, "native.zip").toString());
        this.nativeResourcePath = String.format(this.native_res_path2, resourceDir);
        return this.nativeResourcePath;
    }

    private EngineSetting setNativeResourcePath(String nativeResourcePath) {
        this.nativeResourcePath = nativeResourcePath;
        return this;
    }

    public boolean isVADEnabled() {
        return this.isVADEnabled;
    }

    public EngineSetting setVADEnabled(boolean VADEnabled) {
        this.isVADEnabled = VADEnabled;
        return this;
    }

    public int getVadSeek() {
        return this.vadSeek;
    }

    public EngineSetting setVadSeek(int vadSeek) {
        this.vadSeek = vadSeek;
        return this;
    }

    public boolean isSDKLogEnabled() {
        return this.isSDKLogEnabled;
    }

    public EngineSetting setSDKLogEnabled(boolean SDKLogEnabled) {
        this.isSDKLogEnabled = SDKLogEnabled;
        return this;
    }

    public boolean isUseOnlineProvision() {
        return this.isUseOnlineProvision;
    }

    public EngineSetting setUseOnlineProvision(boolean useOnlineProvision) {
        this.isUseOnlineProvision = useOnlineProvision;
        return this;
    }

    public EngineSetting setNeedUpdateOnlineProvision(boolean needUpdateOnlineProvision) {
        this.isNeedUpdateOnlineProvision = needUpdateOnlineProvision;
        return this;
    }

    public boolean isNeedUpdateOnlineProvision() {
        return this.isNeedUpdateOnlineProvision;
    }

    public String getUserId() {
        return this.userId;
    }

    public EngineSetting setUserId(String userid) {
        if (userid != null && !"".equals(userid)) {
            this.userId = userid;
        }

        return this;
    }

    public OnInitEngineListener getOnInitEngineListener() {
        return this.onInitEngineListener;
    }

    public EngineSetting setOnInitEngineListener(OnInitEngineListener onInitEngineListener) {
        this.onInitEngineListener = onInitEngineListener;
        return this;
    }


}
