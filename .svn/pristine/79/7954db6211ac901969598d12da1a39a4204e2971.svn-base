package com.tt;


import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Base64;
import android.util.Log;

import com.tt.util.MyUtil;
import com.tt.listener.OnInitEngineListener;
import com.tt.listener.OnRecordListener;
import com.tt.setting.EngineSetting;
import com.tt.setting.RecordSetting;
import com.tt.util.AiUtil;
import com.tt.util.HandlerUtils;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;

public class SkEgnManager {
    private static final String TAG = "17kouyu";
    public static final String SERVER_TYPE_CLOUD = "cloud";
    public static final String SERVER_TYPE_NATIVE = "native";
    public static final int CODE_CREATE_ENGINE_FAIL = 0;
    public static final int CODE_SKEGN_START_FAIL = -1;
    public static final int CODE_START_INIT_ENGINE = 1;
    public static final int CODE_INIT_ENGINE_SUCCESS = 2;
    public static final int CODE_INIT_ENGINE_FAILED = 3;
    public static final int CODE_RECORD_START = 5;
    public static final int CODE_RECORD_RECORDING = 6;
    public static final int CODE_RECORD_END = 7;
    SkEgnManager.engine_status status1;
    private Context mContext;
    private static SkEgnManager mSkEgnManager;
    public static long engine = 0L;
    private String mCurrentEngine;
    private boolean isObtainProvisionSuccess;
    private String mSerialNumber;
    private File provisionFile;
    private STRecorder recorder;
    private JSONObject params;
    private Handler mHandler;
    private OnInitEngineListener mOnInitEngineListener;
    private OnRecordListener mOnRecordListener;
    private JSONObject vadObj;
    private SkEgn.skegn_callback callback;

    private SkEgnManager(Context context) {
        this.status1 = SkEgnManager.engine_status.IDLE;
        this.mSerialNumber = "";
        this.provisionFile = null;
        this.recorder = null;
        this.params = null;
        this.callback = new SkEgn.skegn_callback() {
            public int run(byte[] id, int type, byte[] data, int size) {
                if (type == SkEgn.SKEGN_MESSAGE_TYPE_JSON) {
                    String result = (new String(data, 0, size)).trim();
                    if (SkEgnManager.this.mHandler != null) {
                        Message msg = new Message();
                        if(result.contains("vad_status") && result.contains("sound_intensity")){
                            try {
                                vadObj = new JSONObject(result);
                                msg.what = CODE_RECORD_RECORDING;
                                Bundle bundle = new Bundle();
                                bundle.putInt("vad_status", vadObj.getInt("vad_status"));
                                bundle.putInt("sound_intensity", vadObj.getInt("sound_intensity"));
                                msg.setData(bundle);//mes利用Bundle传递数据
                                mHandler.sendMessage(msg);//用activity中的handler发送消息
                                Log.e(TAG, "vad_status===>" + vadObj.getInt("vad_status") + "; sound_intensity===>" + vadObj.getInt("sound_intensity"));
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }
                        }else if(result.contains("sound_intensity")){
                            try {
                                vadObj = new JSONObject(result);

                                msg.what = CODE_RECORD_RECORDING;
                                Bundle bundle = new Bundle();
                                bundle.putInt("vad_status", 1);
                                bundle.putInt("sound_intensity", (int)vadObj.getDouble("sound_intensity"));
                                msg.setData(bundle);//mes利用Bundle传递数据
                                mHandler.sendMessage(msg);//用activity中的handler发送消息
                                Log.e(TAG, "sound_intensity===>" + (int)vadObj.getDouble("sound_intensity"));
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }
                        }else{
                            msg.what = CODE_RECORD_END;
                            msg.obj = result;
                            mHandler.sendMessage(msg);
                        }
                       /* if (result != null && result.contains("vad_status")) {
                            try {
                                SkEgnManager.this.vadObj = new JSONObject(result);
                                msg = new Message();
                                msg.what = 6;
                                Bundle bundle = new Bundle();
                                bundle.putInt("vad_status", SkEgnManager.this.vadObj.getInt("vad_status"));
                                bundle.putInt("sound_intensity", SkEgnManager.this.vadObj.getInt("sound_intensity"));
                                msg.setData(bundle);
                                SkEgnManager.this.mHandler.sendMessage(msg);
                                Log.e("17kouyu", "vad_status===>" + SkEgnManager.this.vadObj.getInt("vad_status") + "; sound_intensity===>" + SkEgnManager.this.vadObj.getInt("sound_intensity"));
                            } catch (JSONException var8) {
                                var8.printStackTrace();
                            }
                        } else {
                            msg = new Message();
                            msg.what = 7;
                            msg.obj = result;
                            SkEgnManager.this.mHandler.sendMessage(msg);
                        }*/


                    }
                }

                return 0;
            }
        };
        this.mContext = context;
    }

    public static SkEgnManager getInstance(Context context) {
        return mSkEgnManager == null ? (mSkEgnManager = new SkEgnManager(context)) : mSkEgnManager;
    }

    private void getHandlerOnMainThread() {
        this.mHandler = HandlerUtils.getInstance().getUIHandlerCB(new HandlerUtils.HandlerDispose() {
            public void handleMessage(Message msg) {
                switch(msg.what) {
                    case 1:
                        if (SkEgnManager.this.mOnInitEngineListener != null) {
                            SkEgnManager.this.mOnInitEngineListener.onStartInitEngine();
                        }
                        break;
                    case 2:
                        if (SkEgnManager.this.mOnInitEngineListener != null) {
                            SkEgnManager.this.mOnInitEngineListener.onInitEngineSuccess();
                        }
                        break;
                    case 3:
                        if (SkEgnManager.this.mOnInitEngineListener != null) {
                            SkEgnManager.this.mOnInitEngineListener.onInitEngineFailed();
                        }
                    case 4:
                    default:
                        break;
                    case 5:
                        Log.e("17kouyu", "SkEgnManager.CODE_RECORD_START");
                        if (SkEgnManager.this.mOnRecordListener != null) {
                            SkEgnManager.this.mOnRecordListener.onRecordStart();
                        }
                        break;
                    case 6:
                        Log.e("17kouyu", "SkEgnManager.CODE_RECORD_RECORDING");
                        Bundle bundle = msg.getData();
                        if (bundle != null) {
                            int vad_status = bundle.getInt("vad_status");
                            int sound_intensity = bundle.getInt("sound_intensity");
                            if (SkEgnManager.this.mOnRecordListener != null) {
                                SkEgnManager.this.mOnRecordListener.onRecording(vad_status, sound_intensity);
                            }
                        }
                        break;
                    case 7:
                        Log.e("17kouyu", "SkEgnManager.CODE_RECORD_END");
                        if (SkEgnManager.this.mOnRecordListener != null) {
                            SkEgnManager.this.mOnRecordListener.onRecordEnd((String)msg.obj);
                        }
                }

            }
        });
    }

    public void initCloudEngine(String appkey, String secretkey, String userId) {
        if (this.checkAppKeyAndSecretKey(appkey, secretkey)) {
            this.getHandlerOnMainThread();
            Log.e("17kouyu", "mHandler===>" + this.mHandler);
            if (this.mCurrentEngine != null) {
                SkEgn.skegn_delete(engine);
                engine = 0L;
                this.status1 = SkEgnManager.engine_status.STOP;
                this.mCurrentEngine = null;
            }

            EngineSetting.getInstance(this.mContext).setUserId(userId);
            EngineSetting setting = EngineSetting.getInstance(this.mContext).getDefaultCloudInstance();
            JSONObject cfg = new JSONObject();

            try {
//                File defaultProvisionFile = setting.getDefaultProvisionFile();
//                if (defaultProvisionFile == null) {
//                    Log.e("17kouyu", "证书文件不存在");
//                    return;
//                }

//                cfg.put("provision", defaultProvisionFile.getAbsolutePath());
                cfg.put("appKey", appkey);
                cfg.put("secretKey", secretkey);
                JSONObject vadObj = new JSONObject();
                vadObj.put("enable", setting.isVADEnabled() ? 1 : 0);
                vadObj.put("seek", setting.getVadSeek());
                cfg.put("vad", vadObj);
                JSONObject sdkLogObj = new JSONObject();
                sdkLogObj.put("enable", setting.isSDKLogEnabled() ? 1 : 0);
                sdkLogObj.put("output", AiUtil.externalFilesDir(this.mContext) + "/sdklog.txt");
                cfg.put("sdkLog", sdkLogObj);
                JSONObject cloudObj = new JSONObject();
                cloudObj.put("server", setting.getServerAddress());
                cloudObj.put("connectTimeout", setting.getConnectTimeout());
                cloudObj.put("serverTimeout", setting.getServerTimeout());
                if (!"ws://api.17kouyu.com:8080".equals(setting.getServerAddress())) {
                    cloudObj.put("serverList", "");
                }

                cfg.put("cloud", cloudObj);
            } catch (JSONException var10) {
                var10.printStackTrace();
            }

            Log.e("17kouyu", "初始化参数cfg===>" + cfg.toString());
            this.mCurrentEngine = "cloud";
            engine = SkEgn.skegn_new(cfg.toString(), this.mContext);
            if (engine != 0L) {
                Log.e("17kouyu", "初始化引擎成功");
            } else {
                Log.e("17kouyu", "初始化引擎失败");
            }

        }
    }

    public void initCloudEngine(String appkey, String secretkey, String userId, EngineSetting setting) {
        if (this.checkAppKeyAndSecretKey(appkey, secretkey)) {
            this.getHandlerOnMainThread();
            Log.e("17kouyu", "mHandler===>" + this.mHandler);
            if (setting == null) {
                this.initCloudEngine(appkey, secretkey, userId);
            } else {
                if (this.mCurrentEngine != null) {
                    SkEgn.skegn_delete(engine);
                    engine = 0L;
                    this.status1 = SkEgnManager.engine_status.STOP;
                    this.mCurrentEngine = null;
                }

                EngineSetting.getInstance(this.mContext).setUserId(userId);
//                if (setting.isUseOnlineProvision()) {
//                    this.isObtainProvisionSuccess = this.mContext.getSharedPreferences("17kouyu", 0).getBoolean("isObtainProvisionSuccess", false);
//                    this.checkProvisionFile(appkey, secretkey, setting.isNeedUpdateOnlineProvision());
//                } else {
//                    this.provisionFile = setting.getDefaultProvisionFile();
//                }

//                this.provisionFile = setting.getDefaultProvisionFile();

                this.mOnInitEngineListener = setting.getOnInitEngineListener();
                this.mHandler.sendEmptyMessage(1);
                JSONObject cfg = new JSONObject();

                try {
//                    if (this.provisionFile == null || !this.provisionFile.exists()) {
//                        Log.e("17kouyu", "证书文件不存在");
//                        return;
//                    }

//                    cfg.put("provision", this.provisionFile.getAbsolutePath());
                    cfg.put("appKey", appkey);
                    cfg.put("secretKey", secretkey);
                    JSONObject vadObj = new JSONObject();
                    vadObj.put("enable", setting.isVADEnabled() ? 1 : 0);
                    vadObj.put("seek", setting.getVadSeek());
                    cfg.put("vad", vadObj);
                    JSONObject sdkLogObj = new JSONObject();
                    sdkLogObj.put("enable", setting.isSDKLogEnabled() ? 1 : 0);
                    sdkLogObj.put("output", AiUtil.externalFilesDir(this.mContext) + "/sdklog.txt");
                    cfg.put("sdkLog", sdkLogObj);
                    JSONObject cloudObj = new JSONObject();
                    cloudObj.put("sdkCfgAddr","");
                    cloudObj.put("server", setting.getServerAddress());
                    cloudObj.put("connectTimeout", setting.getConnectTimeout());
                    cloudObj.put("serverTimeout", setting.getServerTimeout());
                    if (!"ws://api.17kouyu.com:8080".equals(setting.getServerAddress())) {
                        cloudObj.put("serverList", "");
                        cloudObj.put("server", setting.getServerAddress());
                    }

                    cfg.put("cloud", cloudObj);
                } catch (JSONException var9) {
                    var9.printStackTrace();
                }

                Log.e("17kouyu", "初始化参数cfg===>" + cfg.toString());
                this.mCurrentEngine = "cloud";
                engine = SkEgn.skegn_new(cfg.toString(), this.mContext);
                if (engine != 0L) {
                    Log.e("17kouyu", "初始化引擎成功");
                    if (setting.isUseOnlineProvision()) {
                        this.mContext.getSharedPreferences("17kouyu", 0).edit().putBoolean("isObtainProvisionSuccess", true).commit();
                        if (setting.isNeedUpdateOnlineProvision()) {
                            this.mContext.getSharedPreferences("17kouyu", 0).edit().putBoolean("isFirst", false).commit();
                        }
                    }

                    this.mHandler.sendEmptyMessage(2);
                } else {
                    Log.e("17kouyu", "初始化引擎失败");
                    this.mHandler.sendEmptyMessage(3);
                }
            }

        }
    }

    public void setUserId(String userId){
        EngineSetting.getInstance(this.mContext).setUserId(userId);
    }
    public void initNativeEngine(String appkey, String secretkey, String userId) {
        if (this.checkAppKeyAndSecretKey(appkey, secretkey)) {
            this.getHandlerOnMainThread();
            Log.e("17kouyu", "mHandler===>" + this.mHandler);
            if (this.mCurrentEngine != null) {
                SkEgn.skegn_delete(engine);
                engine = 0L;
                this.status1 = SkEgnManager.engine_status.STOP;
                this.mCurrentEngine = null;
            }

            EngineSetting.getInstance(this.mContext).setUserId(userId);
            this.getSerialNumber(appkey, secretkey);
            EngineSetting setting = EngineSetting.getInstance(this.mContext).getDefaultNativeInstance();
            JSONObject cfg = new JSONObject();

            try {
                File defaultProvisionFile = setting.getDefaultProvisionFile();
                if (defaultProvisionFile == null) {
                    Log.e("17kouyu", "证书文件不存在");
                    return;
                }

                cfg.put("provision", defaultProvisionFile);
                cfg.put("appKey", appkey);
                cfg.put("secretKey", secretkey);
                JSONObject vadObj = new JSONObject();
                vadObj.put("enable", setting.isVADEnabled() ? 1 : 0);
                vadObj.put("seek", setting.getVadSeek());
                cfg.put("vad", vadObj);
                JSONObject sdkLogObj = new JSONObject();
                sdkLogObj.put("enable", setting.isSDKLogEnabled() ? 1 : 0);
                sdkLogObj.put("output", AiUtil.externalFilesDir(this.mContext) + "/sdklog.txt");
                cfg.put("sdkLog", sdkLogObj);
                cfg.put("provision", setting.getDefaultProvisionFile().getAbsolutePath());
                cfg.put("native", setting.getNativeResourcePath());
            } catch (JSONException var9) {
                var9.printStackTrace();
            }

            Log.e("17kouyu", "初始化参数cfg===>" + cfg.toString());
            this.mCurrentEngine = "native";
            engine = SkEgn.skegn_new(cfg.toString(), this.mContext);
            if (engine != 0L) {
                Log.e("17kouyu", "初始化引擎成功");
            } else {
                Log.e("17kouyu", "初始化引擎失败");
            }

        }
    }

    public void initNativeEngine(String appkey, String secretkey, String userId, EngineSetting setting) {
        if (this.checkAppKeyAndSecretKey(appkey, secretkey)) {
            this.getHandlerOnMainThread();
            Log.e("17kouyu", "mHandler===>" + this.mHandler);
            if (setting == null) {
                this.initNativeEngine(appkey, secretkey, userId);
            } else {
                if (this.mCurrentEngine != null) {
                    SkEgn.skegn_delete(engine);
                    engine = 0L;
                    this.status1 = SkEgnManager.engine_status.STOP;
                    this.mCurrentEngine = null;
                }

                EngineSetting.getInstance(this.mContext).setUserId(userId);
                if (setting.isUseOnlineProvision()) {
                    this.isObtainProvisionSuccess = this.mContext.getSharedPreferences("17kouyu", 0).getBoolean("isObtainProvisionSuccess", false);
                    this.checkProvisionFile(appkey, secretkey, setting.isNeedUpdateOnlineProvision());
                } else {
                    this.provisionFile = setting.getDefaultProvisionFile();
                    this.getSerialNumber(appkey, secretkey);
                }

                this.mOnInitEngineListener = setting.getOnInitEngineListener();
                this.mHandler.sendEmptyMessage(1);
                JSONObject cfg = new JSONObject();

                try {
                    String provisionFilePath = "";
                    if (this.provisionFile != null ) {
                        provisionFilePath = this.provisionFile.getAbsolutePath();
                    }

                    cfg.put("provision", provisionFilePath);
                    cfg.put("appKey", appkey);
                    cfg.put("secretKey", secretkey);
                    JSONObject vadObj = new JSONObject();
                    vadObj.put("enable", setting.isVADEnabled() ? 1 : 0);
                    vadObj.put("seek", setting.getVadSeek());
                    cfg.put("vad", vadObj);
                    JSONObject sdkLogObj = new JSONObject();
                    sdkLogObj.put("enable", setting.isSDKLogEnabled() ? 1 : 0);
                    sdkLogObj.put("output", AiUtil.externalFilesDir(this.mContext) + "/sdklog.txt");
                    cfg.put("sdkLog", sdkLogObj);
                    cfg.put("native", setting.getNativeResourcePath());
                } catch (JSONException var8) {
                    var8.printStackTrace();
                }

                Log.e("17kouyu", "初始化参数cfg===>" + cfg.toString());
                this.mCurrentEngine = "native";
                engine = SkEgn.skegn_new(cfg.toString(), this.mContext);
                if (engine != 0L) {
                    if (setting.isUseOnlineProvision()) {
                        this.mContext.getSharedPreferences("17kouyu", 0).edit().putBoolean("isObtainProvisionSuccess", true).commit();
                        if (setting.isNeedUpdateOnlineProvision()) {
                            this.mContext.getSharedPreferences("17kouyu", 0).edit().putBoolean("isFirst", false).commit();
                        }
                    }

                    Log.e("17kouyu", "初始化引擎成功");
                    this.mHandler.sendEmptyMessage(2);
                } else {
                    Log.e("17kouyu", "初始化引擎失败");
                    this.mHandler.sendEmptyMessage(3);
                }
            }

        }
    }

    public boolean startRecord(String coreType, String refText, int qType, OnRecordListener onRecordListener) {
        if (this.recorder == null) {
            this.recorder = STRecorder.getInstance();
        }

        this.mOnRecordListener = onRecordListener;
        this.initParams(coreType, refText, qType);
        byte[] id = new byte[64];
        int rv = SkEgn.skegn_start(engine, this.params.toString(), id, this.callback, this.mContext);
        if (rv == -1) {
            Log.e("17kouyu", "skegn_start failed");
            this.stopRecord();
            return false;
        }
        this.status1 = SkEgnManager.engine_status.RECORDING;
        String wavPath = AiUtil.getFilesDir(this.mContext).getPath() + "/record/" + (new String(id)).trim() + ".wav";
        if (this.mHandler != null) {
            this.mHandler.sendEmptyMessage(5);
        }

        this.recorder.start(wavPath, new STRecorder.Callback() {
            public void onFrameRecorded(byte[] data, int size) {
                SkEgn.skegn_feed(SkEgnManager.engine, data, size);
            }
            public void onStop(String path){
                SkEgn.skegn_stop(SkEgnManager.engine);
            }
            public void onError(String errMsg){
                SkEgn.skegn_stop(SkEgnManager.engine);
            }
            public void onStart(){

            }
        });
        return true;
    }

    public boolean startRecord(RecordSetting setting, OnRecordListener onRecordListener) {
        if (setting == null) {
            Log.e("17kouyu", "RecordSetting instance is required!");
            return false;
        }
        this.recorder = STRecorder.getInstance();
        String recordFilePath =  setting.getRecordFilePath();
        String recordName = setting.getRecordName();

        this.mOnRecordListener = onRecordListener;
        this.initParams(setting);
        byte[] id = new byte[64];
        int rv = SkEgn.skegn_start(engine, this.params.toString(), id, this.callback, this.mContext);
        if (rv == -1) {
            Log.e("17kouyu", "skegn_start failed");
            this.stopRecord();
            return false;
        }
        this.status1 = SkEgnManager.engine_status.RECORDING;

        recordFilePath= recordFilePath.isEmpty()?AiUtil.getFilesDir(this.mContext).getPath() + "/record/" :recordFilePath ;
        recordName = recordName.isEmpty()?  (new String(id)).trim() + ".wav":recordName;
        String wavPath = recordFilePath+"/"+recordName;
        if (this.mHandler != null) {
            this.mHandler.sendEmptyMessage(5);
        }

        this.recorder.start(wavPath, new STRecorder.Callback() {
            public void onFrameRecorded(byte[] data, int size) {
                SkEgn.skegn_feed(SkEgnManager.engine, data, size);
            }
            public void onStop(String path){
                SkEgn.skegn_stop(SkEgnManager.engine);
            }
            public void onError(String errMsg){
                SkEgn.skegn_cancel(SkEgnManager.engine);
            }
            public void onStart(){

            }
        });
        return true;
    }

    public boolean existsAudioTrans(RecordSetting setting , OnRecordListener onRecordListener){

        try{
            if (setting ==null){
                Log.e("17kouyu", "RecordSetting instance is required!");
                return false;
            }
            String recordFilePath =  setting.getRecordFilePath();
            // String recordName = setting.getRecordName();
            this.mOnRecordListener = onRecordListener;
            this.initParams(setting);
            byte[] id = new byte[64];
            int rv = SkEgn.skegn_start(engine, this.params.toString(), id, this.callback, this.mContext);

            if (rv < 0) {
                Log.e("17kouyu", "skegn_start failed");
                this.stopRecord();
                return false;
            }

            this.status1 = SkEgnManager.engine_status.RECORDING;

            //String wavPath = recordFilePath+"/"+recordName;
            if (this.mHandler != null) {
                this.mHandler.sendEmptyMessage(5);
            }
            InputStream in = new FileInputStream(recordFilePath);
            BufferedInputStream buf = new BufferedInputStream(in);
            buf.skip(44);
            byte[]bytes = new byte[1024];
            int len  = 0;
            while ((len  = buf.read(bytes)) !=-1){
                SkEgn.skegn_feed(SkEgnManager.engine, bytes, bytes.length);
            }
            SkEgn.skegn_stop(SkEgnManager.engine);
            return true;

        }catch(Exception e){
            Log.e("17kouyu", e.getMessage());
            return false;

        }

    }


    public void stopRecord() {
        if (this.recorder != null) {
            this.recorder.stop();
        }

        this.status1 = SkEgnManager.engine_status.STOP;
    }

    public void recycle() {
        this.mCurrentEngine = null;
        this.provisionFile = null;
        if (engine != 0L) {
            SkEgn.skegn_delete(engine);
            engine = 0L;
            this.status1 = SkEgnManager.engine_status.STOP;
        }

        if (this.recorder != null) {
            this.recorder.stop();
            this.recorder.finalize();
            this.recorder = null;
        }



    }

    public void playback() {
        if (this.recorder != null) {
            this.recorder.playback();
        }

    }
    public void playWithPath(String playPath) {
        if (playPath != null && " "!= playPath) {
            this.recorder.playBackFile(playPath);

        }

    }

    private boolean checkAppKeyAndSecretKey(String appkey, String secretkey) {
        if (appkey != null && !"".equals(appkey)) {
            if (secretkey != null && !"".equals(secretkey)) {
                return true;
            } else {
                Log.e("17kouyu", "secretkey is required!");
                return false;
            }
        } else {
            Log.e("17kouyu", "appkey is required!");
            return false;
        }
    }

    private void checkProvisionFile(String appkey, String secretkey, boolean isNeedUpdateOnlineProvision) {
        File[] files = this.mContext.getExternalFilesDir((String)null).listFiles();
        int var7;
        if (isNeedUpdateOnlineProvision) {
            boolean isFirst = this.mContext.getSharedPreferences("17kouyu", 0).getBoolean("isFirst", true);
            File[] var6;
            int var8;
            File file;
            if (isFirst) {
                var6 = files;
                var7 = files.length;

                for(var8 = 0; var8 < var7; ++var8) {
                    file = var6[var8];
                    if ("skegn.provision".equals(file.getName())) {
                        file.delete();
                    }
                }

                this.saveProvision(appkey, secretkey);
            } else {
                var6 = files;
                var7 = files.length;

                for(var8 = 0; var8 < var7; ++var8) {
                    file = var6[var8];
                    if ("skegn.provision".equals(file.getName())) {
                        this.provisionFile = file;
                    }
                }

                if (this.provisionFile == null) {
                    this.isObtainProvisionSuccess = false;
                    this.saveProvision(appkey, secretkey);
                }
            }
        } else {
            File[] var10;
            int var11;
            File file;
            if (this.isObtainProvisionSuccess) {
                var10 = files;
                var11 = files.length;

                for(var7 = 0; var7 < var11; ++var7) {
                    file = var10[var7];
                    if ("skegn.provision".equals(file.getName())) {
                        this.provisionFile = file;
                    }
                }

                if (this.provisionFile == null) {
                    this.isObtainProvisionSuccess = false;
                    this.saveProvision(appkey, secretkey);
                }
            } else {
                if (MyUtil.isExistsProvisionFileInDD(this.mContext)) {
                    var10 = files;
                    var11 = files.length;

                    for(var7 = 0; var7 < var11; ++var7) {
                        file = var10[var7];
                        if ("skegn.provision".equals(file.getName())) {
                            file.delete();
                        }
                    }
                }

                this.saveProvision(appkey, secretkey);
            }
        }

    }

    private void saveProvision(String appkey, String secretkey) {
        JSONObject json = new JSONObject();

        try {
            json.put("appKey", appkey);
            json.put("secretKey", secretkey);
        } catch (JSONException var10) {
            var10.printStackTrace();
        }

        Log.e("17kouyu", "result===>" + MyUtil.getSerialNumber(this.mContext, json.toString()));

        try {
            JSONObject jsonObject = new JSONObject(MyUtil.getSerialNumber(this.mContext, json.toString()));
            this.mSerialNumber = jsonObject.getString("serialNumber");
            String provisionStr = jsonObject.getString("provision");
            this.mContext.getSharedPreferences("17kouyu", 0).edit().putString("serialNumber", this.mSerialNumber).commit();
            this.provisionFile = new File(this.mContext.getExternalFilesDir((String)null), "skegn.provision");
            FileOutputStream fos = null;

            try {
                byte[] decodeBytes = Base64.decode(provisionStr.getBytes(), 0);
                fos = new FileOutputStream(this.provisionFile);
                fos.write(decodeBytes);
                fos.close();
            } catch (Exception var8) {
                var8.printStackTrace();
            }
        } catch (JSONException var9) {
            Log.e("17kouyu", "result===>" + MyUtil.getSerialNumber(this.mContext, json.toString()));
        }

    }

    private void getSerialNumber(String appkey, String secretkey) {
        JSONObject json = new JSONObject();

        try {
            json.put("appKey", appkey);
            json.put("secretKey", secretkey);
        } catch (JSONException var6) {
            var6.printStackTrace();
        }

        Log.e("17kouyu", "result===>" + MyUtil.getSerialNumber(this.mContext, json.toString()));

        try {
            JSONObject jsonObject = new JSONObject(MyUtil.getSerialNumber(this.mContext, json.toString()));
            this.mSerialNumber = jsonObject.getString("serialNumber");
            this.mContext.getSharedPreferences("17kouyu", 0).edit().putString("serialNumber", this.mSerialNumber).commit();
        } catch (JSONException var5) {
            Log.e("17kouyu", MyUtil.getSerialNumber(this.mContext, json.toString()));
            var5.printStackTrace();
        }

    }

    public void initParams(String coreType, String refText, int qType) {
        this.params = new JSONObject();
        if (coreType != null && !"".equals(coreType)) {
            if (refText == null) {
                refText = "";
            }

            RecordSetting setting;
            if ("open.eval".equals(coreType)) {
                setting = new RecordSetting(refText, qType);
            } else if ("align.eval".equals(coreType)) {
                setting = new RecordSetting(refText);
            } else {
                setting = new RecordSetting(coreType, refText);
            }

            try {
                this.params.put("coreProvideType", this.mCurrentEngine);
                JSONObject appObj = new JSONObject();
                appObj.put("userId", EngineSetting.getInstance(this.mContext).getUserId());
                this.params.put("app", appObj);
                JSONObject audioObj = new JSONObject();
                audioObj.put("audioType", setting.getAudioType());
                audioObj.put("sampleRate", setting.getSampleRate());
                audioObj.put("channel", setting.getChannel());
                audioObj.put("sampleBytes", 2);
                audioObj.put("compress", "speex");
                this.params.put("audio", audioObj);
                JSONObject requestObj = new JSONObject();
                requestObj.put("coreType", coreType);
                if ("open.eval".equals(coreType)) {
                    requestObj.put("qType", qType);
                }

                if ("align.eval".equals(coreType)) {
                    requestObj.put("refAudio", setting.getRefAudio());
                } else {
                    requestObj.put("refText", setting.getRefText());
                }

                if ("native".equals(this.mCurrentEngine)) {
                    this.params.put("serialNumber", this.mContext.getSharedPreferences("17kouyu", 0).getString("serialNumber", ""));
                }

                this.params.put("request", requestObj);
            } catch (JSONException var8) {
                var8.printStackTrace();
            }

            Log.e("17kouyu", "上传参数params===>" + this.params.toString());
        } else {
            Log.e("17kouyu", "coreType is required!");
        }
    }

    public void initParams(RecordSetting setting) {
        this.params = new JSONObject();
        if (setting.getCoreType() != null && !"".equals(setting.getCoreType())) {
            try {
                this.params.put("coreProvideType", this.mCurrentEngine);
                JSONObject appObj = new JSONObject();
                appObj.put("userId", EngineSetting.getInstance(this.mContext).getUserId());
                this.params.put("app", appObj);
                JSONObject audioObj = new JSONObject();
                audioObj.put("audioType", setting.getAudioType());
                audioObj.put("sampleRate", setting.getSampleRate());
                audioObj.put("channel", setting.getChannel());
                audioObj.put("sampleBytes", 2);
                audioObj.put("compress", "speex");
                this.params.put("audio", audioObj);
                JSONObject requestObj = new JSONObject();
                requestObj.put("coreType", setting.getCoreType());
                if ("open.eval".equals(setting.getCoreType())) {
                    requestObj.put("qType", setting.getqType());
                    requestObj.put("keywords", setting.getKeywords());
                }

                if ("align.eval".equals(setting.getCoreType())) {
                    requestObj.put("refAudio", setting.getRefAudio());
                } else {
                    requestObj.put("refText", setting.getRefText());
                }

                requestObj.put("getParam", setting.isNeedRequestParamsInResult() ? 1 : 0);
                requestObj.put("paragraph_need_word_score", setting.isNeedWordScoreInParagraph() ? 1 : 0);
                requestObj.put("attachAudioUrl", setting.isNeedAttachAudioUrlInResult() ? 1 : 0);
                requestObj.put("phoneme_output", setting.isNeedPhonemeOutputInWord() ? 1 : 0);
                requestObj.put("dict_type", setting.getDict_type());
                requestObj.put("scale", setting.getScale());
                requestObj.put("precision", setting.getPrecision());
                requestObj.put("slack", setting.getSlack());
                requestObj.put("agegroup", setting.getAgegroup());
                requestObj.put("phoneme_diagnosis",setting.getPhonemeDiagnosis());
                this.params.put("request", requestObj);
                if ("native".equals(this.mCurrentEngine)) {
                    this.params.put("serialNumber", this.mContext.getSharedPreferences("17kouyu", 0).getString("serialNumber", ""));
                }

                this.params.put("soundIntensityEnable", setting.isNeedSoundIntensity() ? 1 : 0);
            } catch (JSONException var5) {
                var5.printStackTrace();
            }

            Log.e("17kouyu", "上传参数params===>" + this.params.toString());
        } else {
            Log.e("17kouyu", "coreType is required!");
        }
    }

    public static enum engine_status {
        IDLE,
        RECORDING,
        STOP;

        private engine_status() {
        }
    }
}

