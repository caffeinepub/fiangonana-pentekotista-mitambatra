# Building Android APK for Vondrona

This guide explains how to build an Android APK from your React web application using Capacitor.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js and npm/pnpm** (already installed for frontend development)
2. **Java Development Kit (JDK) 17 or higher**
   - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or use OpenJDK
   - Set `JAVA_HOME` environment variable
3. **Android Studio**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK (API level 33 or higher recommended)
   - Set `ANDROID_HOME` environment variable to your Android SDK location
4. **Capacitor CLI**
   ```bash
   npm install -g @capacitor/cli
   ```

### Environment Variables

Add these to your system environment:

**Windows (PowerShell):**
