package com.dualler.android.engine

import com.dualler.platform.JSEngine
import com.dualler.platform.model.JSArray
import com.dualler.platform.model.JSValue

/**
 * Android JS Engine implementation
 *
 * Temporary implementation using simple script evaluation.
 * Will be replaced with QuickJS JNI integration.
 */
class AndroidJSEngine : JSEngine {
    private val callbacks = mutableMapOf<String, (JSArray) -> JSValue>()
    private val variables = mutableMapOf<String, String>()
    private var destroyed = false

    init {
        // Inject sandbox restrictions
        evaluateScript("delete std; delete os; delete ScriptInternals;", "dualler://sandbox")
    }

    override fun evaluateScript(script: String, sourceUrl: String): JSValue {
        if (destroyed) return JSValue.Undefined

        return try {
            executeScript(script)
        } catch (e: Exception) {
            JSValue.Undefined
        }
    }

    override fun registerCallback(name: String, callback: (JSArray) -> JSValue) {
        callbacks[name] = callback
    }

    override fun registerObject(name: String, obj: Map<String, (JSArray) -> JSValue>) {
        obj.forEach { (key, fn) -> callbacks["$name.$key"] = fn }
    }

    override fun destroy() {
        destroyed = true
        callbacks.clear()
        variables.clear()
    }

    private fun executeScript(script: String): JSValue {
        val trimmed = script.trim()

        // Handle var/let/const declarations
        if (trimmed.startsWith("var ") || trimmed.startsWith("let ") || trimmed.startsWith("const ")) {
            val eqIndex = trimmed.indexOf('=')
            if (eqIndex > 0) {
                val varName = trimmed.substring(
                    trimmed.indexOf(' ') + 1,
                    eqIndex
                ).trim()
                val varValue = trimmed.substring(eqIndex + 1).trim().removeSuffix(";")
                variables[varName] = varValue
            }
            return JSValue.Undefined
        }

        // Handle function calls like __dualler_app__.onLaunch(...)
        if (trimmed.startsWith("__dualler_")) {
            return JSValue.Undefined
        }

        // Handle delete statements
        if (trimmed.startsWith("delete ")) {
            return JSValue.KBoolean(true)
        }

        // Handle Object.defineProperty
        if (trimmed.startsWith("Object.defineProperty")) {
            return JSValue.Undefined
        }

        // Handle JSON.stringify
        if (trimmed.startsWith("JSON.stringify")) {
            return JSValue.KString("{}")
        }

        // Handle callback invocations
        if (trimmed.startsWith("__invoke__(")) {
            val nameEnd = trimmed.indexOf(')')
            if (nameEnd > 0) {
                val name = trimmed.substring(11, nameEnd).trim('"', '\'')
                return invokeCallback(name, JSArray(emptyList()))
            }
        }

        return JSValue.Undefined
    }

    /**
     * Invoke a registered callback
     */
    fun invokeCallback(name: String, args: JSArray): JSValue {
        return callbacks[name]?.invoke(args) ?: JSValue.Undefined
    }
}
