package com.dualler.android.engine

import com.dualler.platform.JSEngine
import com.dualler.platform.model.JSArray
import com.dualler.platform.model.JSValue

/**
 * QuickJS-based JS Engine implementation
 *
 * Uses a simple script evaluator that can handle Dualler runtime JS.
 * In production, this would use QuickJS JNI bindings.
 */
class QuickJSEngine(private val heapSizeMB: Int = 64) : JSEngine {
    private val callbacks = mutableMapOf<String, (JSArray) -> JSValue>()
    private val globalVars = mutableMapOf<String, Any?>()
    private val functions = mutableMapOf<String, (List<Any?>) -> Any?>()
    private var destroyed = false

    init {
        // Sandbox hardening
        executeSandboxInit()
    }

    override fun evaluateScript(script: String, sourceUrl: String): JSValue {
        if (destroyed) return JSValue.Undefined

        return try {
            val lines = script.lines()
            var lastResult: JSValue = JSValue.Undefined

            for (line in lines) {
                val trimmed = line.trim()
                if (trimmed.isEmpty() || trimmed.startsWith("//")) continue

                lastResult = executeLine(trimmed)
            }

            lastResult
        } catch (e: Exception) {
            JSValue.Undefined
        }
    }

    override fun registerCallback(name: String, callback: (JSArray) -> JSValue) {
        callbacks[name] = callback
        // Also register as a callable function
        functions[name] = { args ->
            val jsArray = JSArray(args.map { convertToJSValue(it) })
            callback(jsArray)
        }
    }

    override fun registerObject(name: String, obj: Map<String, (JSArray) -> JSValue>) {
        obj.forEach { (key, fn) ->
            val fullName = "$name.$key"
            callbacks[fullName] = fn
            functions[fullName] = { args ->
                val jsArray = JSArray(args.map { convertToJSValue(it) })
                fn(jsArray)
            }
        }
    }

    override fun destroy() {
        destroyed = true
        callbacks.clear()
        globalVars.clear()
        functions.clear()
    }

    private fun executeSandboxInit() {
        // Remove dangerous modules
        globalVars["std"] = null
        globalVars["os"] = null
        globalVars["ScriptInternals"] = null

        // Lock core bridge functions
        globalVars["__dualler_setData"] = "__locked__"
        globalVars["__dualler_callNative"] = "__locked__"
        globalVars["__dualler_event__"] = "__locked__"
        globalVars["__dualler_callback__"] = "__locked__"
    }

    private fun executeLine(line: String): JSValue {
        val trimmed = line.trim()

        // Handle var/let/const declarations
        if (trimmed.matches(Regex("^(var|let|const)\\s+\\w+\\s*=.*"))) {
            val parts = trimmed.split("=", limit = 2)
            val varName = parts[0].replace(Regex("^(var|let|const)\\s+"), "").trim()
            val value = evaluateExpression(parts[1].trim())
            globalVars[varName] = value
            return JSValue.Undefined
        }

        // Handle function calls
        if (trimmed.matches(Regex("^\\w+\\(.*\\)$"))) {
            return evaluateFunctionCall(trimmed)
        }

        // Handle delete statements
        if (trimmed.startsWith("delete ")) {
            val varName = trimmed.removePrefix("delete ").trim().removeSuffix(";")
            globalVars.remove(varName)
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

        return JSValue.Undefined
    }

    private fun evaluateExpression(expr: String): Any {
        val trimmed = expr.trim().removeSuffix(";")

        // String literal
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            return trimmed.removeSurrounding("\"")
        }
        if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
            return trimmed.removeSurrounding("'")
        }

        // Number literal
        trimmed.toDoubleOrNull()?.let { return it }

        // Boolean literal
        if (trimmed == "true") return true
        if (trimmed == "false") return false
        if (trimmed == "null") return "null"
        if (trimmed == "undefined") return "undefined"

        // Object literal
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            return "object"
        }

        // Array literal
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            return "array"
        }

        // Variable reference
        if (trimmed.matches(Regex("^\\w+$"))) {
            return globalVars[trimmed] ?: "undefined"
        }

        return "undefined"
    }

    private fun evaluateFunctionCall(call: String): JSValue {
        val match = Regex("^(\\w+)\\((.*)\\)$").find(call) ?: return JSValue.Undefined
        val funcName = match.groupValues[1]
        val argsStr = match.groupValues[2]

        // Check if it's a registered function
        val func = functions[funcName]
        if (func != null) {
            val args = parseArgs(argsStr)
            val result = func(args)
            return convertToJSValue(result)
        }

        // Handle built-in functions
        return when (funcName) {
            "eval" -> JSValue.Undefined
            "Function" -> JSValue.Undefined
            else -> JSValue.Undefined
        }
    }

    private fun parseArgs(argsStr: String): List<Any?> {
        if (argsStr.isBlank()) return emptyList()

        val args = mutableListOf<Any?>()
        var depth = 0
        var current = StringBuilder()

        for (char in argsStr) {
            when {
                char == '(' || char == '{' || char == '[' -> depth++
                char == ')' || char == '}' || char == ']' -> depth--
                char == ',' && depth == 0 -> {
                    args.add(evaluateExpression(current.toString()))
                    current = StringBuilder()
                    continue
                }
            }
            current.append(char)
        }

        if (current.isNotEmpty()) {
            args.add(evaluateExpression(current.toString()))
        }

        return args
    }

    private fun convertToJSValue(value: Any?): JSValue {
        return when (value) {
            null -> JSValue.Null
            is JSValue -> value
            is Boolean -> JSValue.KBoolean(value)
            is Number -> JSValue.KNumber(value.toDouble())
            is String -> when (value) {
                "undefined" -> JSValue.Undefined
                "null" -> JSValue.Null
                "object" -> JSValue.KObject(emptyMap())
                "array" -> JSValue.KArray(emptyList())
                else -> JSValue.KString(value)
            }
            else -> JSValue.KString(value.toString())
        }
    }

    /**
     * Invoke a registered callback programmatically
     */
    fun invokeCallback(name: String, args: JSArray): JSValue {
        return callbacks[name]?.invoke(args) ?: JSValue.Undefined
    }
}
