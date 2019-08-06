package com.tt.listener;

public interface OnRecordListener {
    void onRecordStart();

    void onRecording(int var1, int var2);

    void onRecordEnd(String var1);
}
