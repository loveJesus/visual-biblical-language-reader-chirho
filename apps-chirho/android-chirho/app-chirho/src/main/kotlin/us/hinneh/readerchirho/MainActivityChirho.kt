// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho

import android.content.Context
import android.content.res.Configuration
import android.os.Bundle
import android.os.LocaleList
import android.view.Surface
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalConfiguration
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.createSavedStateHandle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import us.hinneh.readerchirho.audiochirho.ClipPlayerChirho
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho
import us.hinneh.readerchirho.contentchirho.WordChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.statechirho.HinnehApplicationChirho
import us.hinneh.readerchirho.statechirho.InterfaceLanguageChirho
import us.hinneh.readerchirho.statechirho.LaunchChirho
import us.hinneh.readerchirho.statechirho.PreferencesChirho
import us.hinneh.readerchirho.statechirho.ReaderViewModelChirho
import us.hinneh.readerchirho.uichirho.HinnehThemeChirho
import us.hinneh.readerchirho.uichirho.LocalTextScaleChirho
import us.hinneh.readerchirho.uichirho.ProvideTextScaleChirho
import us.hinneh.readerchirho.uichirho.ReaderActionsChirho
import us.hinneh.readerchirho.uichirho.ReaderScreenChirho
import us.hinneh.readerchirho.uichirho.WelcomeChirho
import us.hinneh.readerchirho.videochirho.VideoPlayerChirho

class MainActivityChirho : ComponentActivity() {
    /** A language chosen in Hinneh applies on every Android version; otherwise the device decides. */
    override fun attachBaseContext(newBaseChirho: Context) {
        val tagChirho = PreferencesChirho(newBaseChirho).interfaceLanguageChirho.tagChirho
        if (tagChirho == null) {
            super.attachBaseContext(newBaseChirho)
            return
        }
        val configurationChirho = Configuration(newBaseChirho.resources.configuration)
        configurationChirho.setLocales(LocaleList.forLanguageTags(tagChirho))
        super.attachBaseContext(newBaseChirho.createConfigurationContext(configurationChirho))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val graphChirho = (application as HinnehApplicationChirho).graphChirho
        // An explicit passage (for example from a test or a shared verse) wins on a fresh launch (LaunchChirho);
        // an activity Android restores keeps the verse it showed, even if it was first opened with one.
        val explicitChirho = intent.getStringExtra(EXTRA_PASSAGE_CHIRHO)?.takeIf { savedInstanceState == null }?.let { PassageChirho.parseChirho(it) }
        setContent {
            HinnehThemeChirho {
                val modelChirho: ReaderViewModelChirho = viewModel(
                    factory = viewModelFactory {
                        initializer {
                            ReaderViewModelChirho(
                                contentChirho = graphChirho.contentChirho,
                                mediaChirho = graphChirho.mediaChirho,
                                audioChirho = graphChirho.audioChirho,
                                playbackFactoryChirho = { scopeChirho -> ClipPlayerChirho(applicationContext, graphChirho.remoteChirho, scopeChirho) },
                                videoFactoryChirho = { scopeChirho ->
                                    VideoPlayerChirho(applicationContext, graphChirho.videoSourceChirho::bytesChirho, scopeChirho)
                                },
                                preferencesChirho = graphChirho.preferencesChirho,
                                savedChirho = createSavedStateHandle(),
                                explicitPassageChirho = explicitChirho,
                                greekIpaChirho = graphChirho.greekIpaChirho,
                            )
                        }
                    },
                )
                val stateChirho by modelChirho.uiStateChirho.collectAsStateWithLifecycle()
                val playbackChirho by modelChirho.playbackStateChirho.collectAsStateWithLifecycle()
                LifecycleEventEffect(Lifecycle.Event.ON_STOP) { modelChirho.stopAudioChirho() }
                val spanishChirho = LocalConfiguration.current.locales[0].language == "es"
                var textScaleChirho by remember { mutableFloatStateOf(graphChirho.preferencesChirho.textScaleChirho) }
                // The welcome shows on a first run and once after each update, until it is closed (GPT, DM #3642).
                var welcomeChirho by remember {
                    mutableStateOf(LaunchChirho.welcomeDueChirho(graphChirho.preferencesChirho.welcomeSeenVersionChirho, BuildConfig.VERSION_CODE.toLong()))
                }
                CompositionLocalProvider(LocalTextScaleChirho provides textScaleChirho) {
                    ProvideTextScaleChirho {
                        if (welcomeChirho) {
                            WelcomeChirho(spanishChirho) {
                                graphChirho.preferencesChirho.welcomeSeenVersionChirho = BuildConfig.VERSION_CODE.toLong()
                                welcomeChirho = false
                            }
                            return@ProvideTextScaleChirho
                        }
                        ReaderScreenChirho(
                            stateChirho = stateChirho,
                            playbackChirho = playbackChirho,
                            languageChirho = graphChirho.preferencesChirho.interfaceLanguageChirho,
                            textScaleChirho = textScaleChirho,
                            spanishChirho = spanishChirho,
                            imagesChirho = graphChirho.imagesChirho,
                            actionsChirho = object : ReaderActionsChirho {
                                override fun onBookChirho(idChirho: String) = modelChirho.selectBookChirho(idChirho)
                                override fun onChapterChirho(numberChirho: Int) = modelChirho.selectChapterChirho(numberChirho)
                                override fun onVerseChirho(numberChirho: Int) = modelChirho.selectVerseChirho(numberChirho)
                                override fun onStepChirho(forwardChirho: Boolean) = modelChirho.stepChirho(forwardChirho)
                                override fun onRetryChirho() = modelChirho.retryChirho()
                                override fun onToggleWordChirho(wordChirho: WordChirho) = modelChirho.toggleWordChirho(wordChirho)
                                override fun onToggleVerseChirho() = modelChirho.toggleVerseChirho()
                                override fun onVideoSurfaceChirho(surfaceChirho: Surface?) = modelChirho.videoSurfaceChirho(surfaceChirho)
                                override fun onRenditionChirho(renditionChirho: GreekRenditionChirho) =
                                    modelChirho.setRenditionChirho(renditionChirho)
                                override fun onSpeedChirho(speedChirho: Float) = modelChirho.setSpeedChirho(speedChirho)
                                override fun onLanguageChirho(languageChirho: InterfaceLanguageChirho) {
                                    if (graphChirho.preferencesChirho.interfaceLanguageChirho == languageChirho) return
                                    graphChirho.preferencesChirho.interfaceLanguageChirho = languageChirho
                                    recreate()
                                }
                                // Text size applies at once, without recreating the screen.
                                override fun onTextScaleChirho(scaleChirho: Float) {
                                    graphChirho.preferencesChirho.textScaleChirho = scaleChirho
                                    textScaleChirho = scaleChirho
                                }
                                override fun onOpenTodayChirho(openTodayChirho: Boolean) = modelChirho.setOpenTodayChirho(openTodayChirho)
                                override fun onAutoplayChirho(autoplayChirho: Boolean) = modelChirho.setAutoplayChirho(autoplayChirho)
                                override fun onShowIpaChirho(showIpaChirho: Boolean) = modelChirho.setShowIpaChirho(showIpaChirho)
                            },
                        )
                    }
                }
            }
        }
    }

    companion object {
        const val EXTRA_PASSAGE_CHIRHO = "us.hinneh.readerchirho.PASSAGE_CHIRHO"
    }
}
