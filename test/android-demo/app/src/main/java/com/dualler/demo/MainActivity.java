package com.dualler.demo;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Environment;
import android.widget.Button;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.io.File;

/**
 * Dualler Demo 主页面
 *
 * 点击按钮启动小程序
 */
public class MainActivity extends AppCompatActivity {

    private static final int REQUEST_PERMISSION = 100;
    private static final String APP_ID = "com.example.dualler-demo";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // 启动小程序按钮
        Button btnLaunch = findViewById(R.id.btn_launch);
        btnLaunch.setOnClickListener(v -> {
            if (checkPermissions()) {
                launchMiniProgram();
            }
        });
    }

    /**
     * 检查权限
     */
    private boolean checkPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{
                            Manifest.permission.READ_EXTERNAL_STORAGE,
                            Manifest.permission.WRITE_EXTERNAL_STORAGE
                    },
                    REQUEST_PERMISSION);
            return false;
        }
        return true;
    }

    /**
     * 启动小程序
     */
    private void launchMiniProgram() {
        // 检查小程序包是否存在
        File packageDir = new File(Environment.getExternalStorageDirectory(),
                "dualler/packages/" + APP_ID);

        if (!packageDir.exists()) {
            Toast.makeText(this, "小程序包不存在\n路径: " + packageDir.getAbsolutePath(), Toast.LENGTH_LONG).show();
            return;
        }

        // 启动 DuallerActivity
        Intent intent = new Intent(this, DuallerActivity.class);
        intent.putExtra("appId", APP_ID);
        startActivity(intent);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_PERMISSION) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                launchMiniProgram();
            } else {
                Toast.makeText(this, "需要存储权限才能运行小程序", Toast.LENGTH_SHORT).show();
            }
        }
    }
}
