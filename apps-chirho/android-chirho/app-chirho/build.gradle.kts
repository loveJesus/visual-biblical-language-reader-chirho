// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

plugins {
    alias(libs.plugins.android.application.chirho)
    alias(libs.plugins.kotlin.compose.chirho)
    alias(libs.plugins.kotlin.serialization.chirho)
}

android {
    namespace = "us.hinneh.readerchirho"
    // API 36 is the newest platform installed on this Mac; AGP 9.3 supports up to API 37.
    compileSdk = 37

    defaultConfig {
        applicationId = "us.hinneh.readerchirho"
        minSdk = 26
        targetSdk = 37
        versionCode = 4
        versionName = "0.1.3"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    // The in-app English/Spanish choice needs both languages installed, never a store language split.
    bundle {
        language {
            enableSplit = false
        }
    }

    buildFeatures {
        compose = true
        // VERSION_CODE decides when the new-version welcome shows; VERSION_NAME is shown in Info.
        buildConfig = true
    }

    lint {
        warningsAsErrors = true
        abortOnError = true
    }

    testOptions {
        unitTests.all { testChirho ->
            // Read-only contract test input: this repository's published static tree.
            testChirho.systemProperty(
                "hinneh.staticRootChirho",
                rootProject.layout.projectDirectory.dir("../../static").asFile.absolutePath,
            )
            testChirho.systemProperty(
                "hinneh.fullCorpusChirho",
                providers.gradleProperty("hinneh.fullCorpusChirho").getOrElse("false"),
            )
            // Opt-in checks against the live site through the app's own network path.
            testChirho.systemProperty(
                "hinneh.liveChirho",
                providers.gradleProperty("hinneh.liveChirho").getOrElse("false"),
            )
        }
    }
}

kotlin {
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}

dependencies {
    implementation(platform(libs.compose.bom.chirho))
    implementation(libs.compose.ui.chirho)
    implementation(libs.compose.foundation.chirho)
    implementation(libs.compose.material3.chirho)
    implementation(libs.activity.compose.chirho)
    implementation(libs.core.ktx.chirho)
    implementation(libs.lifecycle.viewmodel.compose.chirho)
    implementation(libs.lifecycle.runtime.compose.chirho)
    implementation(libs.serialization.json.chirho)
    implementation(libs.coroutines.android.chirho)

    testImplementation(libs.junit.chirho)
    testImplementation(libs.coroutines.test.chirho)

    androidTestImplementation(platform(libs.compose.bom.chirho))
    androidTestImplementation(libs.compose.ui.test.junit4.chirho)
    androidTestImplementation(libs.androidx.test.runner.chirho)
    androidTestImplementation(libs.androidx.test.ext.junit.chirho)
    debugImplementation(libs.compose.ui.test.manifest.chirho)
}
