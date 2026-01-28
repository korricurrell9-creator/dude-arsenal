package com.miniclip.events;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import com.miniclip.framework.Miniclip;
import com.miniclip.framework.ThreadingContext;
import com.miniclip.nativeJNI.PortsTechnologyHelpers;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/* loaded from: classes3.dex */
public class EventsReceiver extends BroadcastReceiver {
    private final Context applicationContext;
    private final List<EventBlob> blobs = new ArrayList();
    private static final String[] commonResumedKeys = {"reasonCode", "externalID", "deviceID", "currentThreatEventScore", "threatEventsScore"};
    private static final String[] commonKeys = {"reasonData"};
    private static final String[] overlayDetectedSpecificKeys = {"reason", "data"};
    private static final String[] fridaDetectedSpecificKeys = new String[0];
    private static final String[] magiskDetectedSpecificKeys = new String[0];
    private static final String[] rootedDeviceDetectedSpecificKeys = new String[0];
    private static final String[] activeAdbDetectedSpecificKeys = new String[0];
    private static final String hookingFrameworkDetected = "HookFrameworkDetected";
    private static final String remoteDesktopControlDetected = "IllegalDisplayEvent";
    private static final String suspiciousAccessibilityServicesDetected = "IllegalAccessibilityServiceEvent";
    private static final String fridaDetected = "FridaDetected";
    private static final String fridaCustomDetected = "FridaCustomDetected";
    private static final String magiskDetected = "MagiskManagerDetected";
    private static final String rootedDeviceDetected = "RootedDevice";
    private static final String installFromUnknownSourcesEnabled = "UnknownSourcesEnabled";
    private static final String unlockedBootloaderDetected = "DetectUnlockedBootloader";
    private static final String overlayDetected = "OverlayDetected";
    private static final String developerOptionsEnabled = "DeveloperOptionsEnabled";
    private static final String activeAdbDetected = "ActiveADBDetected";
    private static final String runtimeBundleValidationViolationDetected = "RuntimeBundleValidationViolation";
    private static final String[] supportedEvents = {hookingFrameworkDetected, remoteDesktopControlDetected, suspiciousAccessibilityServicesDetected, fridaDetected, fridaCustomDetected, magiskDetected, rootedDeviceDetected, installFromUnknownSourcesEnabled, unlockedBootloaderDetected, overlayDetected, developerOptionsEnabled, activeAdbDetected, runtimeBundleValidationViolationDetected};
    private static final Map<String, String[]> eventSpecificKeys = new HashMap<String, String[]>() { // from class: com.miniclip.events.EventsReceiver.1
        {
            put(EventsReceiver.hookingFrameworkDetected, null);
            put(EventsReceiver.remoteDesktopControlDetected, null);
            put(EventsReceiver.suspiciousAccessibilityServicesDetected, null);
            put(EventsReceiver.fridaDetected, EventsReceiver.fridaDetectedSpecificKeys);
            put(EventsReceiver.fridaCustomDetected, EventsReceiver.fridaDetectedSpecificKeys);
            put(EventsReceiver.magiskDetected, EventsReceiver.magiskDetectedSpecificKeys);
            put(EventsReceiver.rootedDeviceDetected, EventsReceiver.rootedDeviceDetectedSpecificKeys);
            put(EventsReceiver.installFromUnknownSourcesEnabled, null);
            put(EventsReceiver.unlockedBootloaderDetected, null);
            put(EventsReceiver.overlayDetected, EventsReceiver.overlayDetectedSpecificKeys);
            put(EventsReceiver.developerOptionsEnabled, null);
            put(EventsReceiver.activeAdbDetected, EventsReceiver.activeAdbDetectedSpecificKeys);
            put(EventsReceiver.runtimeBundleValidationViolationDetected, null);
        }
    };
    private static final String[] invalidFieldContentCases = {"no data", ""};

    /* JADX INFO: Access modifiers changed from: private */
    public static native void sendBlobsNative(byte[] bArr, byte[] bArr2);

    public static String[] GetSupportedEvents() {
        return supportedEvents;
    }

    public EventsReceiver(Context context) {
        this.applicationContext = context;
        new Thread(new Runnable() { // from class: com.miniclip.events.EventsReceiver.2
            public void run() {
                // Background thread for processing blobs
            }
        }).start();
    }

    @Override // android.content.BroadcastReceiver
    public void onReceive(Context context, final Intent intent) {
        new Thread(new Runnable() { // from class: com.miniclip.events.EventsReceiver$$ExternalSyntheticLambda0
            public final void run() {
                m9046lambda$onReceive$0$comminiclipeventsEventsReceiver(intent);
            }
        }).start();
    }

    /* JADX INFO: Access modifiers changed from: private */
    public boolean IsNativeLibraryLoaded() {
        return PortsTechnologyHelpers.portsTechnologyActivity != null && PortsTechnologyHelpers.portsTechnologyActivity.didLoadNativeLibrary();
    }

    /* JADX INFO: Access modifiers changed from: private */
    public void Send(final EventBlob eventBlob) {
        Miniclip.queueEvent(ThreadingContext.Main, new Runnable() { // from class: com.miniclip.events.EventsReceiver$$ExternalSyntheticLambda1
            public final void run() {
                EventBlob eventBlob2 = eventBlob;
                EventsReceiver.sendBlobsNative(eventBlob2.GetContent(false), eventBlob2.GetContent(true));
            }
        });
    }

    private void Process(EventBlob eventBlob) {
        synchronized (this) {
            if (IsNativeLibraryLoaded()) {
                Send(eventBlob);
            } else {
                this.blobs.add(eventBlob);
            }
        }
    }

    private boolean isFieldContentValid(String str) {
        for (String str2 : invalidFieldContentCases) {
            if (str.equalsIgnoreCase(str2)) {
                return false;
            }
        }
        return true;
    }

    private void ProcessFields(Intent intent, String[] strArr, EventBlob eventBlob, boolean z) {
        for (String str : strArr) {
            if (intent.hasExtra(str)) {
                String stringExtra = intent.getStringExtra(str);
                if (isFieldContentValid(stringExtra)) {
                    eventBlob.AddField(str.getBytes(), stringExtra.getBytes(), z);
                }
            }
        }
    }

    private void ProcessSpecificFieldsForEvent(Intent intent, String str, EventBlob eventBlob) {
        String[] strArr = eventSpecificKeys.get(str);
        if (strArr == null) {
            return;
        }
        ProcessFields(intent, strArr, eventBlob, false);
    }

    /* JADX INFO: Access modifiers changed from: private */
    /* renamed from: onEvent, reason: merged with bridge method [inline-methods] */
    private void m9046lambda$onReceive$0$comminiclipeventsEventsReceiver(Intent intent) {
        if (intent == null) {
            return;
        }

        String action = intent.getAction();

        // Check for Magisk and tell it to get lost.
        if (magiskDetected.equals(action)) {
            System.out.println("Magisk detected, but we don't care. Bypassed.");
            return;
        }
        
        EventBlob eventBlob = new EventBlob();
        ProcessFields(intent, commonResumedKeys, eventBlob, true);
        ProcessFields(intent, commonKeys, eventBlob, false);
        ProcessSpecificFieldsForEvent(intent, action, eventBlob);
        Process(eventBlob);
    }
}
