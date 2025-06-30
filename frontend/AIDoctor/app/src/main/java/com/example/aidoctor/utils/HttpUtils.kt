package com.example.aidoctor.utils

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

class HttpUtils {
    companion object {
        private const val BASE_URL = "http://192.168.1.101:8000"
        private const val TAG = "HttpUtils"

        suspend fun sendMessage(sessionId: Long, message: String): String = withContext(Dispatchers.IO) {
            var response = ""
            try {
                val url = URL("$BASE_URL/get")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.doOutput = true
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                connection.setRequestProperty("Accept", "application/json; charset=UTF-8")
                connection.connectTimeout = 300000
                connection.readTimeout = 300000

                // 构建请求体
                val jsonObject = JSONObject().apply {
                    put("session_id", sessionId)
                    put("msg", message)
                }

                // 发送请求
                connection.outputStream.use { os ->
                    os.write(jsonObject.toString().toByteArray(Charsets.UTF_8))
                    os.flush()
                }

                if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                    BufferedReader(InputStreamReader(connection.inputStream, "UTF-8")).use { reader ->
                        val responseText = reader.readText()
                        val responseJson = JSONObject(responseText)
                        if (responseJson.has("response")) {
                            response = responseJson.getString("response")
                        } else {
                            response = "无法获取响应"
                        }
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

//        suspend fun trackCondition(sessionId: Long): String = withContext(Dispatchers.IO) {
//            var response = ""
//            try {
//                val url = URL("$BASE_URL/track_condition")
//                val connection = url.openConnection() as HttpURLConnection
//                connection.requestMethod = "POST"
//                connection.doOutput = true
//                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
//                connection.setRequestProperty("Accept", "application/json; charset=UTF-8")
//                connection.connectTimeout = 300000
//                connection.readTimeout = 300000
//
//                // 构建请求体
//                val jsonObject = JSONObject().apply {
//                    put("session_id", sessionId)
//                }
//
//                // 发送请求
//                connection.outputStream.use { os ->
//                    os.write(jsonObject.toString().toByteArray(Charsets.UTF_8))
//                    os.flush()
//                }
//
//                if (connection.responseCode == HttpURLConnection.HTTP_OK) {
//                    BufferedReader(InputStreamReader(connection.inputStream, "UTF-8")).use { reader ->
//                        val responseText = reader.readText()
//                        val responseJson = JSONObject(responseText)
//                        if (responseJson.has("analysis")) {
//                            response = responseJson.getString("analysis")
//                        } else {
//                            response = "无法获取分析结果"
//                        }
//                    }
//                    return@withContext response
//                } else {
//                    val errorMessage = "服务器响应错误: ${connection.responseCode}"
//                    Log.e(TAG, errorMessage)
//                    return@withContext errorMessage
//                }
//            } catch (e: Exception) {
//                val errorMessage = when (e) {
//                    is java.net.UnknownHostException -> "无法连接到服务器($BASE_URL)，请检查网络连接或服务器地址是否正确"
//                    is java.net.ConnectException -> "连接服务器失败，服务器可能未启动或地址错误"
//                    is java.net.SocketTimeoutException -> "连接超时，请检查网络状况"
//                    is java.io.IOException -> "IO错误: ${e.message}"
//                    else -> "错误: ${e.javaClass.simpleName} - ${e.message}"
//                }
//                Log.e(TAG, "Error tracking condition: $errorMessage")
//                return@withContext errorMessage
//            }
//        }
    }
} 