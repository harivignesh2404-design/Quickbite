package com.example.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "quickbite_prefs")

data class StoredConfig(
  val apiBaseUrl: String = "",
  val supabaseUrl: String = "",
  val supabaseAnonKey: String = "",
  val accessToken: String = "",
)

class QuickBitePreferences(private val context: Context) {
  private object Keys {
    val API_BASE_URL = stringPreferencesKey("api_base_url")
    val SUPABASE_URL = stringPreferencesKey("supabase_url")
    val SUPABASE_ANON_KEY = stringPreferencesKey("supabase_anon_key")
    val ACCESS_TOKEN = stringPreferencesKey("access_token")
  }

  val configFlow: Flow<StoredConfig> =
    context.dataStore.data.map { prefs ->
      StoredConfig(
        apiBaseUrl = prefs[Keys.API_BASE_URL] ?: "",
        supabaseUrl = prefs[Keys.SUPABASE_URL] ?: "",
        supabaseAnonKey = prefs[Keys.SUPABASE_ANON_KEY] ?: "",
        accessToken = prefs[Keys.ACCESS_TOKEN] ?: "",
      )
    }

  suspend fun saveServerConfig(apiUrl: String, supabaseUrl: String, anonKey: String) {
    context.dataStore.edit { prefs ->
      prefs[Keys.API_BASE_URL] = apiUrl.trim()
      prefs[Keys.SUPABASE_URL] = supabaseUrl.trim()
      prefs[Keys.SUPABASE_ANON_KEY] = anonKey.trim()
    }
  }

  suspend fun saveAccessToken(token: String) {
    context.dataStore.edit { prefs -> prefs[Keys.ACCESS_TOKEN] = token }
  }
}
