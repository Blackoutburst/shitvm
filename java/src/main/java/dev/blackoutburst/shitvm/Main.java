package dev.blackoutburst.shitvm;

import java.nio.ByteBuffer;

public class Main {

    public static void main(String[] args) {
        try {
            ClassLoader classLoader = new ClassLoader();
            ByteBuffer buffer = classLoader.loadClass(args[0]);

            classLoader.decode(buffer);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
