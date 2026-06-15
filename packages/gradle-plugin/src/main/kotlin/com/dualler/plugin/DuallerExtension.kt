package com.dualler.plugin

import java.io.File

open class DuallerExtension {
    var appId: String = ""
    var entry: String = ""
    var pages: List<String> = emptyList()
    var components: List<String> = emptyList()
    var outputDir: File = File("build/dualler/dist")
    val options = CompileOptions()

    fun options(block: CompileOptions.() -> Unit) = options.apply(block)
}

open class CompileOptions {
    var minify: Boolean = true
    var sourceMap: Boolean = false
}
