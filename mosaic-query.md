# Querying the Existing Mosaic Configuration

## Why This Matters

When replacing Bridge, you lose the Mosaic topology it configured. To make the Relay Electron player self-sufficient, you need to capture the exact Mosaic configuration from the existing machine *while Bridge is still installed*, then re-assert it on launch via NVAPI.

This is a one-time reconnaissance step per briefing center location. The output feeds directly into that location's `config.json`.

---

## What You're Capturing

- Which physical display IDs are grouped in the Mosaic topology
- The combined canvas resolution (e.g. 8440×1440)
- The grid arrangement (rows × columns)
- Refresh rate and bit depth
- Bezel correction values (overlap pixels between panels)

---

## Step 1 — Prerequisites (on the Windows machine with Bridge installed)

1. NVIDIA GPU drivers up to date (530+ recommended)
2. Node.js 20 installed: https://nodejs.org
3. Git installed: https://git-scm.com
4. Register as NVIDIA developer (free): https://developer.nvidia.com/developer-program
5. Download NVAPI SDK — extract `nvapi.h` and `nvapi64.lib` to a known folder
6. Install Visual Studio Build Tools (for node-gyp):
   - Download from https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Select "Desktop development with C++" workload
7. Install node-gyp globally:
   ```
   npm install -g node-gyp
   ```

---

## Step 2 — Create the Query Tool

Create a new folder anywhere on the machine, e.g. `C:\relay-mosaic-query\`.

### `package.json`
```json
{
  "name": "relay-mosaic-query",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "build": "node-gyp configure && node-gyp build",
    "query": "node index.js"
  },
  "dependencies": {
    "node-addon-api": "^7.0.0"
  }
}
```

### `binding.gyp`
```json
{
  "targets": [
    {
      "target_name": "nvapi_query",
      "sources": ["nvapi_query.cc"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "<PATH_TO_NVAPI_SDK>"
      ],
      "libraries": [
        "<PATH_TO_NVAPI_SDK>/nvapi64.lib"
      ],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"]
    }
  ]
}
```

Replace `<PATH_TO_NVAPI_SDK>` with the actual path where you extracted the NVAPI SDK files.

### `nvapi_query.cc`
```cpp
#include <napi.h>
#include "nvapi.h"
#include <string>

// Query current Mosaic topology and return as a JS object
Napi::Value QueryMosaic(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  // Initialize NVAPI
  NvAPI_Status status = NvAPI_Initialize();
  if (status != NVAPI_OK) {
    Napi::Error::New(env, "NvAPI_Initialize failed: " + std::to_string(status)).ThrowAsJavaScriptException();
    return env.Null();
  }

  // Get current Mosaic topology
  NV_MOSAIC_TOPO_BRIEF topoBrief = {0};
  topoBrief.version = NV_MOSAIC_TOPO_BRIEF_VER;

  NV_MOSAIC_DISPLAY_SETTING displaySetting = {0};
  displaySetting.version = NV_MOSAIC_DISPLAY_SETTING_VER;

  NvS32 overlapX = 0, overlapY = 0;

  status = NvAPI_Mosaic_GetCurrentTopo(&topoBrief, &displaySetting, &overlapX, &overlapY);
  if (status != NVAPI_OK) {
    Napi::Error::New(env, "NvAPI_Mosaic_GetCurrentTopo failed: " + std::to_string(status)).ThrowAsJavaScriptException();
    return env.Null();
  }

  // Get topology details
  NV_MOSAIC_TOPO_DETAILS topoDetails = {0};
  topoDetails.version = NV_MOSAIC_TOPO_DETAILS_VER;

  status = NvAPI_Mosaic_GetTopoGroup(&topoBrief, &topoDetails);
  if (status != NVAPI_OK) {
    Napi::Error::New(env, "NvAPI_Mosaic_GetTopoGroup failed: " + std::to_string(status)).ThrowAsJavaScriptException();
    return env.Null();
  }

  // Enumerate all connected display IDs
  NvU32 displayIds[NVAPI_MAX_DISPLAYS] = {0};
  NvU32 displayCount = NVAPI_MAX_DISPLAYS;
  NvAPI_GetConnectedDisplayIds(0, displayIds, &displayCount, 0);

  // Build result object
  Napi::Object result = Napi::Object::New(env);
  result.Set("enabled", Napi::Boolean::New(env, topoBrief.enabled));
  result.Set("isPossible", Napi::Boolean::New(env, topoBrief.isPossible));

  // Display settings
  Napi::Object settings = Napi::Object::New(env);
  settings.Set("width", Napi::Number::New(env, displaySetting.width));
  settings.Set("height", Napi::Number::New(env, displaySetting.height));
  settings.Set("freq", Napi::Number::New(env, displaySetting.freq));
  settings.Set("bpp", Napi::Number::New(env, displaySetting.bpp));
  result.Set("displaySettings", settings);

  // Overlap (bezel correction)
  Napi::Object overlap = Napi::Object::New(env);
  overlap.Set("x", Napi::Number::New(env, overlapX));
  overlap.Set("y", Napi::Number::New(env, overlapY));
  result.Set("overlap", overlap);

  // Display grid
  Napi::Object grid = Napi::Object::New(env);
  grid.Set("rows", Napi::Number::New(env, topoDetails.rows));
  grid.Set("cols", Napi::Number::New(env, topoDetails.cols));
  result.Set("grid", grid);

  // Individual display entries
  Napi::Array displays = Napi::Array::New(env);
  NvU32 idx = 0;
  for (NvU32 r = 0; r < topoDetails.rows; r++) {
    for (NvU32 c = 0; c < topoDetails.cols; c++) {
      Napi::Object disp = Napi::Object::New(env);
      disp.Set("row", Napi::Number::New(env, r));
      disp.Set("col", Napi::Number::New(env, c));
      disp.Set("displayId", Napi::Number::New(env, topoDetails.displays[r][c].displayId));
      disp.Set("overlapX", Napi::Number::New(env, topoDetails.displays[r][c].overlapX));
      disp.Set("overlapY", Napi::Number::New(env, topoDetails.displays[r][c].overlapY));
      displays.Set(idx++, disp);
    }
  }
  result.Set("displays", displays);

  NvAPI_Unload();
  return result;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("queryMosaic", Napi::Function::New(env, QueryMosaic));
  return exports;
}

NODE_API_MODULE(nvapi_query, Init)
```

### `index.js`
```javascript
const path = require('path');
const fs = require('fs');

let nvapi;
try {
  nvapi = require('./build/Release/nvapi_query.node');
} catch (e) {
  console.error('Failed to load native addon. Did you run npm run build?');
  console.error(e.message);
  process.exit(1);
}

try {
  const result = nvapi.queryMosaic();

  console.log('\n=== MOSAIC TOPOLOGY QUERY RESULT ===\n');
  console.log(JSON.stringify(result, null, 2));

  // Write to config file
  const output = {
    _note: "Generated by relay-mosaic-query. Use these values in relay-player/config.json",
    mosaicEnabled: result.enabled,
    mosaicTopology: {
      rows: result.grid.rows,
      cols: result.grid.cols,
      displayWidth: result.displaySettings.width / result.grid.cols,
      displayHeight: result.displaySettings.height / result.grid.rows,
      totalWidth: result.displaySettings.width,
      totalHeight: result.displaySettings.height,
      freq: result.displaySettings.freq,
      bpp: result.displaySettings.bpp,
      overlapX: result.overlap.x,
      overlapY: result.overlap.y,
    },
    displays: result.displays,
  };

  const outPath = path.join(__dirname, 'mosaic-config-output.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nConfig written to: ${outPath}`);
  console.log('Copy mosaicTopology and displays into relay-player/config.json for this location.\n');

} catch (e) {
  console.error('Query failed:', e.message);
  process.exit(1);
}
```

---

## Step 3 — Build and Run

In `C:\relay-mosaic-query\`:

```bash
npm install
npm run build
npm run query
```

If the build succeeds and Mosaic is active, you'll see output like:

```json
{
  "mosaicEnabled": true,
  "mosaicTopology": {
    "rows": 1,
    "cols": 4,
    "displayWidth": 2110,
    "displayHeight": 1440,
    "totalWidth": 8440,
    "totalHeight": 1440,
    "freq": 60,
    "bpp": 32,
    "overlapX": 0,
    "overlapY": 0
  },
  "displays": [
    { "row": 0, "col": 0, "displayId": 2197815296, "overlapX": 0, "overlapY": 0 },
    { "row": 0, "col": 1, "displayId": 2197815297, "overlapX": 0, "overlapY": 0 },
    { "row": 0, "col": 2, "displayId": 2197815298, "overlapX": 0, "overlapY": 0 },
    { "row": 0, "col": 3, "displayId": 2197815299, "overlapX": 0, "overlapY": 0 }
  ]
}
```

This is also written to `mosaic-config-output.json` automatically.

---

## Step 4 — Transfer the Output

Copy `mosaic-config-output.json` to your Mac (USB, email, AirDrop, git — any method).

The `mosaicTopology` block goes into `relay-player/config.json` under the matching `locationId`. The `displays` array tells you the exact `displayId` values needed to re-assert the topology via NVAPI when the Relay player launches.

---

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `NvAPI_Initialize failed: -196` | No NVIDIA GPU detected | Run on the correct machine |
| `NvAPI_Mosaic_GetCurrentTopo failed: -168` | Mosaic not currently enabled | Mosaic may need to be active; check NVIDIA Control Panel |
| `Cannot find module './build/Release/nvapi_query.node'` | Build not run yet | Run `npm run build` first |
| `MSBuild not found` | Visual Studio Build Tools not installed | Install with "Desktop development with C++" workload |
| `nvapi.h: No such file or directory` | SDK path wrong in `binding.gyp` | Update `<PATH_TO_NVAPI_SDK>` to correct path |

---

## Notes

- Run this **before** uninstalling Bridge — while the existing Mosaic config is live and known-good
- The `displayId` values are hardware-specific and will differ per machine — this is why each location needs its own `config.json`
- The NVAPI SDK files (`nvapi.h`, `nvapi64.lib`) should **not** be committed to git — NVIDIA's license prohibits redistribution. Add them to `.gitignore`.
- This tool is read-only — it queries but does not modify the Mosaic configuration
