// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

buildscript {
    dependencies {
        // AGP 9 compiles Kotlin itself; this pins its Kotlin Gradle plugin to the reviewed version.
        classpath(libs.kotlin.gradle.plugin.chirho)
    }
}

plugins {
    alias(libs.plugins.android.application.chirho) apply false
    alias(libs.plugins.kotlin.compose.chirho) apply false
    alias(libs.plugins.kotlin.serialization.chirho) apply false
}
