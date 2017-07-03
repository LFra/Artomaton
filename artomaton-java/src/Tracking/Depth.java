/**
 * Created by ludwigfrank on 31/01/2017.
 */


package Tracking;
import io.socket.client.Socket;
import org.json.JSONObject;
import processing.core.*;
import org.openkinect.processing.*;

import java.net.URISyntaxException;
import java.util.*;

import io.socket.client.IO;
import io.socket.emitter.Emitter;
import processing.event.KeyEvent;

public class Depth extends PApplet {
    private Socket socket;
    private KeyEvent keyEvent;

    private Kinect2 kinect2;
    private float distThreshold = 50;
    private Variables variables = new Variables();

    private PImage img;
    private PImage lines;

    static int canvasSize = 848;

    static float cx = 254.878f;
    static float cy = 205.395f;
    static float fx = 365.456f;
    static float fy = 365.456f;
    static double k1 = 0.0905474;
    static double k2 = -0.26819;
    static double k3 = 0.0950862;
    static double p1 = 0.0;
    static double p2 = 0.0;

    private boolean plotterReady = false;
    private ArrayList<int[][]> plotterValues = new ArrayList<int[][]>();
    private ArrayList<int[][]> currentPlotterValues;
    private int currentPlotterIndex = 0;
    private PShape s;

    public void settings() {
        size(512 + canvasSize, 424 + canvasSize, P3D);
    }

    public void setup(){
        frameRate(1);
        try {
            socket = IO.socket("http://localhost:3000");
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
        socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {

            @Override
            public void call(Object... args) {
                System.out.println((char)27 + "[36m SOCKET CONNECTED" + (char)27 + "[0m");
                socket.emit("KINECET_CONNECTED", "JAVA OPENED");
            }

        }).on("getNewLineDataFromProcessing", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                System.out.println((char)27 + "[36m SEND REQUEST, TRYING TO SEND DATA" + (char)27 + "[0m");
                JSONObject obj = new JSONObject();
                obj.put("hello", "server");
                obj.put("line", currentPlotterValues.get(currentPlotterIndex));
                socket.emit("NEW_LINE_DATA_FROM_PROCESSING", obj);
                currentPlotterIndex++;
            }
        }).on("canvasToLineData", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                System.out.println((char)27 + "[36m GENERATING VALUES" + (char)27 + "[0m");
                generateValues();
            }
        }).on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {

            @Override
            public void call(Object... args) {
                System.out.println((char)27 + "[34m SOCKET DISCONNECT" + (char)27 + "[0m");
            }

        });
        /*socket.on(Socket.EVENT_CONNECT, args -> {
            System.out.println((char)27 + "[36m SOCKET CONNECTED" + (char)27 + "[0m");

            socket.emit("KINECET_CONNECTED", "JAVA OPENED");
            // socket.disconnect();

        }).on("GET_DATA_FROM_PROCESSING", args -> sendValues()
        ).on(Socket.EVENT_DISCONNECT, args -> {
            System.out.println((char)27 + "[31m SOCKET DISCONNECTED" + (char)27 + "[0m");
            socket.emit("foo", "JAVA CLOSED");
        });*/
        socket.connect();
        kinect2 = new Kinect2(this);
        kinect2.initDepth();
        kinect2.initDevice();
        lines = createImage(canvasSize, canvasSize, RGB);
        img = createImage(kinect2.depthWidth, kinect2.depthHeight, RGB);
    }

    public void draw() {
        drawCanvas();
    }


    private void generateValues() {
        currentPlotterValues = new ArrayList<>(plotterValues);
    }

    private void drawCanvas() {

        stroke(0, 200);
        plotterValues.clear();
        background(220);

        image(lines, 0,0);
        img.loadPixels();
        img.updatePixels();
        image(img, canvasSize, 0);


        int[] depth = kinect2.getRawDepth();

        for (int y = 0; y < canvasSize; y ++) {
            for (int x = 0; x < canvasSize; x ++) {
                int index = x + y * canvasSize;
                lines.pixels[index] = color(214);
            }
        }

        int pX = 0;
        int pY = 0;
        int step = 2;
        int xOffset = 0;
        int left = 50;
        int right = 800;

        ArrayList<int []> currentLine = new ArrayList<>();
        for (int y = 0; y < kinect2.depthHeight; y  = y + step) {
            int _x = 0;
            for (int x = xOffset; x < kinect2.depthWidth - xOffset; x  = x + step) {
                int index = x + y * kinect2.depthWidth;
                int p = depth[index];
                float depthIn255 = 0;

                if (p > variables.getMinThresh() && p < variables.getMaxThresh()) {
                    depthIn255 = map(p, variables.getMinThresh(), variables.getMaxThresh(), 0, 255);
                    img.pixels[index] = color(depthIn255);
                } else img.pixels[index] = color(255);

                int displacedY = (int) (y + depthIn255 / 2);

                if (!(x - pX < step) && depthIn255 > 10 && Math.abs(pY - displacedY) < 10) {
                    int[] data = {_x * 2 * step, (displacedY * step) - 255};
                    // int[] data = {4, 4};
                    if (data[0] > left && data[1] > left && data[0] < right && data[1] < right) {
                        currentLine.add(data);
                    }
                    // line(pX * 2 * step, pY * step, _x * 2 * step, displacedY * step);
                } else if ( !(x - pX < step) && currentLine.size() > 3) {
                    int [][] cu = currentLine.toArray(new int[][]{new int[currentLine.size()]});
                    // System.out.println(Arrays.deepToString(cu));
                    plotterValues.add(cu);
                    currentLine.clear();
                } else {
                    // line(pX * 2 * step, pY * step, _x * 2 * step, displacedY * step);
                    // point(_x * 2 * step, displacedY * step);
                    currentLine.clear();
                }
                // s.vertex(_x * 2 * step, displacedY * step);
                pX = _x;
                pY = displacedY;
                _x ++;
            }
        }

        for (int[][] line : plotterValues) {
            // System.out.println(plotterValues.get(1).size());
            noFill();
            beginShape();
            for (Object aLine : line) {
                int [] a = (int[]) aLine;
                vertex(a[0], a[1]);
            }
            endShape();
        }
    }



    PVector depthToPointCloudPos(int x, int y, float depthValue) {
        PVector point = new PVector();
        point.z = (depthValue);// / (1.0f); // Convert from mm to meters
        point.x = (x - cx) * point.z / fx;
        point.y = (y - cy) * point.z / fy;
        return point;
    }
}
