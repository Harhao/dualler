package com.dualler.core.error

actual fun currentTimeMillis(): Long = kotlin.js.Date().getTime().toLong()
