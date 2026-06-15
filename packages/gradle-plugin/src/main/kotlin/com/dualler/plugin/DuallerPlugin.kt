package com.dualler.plugin

import org.gradle.api.Plugin
import org.gradle.api.Project

class DuallerPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        val extension = project.extensions.create("dualler", DuallerExtension::class.java)

        project.tasks.register("compileDualler") { task ->
            task.group = "dualler"
            task.description = "Compile Vue3 SFC to Dualler mini-program package"

            task.doLast {
                val args = buildList {
                    add("npx")
                    add("@dualler/compiler")
                    add("build")
                    add("--appId"); add(extension.appId)
                    add("--entry"); add(extension.entry)
                    add("--pages"); add(extension.pages.joinToString(","))
                    if (extension.components.isNotEmpty()) {
                        add("--components"); add(extension.components.joinToString(","))
                    }
                    add("--outputDir"); add(extension.outputDir.absolutePath)
                    add("--minify"); add(extension.options.minify.toString())
                }

                project.exec { exec ->
                    exec.commandLine(args)
                    exec.workingDir = project.projectDir
                }
            }
        }

        project.tasks.findByName("preBuild")?.dependsOn("compileDualler")
    }
}
