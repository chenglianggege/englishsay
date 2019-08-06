package com.tt;

public final class SkEgn {
    public static int SKEGN_MESSAGE_TYPE_JSON;
    public static int SKEGN_MESSAGE_TYPE_BIN;
    public static int SKEGN_OPT_GET_VERSION;
    public static int SKEGN_OPT_GET_MODULES;
    public static int SKEGN_OPT_GET_TRAFFIC;
    public static int SKEGN_OPT_SET_WIFI_STATUS;
    public static int SKEGN_OPT_GET_PROVISION;
    public static int SKEGN_OPT_GET_SERIAL_NUMBER;

    public SkEgn() {
    }

    public static native long skegn_new(String var0, Object var1);

    public static native int skegn_delete(long var0);

    public static native int skegn_start(long var0, String var2, byte[] var3, SkEgn.skegn_callback var4, Object var5);

    public static native int skegn_feed(long var0, byte[] var2, int var3);

    public static native int skegn_stop(long var0);

    public static native int skegn_cancel(long var0);

    public static native int skegn_opt(long var0, int var2, byte[] var3, int var4);

    public static native int skegn_get_device_id(byte[] var0, Object var1);

    static {
        System.loadLibrary("skegn");
        SKEGN_MESSAGE_TYPE_JSON = 1;
        SKEGN_MESSAGE_TYPE_BIN = 2;
        SKEGN_OPT_GET_VERSION = 1;
        SKEGN_OPT_GET_MODULES = 2;
        SKEGN_OPT_GET_TRAFFIC = 3;
        SKEGN_OPT_SET_WIFI_STATUS = 4;
        SKEGN_OPT_GET_PROVISION = 5;
        SKEGN_OPT_GET_SERIAL_NUMBER = 6;
    }

    public interface skegn_callback {
        int run(byte[] var1, int var2, byte[] var3, int var4);
    }
}
