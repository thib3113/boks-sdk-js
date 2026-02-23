# Retrieving Credentials

To interact with a Boks device using this SDK, you need specific credentials. While basic operations (opening the door) only require a **Master Code (PIN)**, administrative operations (managing codes, changing settings) require the **Configuration Key** (ConfigKey) or the **Master Key**.

## Key Concepts

- **ConfigKey**: An 8-character hex string (e.g., `A1B2C3D4`) used to authenticate sensitive BLE commands.
- **Master Key**: A 32-byte (64 hex chars) root key. The ConfigKey is derived from its last 4 bytes. Providing the Master Key to the SDK allows for **offline PIN generation**.

---

## Method 1: Cloud API (Recommended)

The easiest way to retrieve your keys is to query the official Boks Cloud API. Since your Boks account has been synchronized with their servers during the initial setup, the keys are stored there.

### Prerequisite: Migrated Account
Note that Boks requires accounts to be "migrated" to their new system. If your account is not migrated or is blocked in the official app, the API may return empty keys.

### Using a retrieval script
You can use a simple script to fetch your keys. The recommended tool is the [get_config_key.py](https://github.com/thib3113/ha-boks/blob/main/scripts/get_config_key.py) script from the Home Assistant integration. It will:
1. Log into your Boks account via Google Identity.
2. List all associated devices.
3. Display their respective **ConfigKey** and **MAC address**.

---

## Method 2: Manual Extraction (Android)

If you cannot use the Cloud API, you can extract the keys from the local database of the Android application.

### 1. Locate the Database
The app stores its data in an IndexedDB database located at:
`/data/user/0/com.boks.app/app_webview/Default/IndexedDB/`

*Note: Accessing this path requires a **rooted device** or using manufacturer-specific backup tools that bypass the `allowBackup=false` restriction.*

### 2. Extract the Key
Since the data is often compressed by LevelDB, use a tool like **[dfindexeddb](https://github.com/google/dfindexeddb)** to parse the files:

```bash
pip install dfindexeddb
dfindexeddb db -s /path/to/IndexedDB/folder/ --format chrome --use_manifest
```

Search for `"configurationKey"` or `"masterKey"` in the resulting JSON output.

---

## Method 3: Manual Extraction (iOS)

On iOS, you can extract the keys from an **unencrypted** local backup of your iPhone.

1. Create an unencrypted backup using **iMazing** or iTunes.
2. Use a backup explorer (like iBackupBot) to navigate to:
   `User App Files` > `com.boks.app` > `Library` > `WebKit` > `WebsiteData` > `Default` > `IndexedDB`.
3. Locate the `IndexedDB.sqlite3` file and export it.
4. Use **dfindexeddb** to parse it:
   ```bash
   dfindexeddb db -s IndexedDB.sqlite3 --format safari
   ```

---

## Why go through this effort?

Once you have retrieved your **Master Key** or **ConfigKey**, you gain **total independence** from the Boks infrastructure. You can control your hardware directly via Bluetooth, generate your own delivery codes, and ensure your parcel box remains functional even if the official cloud services are unavailable.
