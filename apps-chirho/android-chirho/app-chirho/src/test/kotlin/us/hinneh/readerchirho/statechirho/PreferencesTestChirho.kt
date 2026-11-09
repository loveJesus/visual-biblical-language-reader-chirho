// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.statechirho

import android.content.SharedPreferences
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import us.hinneh.readerchirho.domainchirho.PassageChirho

/** SharedPreferences held in memory, enough for PreferencesChirho; an edit applies when it is applied or committed. */
private class MemoryStoreChirho : SharedPreferences {
    private val valuesChirho = mutableMapOf<String, Any?>()

    override fun getAll(): MutableMap<String, *> = valuesChirho.toMutableMap()
    override fun getString(keyChirho: String?, defaultChirho: String?): String? = valuesChirho[keyChirho] as? String ?: defaultChirho
    override fun getStringSet(keyChirho: String?, defaultChirho: MutableSet<String>?): MutableSet<String>? = defaultChirho
    override fun getInt(keyChirho: String?, defaultChirho: Int): Int = valuesChirho[keyChirho] as? Int ?: defaultChirho
    override fun getLong(keyChirho: String?, defaultChirho: Long): Long = valuesChirho[keyChirho] as? Long ?: defaultChirho
    override fun getFloat(keyChirho: String?, defaultChirho: Float): Float = valuesChirho[keyChirho] as? Float ?: defaultChirho
    override fun getBoolean(keyChirho: String?, defaultChirho: Boolean): Boolean = valuesChirho[keyChirho] as? Boolean ?: defaultChirho
    override fun contains(keyChirho: String?): Boolean = keyChirho in valuesChirho
    override fun edit(): SharedPreferences.Editor = EditorChirho()
    override fun registerOnSharedPreferenceChangeListener(listenerChirho: SharedPreferences.OnSharedPreferenceChangeListener?) = Unit
    override fun unregisterOnSharedPreferenceChangeListener(listenerChirho: SharedPreferences.OnSharedPreferenceChangeListener?) = Unit

    private inner class EditorChirho : SharedPreferences.Editor {
        private val changesChirho = mutableMapOf<String, Any?>()
        private val removedChirho = mutableSetOf<String>()

        private fun putChirho(keyChirho: String?, valueChirho: Any?) = apply { changesChirho[requireNotNull(keyChirho)] = valueChirho }
        override fun putString(keyChirho: String?, valueChirho: String?) = putChirho(keyChirho, valueChirho)
        override fun putStringSet(keyChirho: String?, valuesChirho: MutableSet<String>?) = putChirho(keyChirho, valuesChirho)
        override fun putInt(keyChirho: String?, valueChirho: Int) = putChirho(keyChirho, valueChirho)
        override fun putLong(keyChirho: String?, valueChirho: Long) = putChirho(keyChirho, valueChirho)
        override fun putFloat(keyChirho: String?, valueChirho: Float) = putChirho(keyChirho, valueChirho)
        override fun putBoolean(keyChirho: String?, valueChirho: Boolean) = putChirho(keyChirho, valueChirho)
        override fun remove(keyChirho: String?) = apply { removedChirho += requireNotNull(keyChirho) }
        override fun clear() = apply { removedChirho += valuesChirho.keys }
        override fun commit(): Boolean {
            apply()
            return true
        }

        override fun apply() {
            removedChirho.forEach { valuesChirho.remove(it) }
            valuesChirho.putAll(changesChirho)
        }
    }
}

class PreferencesTestChirho {
    @Test
    fun rootsDefaultsAreTodaysProverbsOnAndAutoplayOff() {
        val preferencesChirho = PreferencesChirho(MemoryStoreChirho())
        assertTrue(preferencesChirho.openTodayChirho)
        assertFalse(preferencesChirho.autoplayChirho)
        assertNull("no verse is saved before one is shown", preferencesChirho.lastShownChirho)
        assertNull("a first run has seen no welcome", preferencesChirho.welcomeSeenVersionChirho)
    }

    @Test
    fun choicesTheLastVerseAndTheWelcomeVersionSurviveAFreshLaunch() {
        val storeChirho = MemoryStoreChirho()
        PreferencesChirho(storeChirho).apply {
            openTodayChirho = false
            autoplayChirho = true
            lastShownChirho = PassageChirho("John", 1, 14)
            welcomeSeenVersionChirho = 4L
        }
        val relaunchedChirho = PreferencesChirho(storeChirho)
        assertFalse(relaunchedChirho.openTodayChirho)
        assertTrue(relaunchedChirho.autoplayChirho)
        assertEquals(PassageChirho("John", 1, 14), relaunchedChirho.lastShownChirho)
        assertEquals(4L, relaunchedChirho.welcomeSeenVersionChirho)
    }

    @Test
    fun aSavedVerseThatNoLongerParsesIsIgnored() {
        val storeChirho = MemoryStoreChirho()
        PreferencesChirho(storeChirho).lastShownChirho = PassageChirho("Prov", 0, 1)
        assertNull(PreferencesChirho(storeChirho).lastShownChirho)
    }
}
