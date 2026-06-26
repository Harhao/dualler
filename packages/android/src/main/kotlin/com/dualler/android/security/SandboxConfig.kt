package com.dualler.android.security

/**
 * Security sandbox configuration for mini-program JS execution.
 *
 * The sandbox restricts what mini-program code can do:
 *   - Remove dangerous global objects (std, os, ScriptInternals)
 *   - Lock bridge functions (prevent reassignment)
 *   - Disable eval() and Function constructor
 *   - Domain whitelist for network requests
 *   - API whitelist for native calls
 *   - Component whitelist for template usage
 */
data class SandboxConfig(
    /** Whether to enable the security sandbox (default: true) */
    val enabled: Boolean = true,

    /** Remove dangerous globals: std, os, ScriptInternals */
    val removeDangerousGlobals: Boolean = true,

    /** Lock bridge functions with Object.defineProperty(writable: false) */
    val lockBridgeFunctions: Boolean = true,

    /** Disable eval() and Function constructor */
    val disableEval: Boolean = true,

    /** Domain whitelist for wx.request (empty = allow all) */
    val domainWhitelist: List<String> = emptyList(),

    /** Whether to enforce HTTPS for network requests */
    val enforceHttps: Boolean = true,

    /** API whitelist (empty = allow all registered APIs) */
    val apiWhitelist: Set<String> = emptySet(),

    /** Component whitelist for templates (empty = allow all) */
    val componentWhitelist: Set<String> = emptySet(),

    /** Maximum script execution time in milliseconds (0 = no limit) */
    val maxExecutionTimeMs: Long = 0,

    /** Maximum memory usage in bytes (0 = no limit) */
    val maxMemoryBytes: Long = 0
) {
    companion object {
        /** Default strict sandbox configuration */
        val STRICT = SandboxConfig(
            enabled = true,
            removeDangerousGlobals = true,
            lockBridgeFunctions = true,
            disableEval = true,
            enforceHttps = true
        )

        /** Relaxed sandbox for development */
        val RELAXED = SandboxConfig(
            enabled = true,
            removeDangerousGlobals = true,
            lockBridgeFunctions = false,
            disableEval = false,
            enforceHttps = false
        )

        /** No sandbox (not recommended for production) */
        val DISABLED = SandboxConfig(enabled = false)
    }
}
