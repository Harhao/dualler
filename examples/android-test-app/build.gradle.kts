plugins {
    id("com.android.application") version "8.2.0"
    id("org.jetbrains.kotlin.android") version "1.9.20"
}

android {
    namespace = "com.example.duallertest"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.duallertest"
        minSdk = 21
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
        debug {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = "1.8"
    }

    sourceSets {
        getByName("main") {
            assets.srcDirs(files("$projectDir/src/main/assets"))
        }
    }
}

// Task to copy built dist into assets
tasks.register("copyDistToAssets") {
    group = "dualler"
    description = "Copy hello-world dist into android-test-app assets"
    doLast {
        val helloWorldDist = file("${rootDir.parentFile.parentFile}/hello-world/dist")
        val assetsDir = file("src/main/assets/dist")
        if (helloWorldDist.exists()) {
            assetsDir.mkdirs()
            copy {
                from(helloWorldDist)
                into(assetsDir)
            }
            println("Copied ${helloWorldDist.path} -> ${assetsDir.path}")
        } else {
            throw GradleException("hello-world dist not found at ${helloWorldDist.path}. Run 'dualler build' in examples/hello-world first.")
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation(project(":sdk"))
}
