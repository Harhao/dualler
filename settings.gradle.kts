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
