{
  "targets": [
    {
      "target_name": "downloader",
      "sources": [ "cpp/downloader.cpp" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
"C:\\Users\\ashis\\OneDrive\\Desktop\\backups\\test V2\\cpp\\vcpkg\\installed\\x64-windows-static\\include"
      ],
      "defines": [
        "CURL_STATICLIB",
        "NAPI_CPP_EXCEPTIONS",
        "_CRT_SECURE_NO_WARNINGS",
        "OPENSSL_API_COMPAT=0x30000000L"
      ],
"libraries": [
        "C:\\Users\\ashis\\OneDrive\\Desktop\\backups\\test V2\\cpp\\vcpkg\\installed\\x64-windows-static\\lib\\libcurl.lib",
        "C:\\Users\\ashis\\OneDrive\\Desktop\\backups\\test V2\\cpp\\vcpkg\\installed\\x64-windows-static\\lib\\libssl.lib",
        "C:\\Users\\ashis\\OneDrive\\Desktop\\backups\\test V2\\cpp\\vcpkg\\installed\\x64-windows-static\\lib\\libcrypto.lib",

        "zlib.lib",
        "ws2_32.lib",
        "wldap32.lib",
        "crypt32.lib",
        "advapi32.lib",
        "user32.lib"
      ],
      "library_dirs": [
        "C:\\Users\\ashis\\OneDrive\\Desktop\\backups\\test V2\\cpp\\vcpkg\\installed\\x64-windows-static\\lib"

      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "msvs_settings": {
        "VCCLCompilerTool": {
          "TargetMachine": 17,
          "ExceptionHandling": 1
        }
      },
      "cflags_cc": [ "-std=c++17" ]
    }
  ]
}
