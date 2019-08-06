package com.tt.util;


import android.content.Context;
import android.util.Log;

import com.tt.SkEgn;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.Arrays;

public class MyUtil {
    public MyUtil() {
    }

    public static String getSerialNumber(Context context, String cfg) {
        byte[] buf = new byte[1024];
        JSONObject cfg_json = null;
        int deviceId = SkEgn.skegn_get_device_id(buf, context);
        Log.e("sss", "deviceId===>" + deviceId + ";buf===>" + new String(buf));

        try {
            cfg_json = new JSONObject(cfg);
            cfg_json.put("deviceId", (new String(buf)).trim());
        } catch (JSONException var7) {
            var7.printStackTrace();
        }

        byte[] cfg_b = Arrays.copyOf(cfg_json.toString().getBytes(), 1024);
        int ret = SkEgn.skegn_opt(0L, 6, cfg_b, 1024);
        return ret > 0 ? new String(cfg_b, 0, ret) : new String(cfg_b);
    }

    public static boolean isExistsProvisionFileInDD(Context context) {
        File[] files = context.getExternalFilesDir((String)null).listFiles();

        for(int i = 0; i < files.length; ++i) {
            File file = files[i];
            if ("skegn.provision".equals(file.getName())) {
                return true;
            }
        }

        return false;
    }
}

