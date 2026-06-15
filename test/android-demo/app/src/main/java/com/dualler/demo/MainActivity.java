package com.dualler.demo;

import android.content.Intent;
import android.os.Bundle;
import android.os.Environment;
import android.widget.Button;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import java.io.File;

/**
 * Android 演示首页
 *
 * 点击按钮启动 Dualler 小程序
 */
public class MainActivity extends AppCompatActivity {

    private static final String APP_ID = "com.example.dualler-demo";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // 启动小程序按钮
        Button btnLaunch = findViewById(R.id.btn_launch);
        btnLaunch.setOnClickListener(v -> launchMiniProgram());

        // 打开 Web 预览按钮
        Button btnWeb = findViewById(R.id.btn_web);
        btnWeb.setOnClickListener(v -> openWebPreview());
    }

    /**
     * 启动小程序
     */
    private void launchMiniProgram() {
        // 检查小程序包是否存在
        File packageDir = new File(Environment.getExternalStorageDirectory(),
                "dualler/packages/" + APP_ID);

        if (!packageDir.exists()) {
            Toast.makeText(this, "小程序包不存在，请先编译 example", Toast.LENGTH_LONG).show();
            return;
        }

        // 启动 DuallerActivity
        Intent intent = new Intent(this, DuallerActivity.class);
        intent.putExtra("appId", APP_ID);
        startActivity(intent);
    }

    /**
     * 打开 Web 预览
     */
    private void openWebPreview() {
        Toast.makeText(this, "请在浏览器中打开 test/web-preview/index.html", Toast.LENGTH_LONG).show();
    }
}
