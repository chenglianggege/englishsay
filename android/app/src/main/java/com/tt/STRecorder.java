package com.tt;


import android.media.AudioRecord;
import android.media.AudioTrack;
import android.os.AsyncTask;
import android.util.Log;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;

public class STRecorder {
    private static String TAG = "STRecorder";
    private static int CHANNELS = 1;
    private static int BITS = 16;
    private static int FREQUENCY = 16000;
    private static int INTERVAL = 50;
    private static STRecorder instance = null;
    private AudioRecord recorder = null;
    private AudioTrack player = null;
    private byte[] buffer = null;
    private String path = null;
    public volatile boolean isRecording = false;
    private volatile boolean isPlaying = false;
    private STRecorder.Callback mCallback;
    private STRecorder.RecordTask mRecordTask;
    public STRecorder.PlayBackTask mPlayBackTask;



    public static STRecorder getInstance() {

        return instance == null ? (instance = new STRecorder()) : instance;
    }

    private STRecorder() {
        int bufferSize = CHANNELS * FREQUENCY * BITS * INTERVAL / 1000 / 8;
        int minBufferSize = AudioRecord.getMinBufferSize(FREQUENCY, 16, 2);
        if (minBufferSize > bufferSize) {
            bufferSize = minBufferSize;
        }

        this.buffer = new byte[bufferSize];
        this.recorder = new AudioRecord(0, FREQUENCY, 16, 2, bufferSize);
        this.player = new AudioTrack(3, FREQUENCY, 4, 2, this.buffer.length, 1);
    }

    protected void finalize() {
        this.recorder.release();
        this.player.release();
        instance = null;
        Log.e(TAG, "released");
    }

    public void start(String path, STRecorder.Callback callback) {
        this.path = path;
        this.mCallback = callback;
        if( this.mRecordTask != null){
            this.mRecordTask.cancel(true);
        }
        this.mRecordTask = new STRecorder.RecordTask();
        this.isPlaying = false;
        Log.e(TAG, "start record");
        this.mRecordTask.execute(new String[] { path });
    }

    public void stop() {
        if (this.isRecording) {
            this.isRecording = false;
        }

    }

    public void playback() {
        this.mPlayBackTask = new STRecorder.PlayBackTask();
        Log.e(TAG, "start playback");
        this.mPlayBackTask.execute(new Void[0]);
    }

    private RandomAccessFile fopen(String path) throws IOException {
        File f = new File(path);
        if (f.exists()) {
            f.delete();
        } else {
            File parentDir = f.getParentFile();
            if (!parentDir.exists()) {
                parentDir.mkdirs();
            }
        }

        RandomAccessFile file = new RandomAccessFile(f, "rw");
        file.writeBytes("RIFF");
        file.writeInt(0);
        file.writeBytes("WAVE");
        file.writeBytes("fmt ");
        file.writeInt(Integer.reverseBytes(16));
        file.writeShort(Short.reverseBytes((short)1));
        file.writeShort(Short.reverseBytes((short)CHANNELS));
        file.writeInt(Integer.reverseBytes(FREQUENCY));
        file.writeInt(Integer.reverseBytes(CHANNELS * FREQUENCY * BITS / 8));
        file.writeShort(Short.reverseBytes((short)(CHANNELS * BITS / 8)));
        file.writeShort(Short.reverseBytes((short)(CHANNELS * BITS)));
        file.writeBytes("data");
        file.writeInt(0);
        return file;
    }

    private void fwrite(RandomAccessFile file, byte[] data, int offset, int size) throws IOException {
        file.write(data, offset, size);
    }

    private void fclose(RandomAccessFile file) throws IOException {
        try {
            file.seek(4L);
            file.writeInt(Integer.reverseBytes((int)(file.length() - 8L)));
            file.seek(40L);
            file.writeInt(Integer.reverseBytes((int)(file.length() - 44L)));
        } finally {
            file.close();
        }

    }

    public class PlayBackTask extends AsyncTask<Void, Integer, Void> {
        public PlayBackTask() {
        }

        protected Void doInBackground(Void... params) {
            if (this.isCancelled()) {
                return null;
            } else {
                return playBackFile(STRecorder.this.path );
            }
        }

        protected void onCancelled() {
            super.onCancelled();
            STRecorder.this.isPlaying = false;
            if (STRecorder.this.player != null) {
                STRecorder.this.player.stop();
            }

            Log.e(STRecorder.TAG, "playback is cancled");
        }
    }

    public Void playBackFile(String path) {
        try {
            if (path != null) {
                RandomAccessFile file = new RandomAccessFile(path, "r");
                if (file != null) {
                    file.seek(44L);
                    STRecorder.this.isPlaying = true;
                    STRecorder.this.player.play();
                    Log.e(STRecorder.TAG, "start playback");

                    while(STRecorder.this.isPlaying) {
                        int size = file.read(STRecorder.this.buffer, 0, STRecorder.this.buffer.length);
                        if (size == -1) {
                            break;
                        }

                        STRecorder.this.player.write(STRecorder.this.buffer, 0, size);
                    }

                    STRecorder.this.player.flush();
                    STRecorder.this.player.stop();
                    STRecorder.this.isPlaying = false;
                }
            }
        } catch (IOException var7) {
            Log.e(STRecorder.TAG, var7.getMessage());
        } finally {
            STRecorder.this.isPlaying = false;
            if (STRecorder.this.player.getPlayState() != 1) {
                STRecorder.this.player.stop();
            }

            Log.e(STRecorder.TAG, "playback is stoped");
        }

        return null;
    }

    private class RecordTask extends AsyncTask<String, Integer, Void> {
        private RecordTask() {
        }

        protected Void doInBackground(String... params) {
            RandomAccessFile file = null;

            try {
                if (STRecorder.this.path != null) {
                    file = STRecorder.this.fopen(STRecorder.this.path);
                }

                Log.e(STRecorder.TAG, "start record");
                STRecorder.this.recorder.startRecording();
                Log.e(STRecorder.TAG, "onStart callback"  );
                STRecorder.this.mCallback.onStart();
                STRecorder.this.isRecording = true;
                Log.e(STRecorder.TAG, " record recording status :: "+ STRecorder.this.isRecording);
                while(STRecorder.this.isRecording && !isCancelled()) {
                    //Log.e(STRecorder.TAG, " record recording status :: "+ STRecorder.this.isRecording);
                    int size = STRecorder.this.recorder.read(STRecorder.this.buffer, 0, STRecorder.this.buffer.length);
                    if (size > 0) {
                        if (STRecorder.this.mCallback != null) {
                            STRecorder.this.mCallback.onFrameRecorded(STRecorder.this.buffer, size);
                        }

                        if (file != null) {
                            STRecorder.this.fwrite(file, STRecorder.this.buffer, 0, size);
                        }
                    }
                }
            } catch (Exception var12) {
                Log.e(STRecorder.TAG, var12.getMessage());
                STRecorder.this.mCallback.onError(var12.getMessage());
                Log.e(STRecorder.TAG, "onError callback"  );
            } finally {
                STRecorder.this.isRecording = false;
                Log.e(STRecorder.TAG, " record recording status :: "+ STRecorder.this.isRecording);
                try {
                    if (STRecorder.this.recorder.getRecordingState() != 1) {
                        STRecorder.this.recorder.stop();
                    }

                    Log.e(STRecorder.TAG, "record is stoped");
                    if (file != null) {
                        STRecorder.this.fclose(file);
                    }
                    Log.e(STRecorder.TAG, "onStop callback"  );
                    STRecorder.this.mCallback.onStop(STRecorder.this.path);

                } catch (Exception e) {
                    Log.e(STRecorder.TAG, e.getMessage());
                    STRecorder.this.mCallback.onError(e.getMessage());
                    Log.e(STRecorder.TAG, "onError callback"  );
                }

                //SkEgn.skegn_stop(SkEgnManager.engine);
            }

            return null;
        }
    }

    public interface Callback {
        void onFrameRecorded(byte[] frameBuffer, int bufferSize);
        void onStop(String tempFilePath);
        void onStart();
        void onError(String errMsg);
    }
}
