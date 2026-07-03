#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HELLO_WORLD="$REPO_ROOT/examples/hello-world"
ANDROID_TEST="$REPO_ROOT/examples/android-test-app"
ASSETS_DIR="$ANDROID_TEST/src/main/assets/dist"

echo "=== Dualler Android Test Runner ==="
echo "Repo root: $REPO_ROOT"
echo ""

# Step 1: Build hello-world
echo ">>> Step 1: Building hello-world example..."
cd "$HELLO_WORLD"
npx dualler build
echo ""

# Step 2: Verify build output
echo ">>> Step 2: Verifying build output..."
EXPECTED_FILES=(
  "dist/app.js"
  "dist/app.css"
  "dist/pages/index/index.js"
  "dist/pages/index/index.css"
)
for f in "${EXPECTED_FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "ERROR: Missing expected file: $f"
    exit 1
  fi
done
echo "All expected files present:"
find dist -type f | sort
echo ""

# Step 3: Copy dist to Android assets
echo ">>> Step 3: Copying dist to Android assets..."
mkdir -p "$ASSETS_DIR/pages/index"
cp "$HELLO_WORLD/dist/app.js" "$ASSETS_DIR/"
cp "$HELLO_WORLD/dist/app.css" "$ASSETS_DIR/"
cp "$HELLO_WORLD/dist/pages/index/index.js" "$ASSETS_DIR/pages/index/"
cp "$HELLO_WORLD/dist/pages/index/index.css" "$ASSETS_DIR/pages/index/"
echo "Assets directory contents:"
find "$ASSETS_DIR" -type f | sort
echo ""

# Step 4: Check Android project
echo ">>> Step 4: Checking Android project structure..."
if [ ! -f "$ANDROID_TEST/build.gradle.kts" ]; then
  echo "ERROR: build.gradle.kts not found"
  exit 1
fi
if [ ! -f "$ANDROID_TEST/src/main/java/com/example/duallertest/MainActivity.kt" ]; then
  echo "ERROR: MainActivity.kt not found"
  exit 1
fi
echo "Android project structure OK"
echo ""

# Step 5: Show next steps
echo "=== Done ==="
echo ""
echo "The dist files are copied to:"
echo "  $ASSETS_DIR"
echo ""
echo "To run on a device/emulator:"
echo "  1. Open Android Studio"
echo "  2. Open project: $ANDROID_TEST"
echo "  3. Click Run (Shift+F10)"
echo ""
echo "Or from command line:"
echo "  cd $ANDROID_TEST"
echo "  ./gradlew assembleDebug"
echo "  adb install -r app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "Then check logcat for Dualler output:"
echo "  adb logcat | grep -i dualler"
