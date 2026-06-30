plugins {
    id 'com.android.library'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.dualler.sdk'
    compileSdk 34

    defaultConfig {
        minSdk 21
        targetSdk 34
    }

    kotlinOptions {
        jvmTarget = '1.8'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'com.tencent.mars:mars-xlog:1.2.4'
}
