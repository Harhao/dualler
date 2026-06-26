pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "dualler"

include(":platform-kmp")
project(":platform-kmp").projectDir = File("packages/platform-kmp")

include(":core-kmp")
project(":core-kmp").projectDir = File("packages/core-kmp")

include(":android")
project(":android").projectDir = File("packages/android")

include(":gradle-plugin")
project(":gradle-plugin").projectDir = File("packages/gradle-plugin")

include(":test-android-demo")
project(":test-android-demo").projectDir = File("test/android-demo")

include(":test-android-demo:app")
project(":test-android-demo:app").projectDir = File("test/android-demo/app")
