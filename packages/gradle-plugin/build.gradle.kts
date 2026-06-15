plugins {
    `java-gradle-plugin`
    kotlin("jvm")
}

group = "com.dualler"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation(gradleApi())
    implementation("org.jetbrains.kotlin:kotlin-stdlib:1.9.22")
}

gradlePlugin {
    plugins {
        create("duallerGradlePlugin") {
            id = "com.dualler.gradle-plugin"
            implementationClass = "com.dualler.plugin.DuallerPlugin"
        }
    }
}
