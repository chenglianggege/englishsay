//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by Fernflower decompiler)
//

package com.tt.util.httputil;

public final class TextUtils {
    public TextUtils() {
    }

    public static boolean isEmpty(CharSequence s) {
        if (s == null) {
            return true;
        } else {
            return s.length() == 0;
        }
    }

    public static boolean isBlank(CharSequence s) {
        if (s == null) {
            return true;
        } else {
            for(int i = 0; i < s.length(); ++i) {
                if (!Character.isWhitespace(s.charAt(i))) {
                    return false;
                }
            }

            return true;
        }
    }

    public static boolean containsBlanks(CharSequence s) {
        if (s == null) {
            return false;
        } else {
            for(int i = 0; i < s.length(); ++i) {
                if (Character.isWhitespace(s.charAt(i))) {
                    return true;
                }
            }

            return false;
        }
    }
}
