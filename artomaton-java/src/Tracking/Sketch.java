/**
 * Created by ludwigfrank on 31/01/2017.
 */


package Tracking;
import io.socket.client.Socket;
import processing.core.*;
import org.openkinect.processing.*;

import java.net.URISyntaxException;
import java.util.*;

import io.socket.client.IO;
import io.socket.emitter.Emitter;
import processing.event.KeyEvent;


public class Sketch extends PApplet {
    private Socket socket;
    private KeyEvent keyEvent;

    private Kinect2 kinect2;
    private float distThreshold = 50;
    private int blobCounter = 1;
    private Variables variables = new Variables();

    private PImage img;
    private ArrayList<Blob> blobs = new ArrayList<>();
    private HashMap<Integer,ArrayList<Float[]>> positions = new HashMap<>();
    private int currentID = 0;
    private boolean active = false;

    private void addBlob(ArrayList<Blob> blobs, Blob blob) {
        blob.id = blobCounter;
        positions.put(blob.id, new ArrayList<>());
        if (!active) currentID = blob.id;
        blobs.add(blob);
        blobCounter++;
    }

    private void removeBlob(ArrayList<Blob> blobs, Blob blob, int index) {
        println(Arrays.deepToString((positions.get(blob.id)).toArray()));
        socket.emit("NEW_COORDINATE_ARRAY", positions.get(blob.id));
        if (blob.id == currentID) active = false;
        positions.remove(blob.id);
        blobs.remove(index);
    }

    private void addPosition(Blob b) {
        ArrayList values = positions.get(b.id);
        float[] newPosition = new float[2];
        PVector position = b.getCenter();
        newPosition[0] = position.x;
        newPosition[1] = position.y;
        values.add(newPosition);
        positions.put(b.id, values);
    }

    public void settings() {
        size(512, 424, P3D);
    }

    public void setup(){
        frameRate(10);
        try {
            socket = IO.socket("http://localhost:3000");
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
        socket.on(Socket.EVENT_CONNECT, args -> {
            System.out.println((char)27 + "[36m SOCKET CONNECTED" + (char)27 + "[0m");

            socket.emit("KINECET_CONNECTED", "JAVA OPENED");
            // socket.disconnect();

        }).on("event", new Emitter.Listener() {

            @Override
            public void call(Object... args) {}

        }).on(Socket.EVENT_DISCONNECT, args -> {
            System.out.println((char)27 + "[31m SOCKET DISCONNECTED" + (char)27 + "[0m");
            socket.emit("foo", "JAVA CLOSED");
        });
        socket.connect();

        kinect2 = new Kinect2(this);
        kinect2.initDepth();
        kinect2.initDevice();
        img = createImage(kinect2.depthWidth, kinect2.depthHeight, RGB);
    }


    public void draw() {
        ArrayList<Blob> currentBlobs = new ArrayList<>();

        background(0);

        img.loadPixels();
        img.updatePixels();
        image(img, 0, 0);

        int[] depth = kinect2.getRawDepth();

        // TODO: Make the Tracker ignore small Blobs
        // TODO: Make the Tracker ignore Blobs that enter the frame for a given short amount
        // TODO: Give the Blobs a maximum Size
        // TODO: Ignore objects that are not human shaped

        for (int x = 0; x < kinect2.depthWidth; x++) {
            for (int y = 0; y < kinect2.depthHeight; y++) {
                int index = x + y * kinect2.depthWidth;
                int p = depth[index];

                if (p > variables.getMinThresh() && p < variables.getMaxThresh()) {
                    img.pixels[index] = color(120, 0, 255);
                    boolean found = false;
                    for (Blob b : currentBlobs) {
                        if (b.isNear(x, y)) {
                            b.add(x, y);
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        Blob b = new Blob(x, y, this);
                        currentBlobs.add(b);
                        // TODO: Debounce the event so that not too many positions are sent
//                        JSONObject obj = new JSONObject();
//                            obj.put("Position", b.getCenter());
//                        socket.emit("NEW_BLOB", obj);
                    }
                } else {
                    img.pixels[index] = color(0);
                }
            }
        }

        for (int i = currentBlobs.size()-1; i >= 0; i--) {
            if (currentBlobs.get(i).size() < variables.getMinSize()) {
                currentBlobs.remove(i);
            }
        }

        // There are no blobs!
        if (blobs.isEmpty() && currentBlobs.size() > 0) {
            println("Adding blobs!");
            for (Blob b : currentBlobs) {
                // Give the new Blob a new ID
                addBlob(blobs, b);
            }
        } else if (blobs.size() <= currentBlobs.size()) {
            // Match whatever blobs you can match
            // TODO: Predict which way the Blob is moving to get more accurate results
            for (Blob b : blobs) {
                float recordDistance = 500;
                Blob matched = null;

                // traverseBlobs(currentBlobs);
                for (Blob cb : currentBlobs) {
                    PVector centerB = b.getCenter();
                    PVector centerCB = cb.getCenter();
                    float d = PVector.dist(centerB, centerCB);
                    if (d < recordDistance && !cb.taken) {
                        recordDistance = d;
                        matched = cb;
                    }
                }


                if (matched != null) {
                    matched.taken = true;
                    b.become(matched);
                }

            }

            // Whatever is leftover make new blobs
            for (Blob b : currentBlobs) {
                if (!b.taken) {
                    addBlob(blobs, b);
                }
            }
        } else if (blobs.size() > currentBlobs.size()) {
            for (Blob b : blobs) {
                b.taken = false;
            }

            // Match whatever blobs you can match
            for (Blob cb : currentBlobs) {
                float recordDistance = 500;
                Blob matched = null;
                for (Blob b : blobs) {
                    PVector centerB = b.getCenter();
                    PVector centerCB = cb.getCenter();
                    float d = PVector.dist(centerB, centerCB);
                    if (d < recordDistance && !b.taken) {
                        recordDistance = d;
                        matched = b;
                    }
                }
                if (matched != null) {
                    matched.taken = true;
                    matched.lifespan = variables.getMaxLife();
                    matched.become(cb);
                }
            }
            for (int i = blobs.size() - 1; i >= 0; i--) {
                Blob b = blobs.get(i);
                int id = b.id;

                if (!b.taken) {
                    if (b.checkLife()) {
                        removeBlob(blobs, b, i);
                    }
                }
            }
        }

        for (Blob b : blobs) {
            addPosition(b);
            b.show();
        }



        textAlign(RIGHT);
        fill(0);
        //text(currentBlobs.size(), width-10, 40);
        //text(blobs.size(), width-10, 80);
        textSize(24);
        text("color threshold: " + 10, width-10, 50);
        text("distance threshold: " + distThreshold, width-10, 25);
    }

    // TODO: traverseBlob to avoid duplicate code
    private void traverseBlobs(ArrayList<Blob> currentBlobs, ArrayList<Blob> oldBlobs, boolean createNew) {
        for (Blob b : oldBlobs) {
            float recordDistance = 1000;
            Blob matched = null;

            for (Blob cb : currentBlobs) {
                PVector centerB = b.getCenter();
                PVector centerCB = cb.getCenter();
                float d = PVector.dist(centerB, centerCB);
                if (d < recordDistance && !cb.taken) {
                    recordDistance = d;
                    matched = cb;
                }
            }

            if (matched != null) {
                matched.taken = true;
            }
            b.become(matched);
        }
    }
};
