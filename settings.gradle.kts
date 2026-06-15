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
