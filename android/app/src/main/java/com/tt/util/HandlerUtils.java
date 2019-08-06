package com.tt.util;

import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.util.Log;

public class HandlerUtils {
    private Handler mHandler;

    private HandlerUtils() {
    }

    public static HandlerUtils getInstance() {
        return HandlerUtils.Holder.instance;
    }

    public Handler getNewHandler() {
        Log.e("17kouyu", "getNewHandler===>");
        Looper myLooper = Looper.myLooper();
        Looper mainLooper = Looper.getMainLooper();
        if (myLooper == null) {
            this.mHandler = new Handler(mainLooper);
        } else {
            this.mHandler = new Handler(myLooper);
        }

        return this.mHandler;
    }

    public Handler getNewHandlerCB(final HandlerUtils.HandlerDispose hd) {
        Log.e("17kouyu", "getNewHandlerCB===>");
        Looper myLooper = Looper.myLooper();
        Looper mainLooper = Looper.getMainLooper();
        if (myLooper == null) {
            this.mHandler = new Handler(mainLooper) {
                public void handleMessage(Message msg) {
                    super.handleMessage(msg);
                    hd.handleMessage(msg);
                }
            };
        } else {
            this.mHandler = new Handler(myLooper) {
                public void handleMessage(Message msg) {
                    super.handleMessage(msg);
                    hd.handleMessage(msg);
                }
            };
        }

        return this.mHandler;
    }

    public Handler getNewChildHandler() {
        Log.e("17kouyu", "getNewChildHandler===>");
        Looper myLooper = Looper.myLooper();
        if (myLooper == null) {
            Looper.prepare();
            this.mHandler = new Handler(Looper.myLooper());
            Looper.loop();
        } else {
            this.mHandler = new Handler(myLooper);
        }

        return this.mHandler;
    }

    public Handler getNewChildHandlerCB(final HandlerUtils.HandlerDispose hd) {
        Log.e("17kouyu", "getNewChildHandlerCB===>");
        Looper myLooper = Looper.myLooper();
        if (myLooper == null) {
            Looper.prepare();
            this.mHandler = new Handler() {
                public void handleMessage(Message msg) {
                    super.handleMessage(msg);
                    hd.handleMessage(msg);
                }
            };
            Looper.loop();
        } else {
            this.mHandler = new Handler(myLooper) {
                public void handleMessage(Message msg) {
                    super.handleMessage(msg);
                    hd.handleMessage(msg);
                }
            };
        }

        return this.mHandler;
    }

    public Handler getUIHandler() {
        Log.e("17kouyu", "getUIHandler===>");
        return this.mHandler != null && this.mHandler.getLooper() == Looper.getMainLooper() ? this.mHandler : (this.mHandler = new Handler(Looper.getMainLooper()));
    }

    public Handler getUIHandlerCB(final HandlerUtils.HandlerDispose hd) {
        return this.mHandler != null && this.mHandler.getLooper() == Looper.getMainLooper() ? this.mHandler : (this.mHandler = new Handler(Looper.getMainLooper()) {
            public void handleMessage(Message msg) {
                super.handleMessage(msg);
                hd.handleMessage(msg);
            }
        });
    }

    public void UIOnFinish() {
        this.mHandler = null;
    }

    public interface HandlerDispose {
        void handleMessage(Message var1);
    }

    private static class Holder {
        public static HandlerUtils instance = new HandlerUtils();

        private Holder() {
        }
    }
}
