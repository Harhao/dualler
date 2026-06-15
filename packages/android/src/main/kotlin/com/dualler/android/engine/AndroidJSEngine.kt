package com.dualler.android.engine

import com.dualler.platform.JSEngine
import com.dualler.platform.model.JSArray
import com.dualler.platform.model.JSValue

/**
 * Android JS Engine - delegates to QuickJSEngine
 */
class AndroidJSEngine : JSEngine by QuickJSEngine()
