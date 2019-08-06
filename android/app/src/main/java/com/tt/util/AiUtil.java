//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by Fernflower decompiler)
//

package com.tt.util;

import android.content.Context;
import android.util.Log;

import com.tt.util.httputil.EncodingUtils;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class AiUtil {
    private static String tag = "AiUtil";
    private static int BUFFER_SIZE = 8192;

    public AiUtil() {
    }

    public static String sha1(String message) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            md.update(message.getBytes(), 0, message.length());
            return bytes2hex(md.digest());
        } catch (Exception var2) {
            var2.printStackTrace();
            return null;
        }
    }

    public static String md5(Context c, InputStream is) {
        byte[] buf = new byte[BUFFER_SIZE];

        try {
//            InputStream is = c.getAssets().open(fileName);
//            InputStream is = new FileInputStream(file);
            MessageDigest md = MessageDigest.getInstance("MD5");

            int bytes;
            while((bytes = is.read(buf, 0, BUFFER_SIZE)) > 0) {
                md.update(buf, 0, bytes);
            }

            is.close();
            return bytes2hex(md.digest());
        } catch (Exception var6) {
            var6.printStackTrace();
            return null;
        }
    }

    public static long getWordCount(String sent) {
        return (long)sent.trim().split("\\W+").length;
    }

    public static long getHanziCount(String pin1yin1) {
        return (long)pin1yin1.trim().split("-").length;
    }

    public static File externalFilesDir(Context c) {
        File f = c.getExternalFilesDir((String)null);
        if (f == null || !f.exists()) {
            f = c.getFilesDir();
        }

        return f;
    }

    public static String readFile(File file) {
        String res = null;

        try {
            FileInputStream fin = new FileInputStream(file);
            int length = fin.available();
            byte[] buffer = new byte[length];
            fin.read(buffer);
            res = EncodingUtils.getString(buffer, "UTF-8");
            fin.close();
        } catch (FileNotFoundException var5) {
            var5.printStackTrace();
        } catch (IOException var6) {
            var6.printStackTrace();
        }

        return res;
    }

    public static String readFileFromAssets(Context c, String fileName) {
        String res = null;

        try {
            InputStream in = c.getAssets().open(fileName);
            int length = in.available();
            byte[] buffer = new byte[length];
            in.read(buffer);
            res = EncodingUtils.getString(buffer, "UTF-8");
            in.close();
        } catch (IOException var6) {
            var6.printStackTrace();
        }

        return res;
    }

    public static void writeToFile(String filePath, String string) {
        try {
            FileOutputStream fout = new FileOutputStream(filePath);
            byte[] bytes = string.getBytes();
            fout.write(bytes);
            fout.close();
        } catch (FileNotFoundException var4) {
            var4.printStackTrace();
        } catch (IOException var5) {
            var5.printStackTrace();
        }

    }

    public static void writeToFile(File f, String string) {
        try {
            FileWriter fw = new FileWriter(f);
            fw.write(string);
            fw.close();
        } catch (IOException var3) {
            var3.printStackTrace();
        }

    }

    public static void writeToFile(File f, InputStream is) {
        byte[] buf = new byte[BUFFER_SIZE];

        try {
            FileOutputStream fos = new FileOutputStream(f);

            int bytes;
            while((bytes = is.read(buf, 0, BUFFER_SIZE)) > 0) {
                fos.write(buf, 0, bytes);
            }

            fos.close();
        } catch (FileNotFoundException var5) {
            var5.printStackTrace();
        } catch (IOException var6) {
            var6.printStackTrace();
        }

    }

    public static File unzipFile(Context c, String fileName) {
        try {
            InputStream md5Is =  null;
            try {
                InputStream var2 = c.getAssets().open(fileName);
                md5Is = var2;
            } catch (IOException var8) {
                fileName = "native.res";
                md5Is = c.getAssets().open(fileName);
            }

            if(new File(  getFilesDir(c).getPath()+"/resupdate/native.res").exists()){
                fileName = "native.res";
                md5Is = new FileInputStream(new File(  getFilesDir(c).getPath()+"/resupdate/native.res"));
            }


            String pureName = fileName.replaceAll("\\.[^.]*$", "");
            File filesDir = externalFilesDir(c);
            File targetDir = new File(filesDir, pureName);
            String md5sum = md5(c, md5Is);
            File md5sumFile = new File(targetDir, ".md5sum");
            if (targetDir.isDirectory()) {
                if (md5sumFile.isFile()) {
                    String md5sum2 = readFile(md5sumFile);
                    if (md5sum2.equals(md5sum)) {
                        return targetDir;
                    }
                }

                removeDirectory(targetDir);
            }

            if ("native.res".equals(fileName)) {
                copyFile(c, fileName, targetDir);
            } else {
                unzip(c, fileName, targetDir);
            }

            writeToFile(md5sumFile, md5sum);
            return targetDir;
        } catch (Exception var9) {
            var9.printStackTrace();
            Log.e(tag, "Failed to extract resource", var9);
            return null;
        }
    }

    private static String bytes2hex(byte[] bytes) {
        StringBuffer sb = new StringBuffer(bytes.length * 2);

        for(int i = 0; i < bytes.length; ++i) {
            int v = bytes[i] & 255;
            if (v < 16) {
                sb.append('0');
            }

            sb.append(Integer.toHexString(v));
        }

        return sb.toString();
    }

    private static void removeDirectory(File directory) {
        if (directory.isDirectory()) {
            File[] files = directory.listFiles();

            for(int i = 0; i < files.length; ++i) {
                if (files[i].isDirectory()) {
                    removeDirectory(files[i]);
                }

                File to = new File(files[i].getAbsolutePath() + System.currentTimeMillis());
                files[i].renameTo(to);
                to.delete();
            }

            File to = new File(directory.getAbsolutePath() + System.currentTimeMillis());
            directory.renameTo(to);
            to.delete();
        }

    }

    public static File getFilesDir(Context context) {
        File targetDir = context.getExternalFilesDir((String)null);
        if (targetDir == null || !targetDir.exists()) {
            targetDir = context.getFilesDir();
        }

        return targetDir;
    }

    private static void copyFile(Context c, String fileName, File targetDir) throws IOException {
        InputStream is = c.getAssets().open(fileName);

        File newres =  new File(  getFilesDir(c).getPath()+"/resupdate/native.res");
        if(newres.exists()){
            is =  new FileInputStream(newres);
        }

        BufferedInputStream bis = new BufferedInputStream(is, BUFFER_SIZE);
        File file = new File(targetDir, fileName);
        File parentdir = file.getParentFile();
        if (parentdir != null && !parentdir.exists()) {
            parentdir.mkdirs();
        }

        byte[] buf = new byte[BUFFER_SIZE];
        FileOutputStream bos = new FileOutputStream(file);

        int pos;
        while((pos = bis.read(buf, 0, BUFFER_SIZE)) > 0) {
            bos.write(buf, 0, pos);
        }

        bos.flush();
        bos.close();
        bis.close();
        is.close();
    }



    private static void unzip(Context c, String fileName, File targetDir) throws IOException {
        InputStream is = c.getAssets().open(fileName);
        ZipInputStream zis = new ZipInputStream(new BufferedInputStream(is, BUFFER_SIZE));

        while(true) {
            ZipEntry ze;
            while((ze = zis.getNextEntry()) != null) {
                if (ze.isDirectory()) {
                    (new File(targetDir, ze.getName())).mkdirs();
                } else {
                    File file = new File(targetDir, ze.getName());
                    File parentdir = file.getParentFile();
                    if (parentdir != null && !parentdir.exists()) {
                        parentdir.mkdirs();
                    }

                    byte[] buf = new byte[BUFFER_SIZE];
                    FileOutputStream bos = new FileOutputStream(file);

                    int pos;
                    while((pos = zis.read(buf, 0, BUFFER_SIZE)) > 0) {
                        bos.write(buf, 0, pos);
                    }

                    bos.flush();
                    bos.close();
                }
            }

            zis.close();
            is.close();
            return;
        }
    }

    public static void copyNativeResToSD(Context c, String outFileName) throws IOException {
        OutputStream myOutput = new FileOutputStream(outFileName);
        InputStream myInput = c.getAssets().open("native.res");
        byte[] buffer = new byte[1024];

        for(int length = myInput.read(buffer); length > 0; length = myInput.read(buffer)) {
            myOutput.write(buffer, 0, length);
        }

        myOutput.flush();
        myInput.close();
        myOutput.close();
    }
}
