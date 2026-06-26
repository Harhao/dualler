package com.dualler.android.security

import com.dualler.platform.JSEngine

/**
 * Initializes the JS engine security sandbox.
 *
 * Injects JavaScript code that:
 *   1. Removes dangerous global objects
 *   2. Locks bridge functions
 *   3. Disables eval() and Function constructor
 *   4. Sets up domain whitelist enforcement
 */
object SandboxInitializer {

    /**
     * Apply sandbox restrictions to a JS engine.
     *
     * This should be called immediately after the engine is created,
     * before any mini-program code is executed.
     */
    fun apply(engine: JSEngine, config: SandboxConfig) {
        if (!config.enabled) return

        val script = buildSandboxScript(config)
        engine.evaluateScript(script, "dualler://sandbox")
    }

    /**
     * Build the JavaScript sandbox initialization script.
     */
    private fun buildSandboxScript(config: SandboxConfig): String {
        val parts = mutableListOf<String>()

        // 1. Remove dangerous globals
        if (config.removeDangerousGlobals) {
            parts.add("""
                // Remove dangerous global objects
                if (typeof std !== 'undefined') { delete globalThis.std; }
                if (typeof os !== 'undefined') { delete globalThis.os; }
                if (typeof ScriptInternals !== 'undefined') { delete globalThis.ScriptInternals; }
            """.trimIndent())
        }

        // 2. Lock bridge functions
        if (config.lockBridgeFunctions) {
            parts.add("""
                // Lock bridge functions to prevent reassignment
                var __bridgeFunctions__ = [
                    '__dualler_setData',
                    '__dualler_callNative',
                    '__dualler_event__',
                    '__dualler_callback__',
                    '__dualler_call',
                    '__dualler_ref',
                    '__dualler_reactive',
                    '__dualler_computed',
                    '__dualler_watch'
                ];
                __bridgeFunctions__.forEach(function(name) {
                    if (typeof globalThis[name] !== 'undefined') {
                        Object.defineProperty(globalThis, name, {
                            value: globalThis[name],
                            writable: false,
                            configurable: false
                        });
                    }
                });
            """.trimIndent())
        }

        // 3. Disable eval and Function constructor
        if (config.disableEval) {
            parts.add("""
                // Disable eval() and Function constructor
                globalThis.eval = function() {
                    throw new Error('eval() is disabled in sandbox');
                };
                var __OrigFunction__ = globalThis.Function;
                globalThis.Function = function() {
                    throw new Error('Function constructor is disabled in sandbox');
                };
                // Keep Function.prototype for instanceof checks
                globalThis.Function.prototype = __OrigFunction__.prototype;
            """.trimIndent())
        }

        // 4. Domain whitelist enforcement
        if (config.enforceHttps || config.domainWhitelist.isNotEmpty()) {
            parts.add(buildDomainWhitelistScript(config))
        }

        // 5. API whitelist enforcement
        if (config.apiWhitelist.isNotEmpty()) {
            parts.add(buildApiWhitelistScript(config))
        }

        return parts.joinToString("\n")
    }

    /**
     * Build domain whitelist enforcement script.
     */
    private fun buildDomainWhitelistScript(config: SandboxConfig): String {
        val domains = config.domainWhitelist.joinToString(",") { "\"${escapeJs(it)}\"" }
        val enforceHttps = config.enforceHttps

        return """
            // Domain whitelist enforcement
            (function() {
                var __allowedDomains__ = [$domains];
                var __enforceHttps__ = $enforceHttps;

                // Override wx.request to enforce domain whitelist
                var __origRequest__ = typeof wx !== 'undefined' && wx.request;
                if (__origRequest__ && __allowedDomains__.length > 0) {
                    wx.request = function(opts) {
                        var url = opts.url || '';
                        // Check HTTPS enforcement
                        if (__enforceHttps__ && !url.startsWith('https://') && !url.startsWith('http://localhost')) {
                            if (opts.fail) opts.fail({ errMsg: 'HTTPS required' });
                            return;
                        }
                        // Check domain whitelist
                        var allowed = __allowedDomains__.some(function(domain) {
                            if (domain.startsWith('*.')) {
                                var suffix = domain.slice(1);
                                return url.includes(suffix);
                            }
                            return url.includes(domain);
                        });
                        if (!allowed) {
                            if (opts.fail) opts.fail({ errMsg: 'Domain not in whitelist: ' + url });
                            return;
                        }
                        return __origRequest__(opts);
                    };
                }
            })();
        """.trimIndent()
    }

    /**
     * Build API whitelist enforcement script.
     */
    private fun buildApiWhitelistScript(config: SandboxConfig): String {
        val apis = config.apiWhitelist.joinToString(",") { "\"${escapeJs(it)}\"" }

        return """
            // API whitelist enforcement
            (function() {
                var __allowedAPIs__ = new Set([$apis]);

                // Override __dualler_call to check API whitelist
                var __origCall__ = globalThis.__dualler_call;
                if (__origCall__) {
                    globalThis.__dualler_call = function(api, params, callbackId) {
                        if (!__allowedAPIs__.has(api)) {
                            console.warn('API not allowed: ' + api);
                            return;
                        }
                        return __origCall__(api, params, callbackId);
                    };
                }
            })();
        """.trimIndent()
    }

    private fun escapeJs(str: String): String {
        return str
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
    }
}
