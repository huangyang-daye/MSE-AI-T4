package com.example.aidoctor.utils

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

class HttpUtils {
    companion object {
        private const val BASE_URL = "http://26.26.26.1:8000" // 替换为您的服务器地址
        private const val TAG = "HttpUtils"

        suspend fun sendMessage(message: String): String = withContext(Dispatchers.IO) {
            var response = ""
            try {
                val encodedMessage = URLEncoder.encode(message, "UTF-8")
                val url = URL("$BASE_URL/get?msg=$encodedMessage")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 30000
                connection.readTimeout = 30000

                if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                    BufferedReader(InputStreamReader(connection.inputStream)).use { reader ->
                        response = reader.readText()
                    }
                    return@withContext response
                } else {
                    val errorMessage = "服务器响应错误: ${connection.responseCode}"
                    Log.e(TAG, errorMessage)
                    return@withContext errorMessage
                }
            } catch (e: Exception) {
                val errorMessage = when (e) {
                    is java.net.UnknownHostException -> "无法连接到服务器($BASE_URL)，请检查网络连接或服务器地址是否正确"
                    is java.net.ConnectException -> "连接服务器失败，服务器可能未启动或地址错误"
                    is java.net.SocketTimeoutException -> "连接超时，请检查网络状况"
                    is java.io.IOException -> "IO错误: ${e.message}"
                    else -> "错误: ${e.javaClass.simpleName} - ${e.message}"
                }
                Log.e(TAG, "Error sending message: $errorMessage")
                return@withContext errorMessage
            }
        }
    }
}