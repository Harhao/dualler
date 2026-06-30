plugins {}

kotlin {
    androidTarget()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        val commonMain by getting {
            dependencies {
                // 共享协议定义
            }
        }
    }
}

android {
    namespace = "com.dualler.sdk.shared"
    compileSdk = 34
}
