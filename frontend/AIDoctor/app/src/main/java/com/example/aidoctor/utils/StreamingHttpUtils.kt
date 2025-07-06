package com.example.aidoctor.utils

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import okio.IOException
import org.json.JSONObject
import java.net.URLEncoder

object StreamingHttpUtils {
    private const val BASE_URL = "http://47.110.47.254:8000"
    private val client = OkHttpClient()

    suspend fun streamMessage(
        sessionId: Long,
        message: String,
        onChunkReceived: (String) -> Unit
    ) = withContext(Dispatchers.IO) {
        try {
            val jsonObject = JSONObject().apply {
                put("session_id", sessionId)
                put("msg", message)
            }

            val request = Request.Builder()
                .url("$BASE_URL/get")
                .post(jsonObject.toString().toRequestBody("application/json".toMediaType()))
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) throw IOException("Unexpected code $response")

            val reader = response.body?.charStream() ?: throw IOException("Empty response body")
            var line: String?
            // 使用 bufferedReader 逐行读取响应内容
            reader.buffered().use { bufferedReader ->
                while (bufferedReader.readLine().also { line = it } != null) {
                    if (line!!.startsWith("data: ")) {
                        // 提取 data: 之后的内容，保留原始格式
                        val content = line!!.substringAfter("data: ")
                        if (content.isNotEmpty()) {
                            onChunkReceived(content)
                        }
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("StreamingHttpUtils", "Error during streaming: ${e.message}")
            onChunkReceived("[错误] 网络异常，请检查连接")
        }
    }
}