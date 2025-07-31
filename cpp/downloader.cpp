#ifndef CURL_STATICLIB 
#define CURL_STATICLIB
#endif

#ifndef _CRT_SECURE_NO_WARNINGS
#define _CRT_SECURE_NO_WARNINGS
#endif

#define OPENSSL_API_COMPAT 0x30000000L
#include <iomanip>
#include <iostream>
#include <fstream>
#include <sstream>
#include <filesystem>
#include <string>
#include <map>
#include <vector>
#include <thread>
#include <curl/curl.h>
#include <openssl/sha.h>
#include "json.hpp"
#include <napi.h>

using json = nlohmann::json;
namespace fs = std::filesystem;

// globals for progress
static curl_off_t g_total_size        = 0;
static curl_off_t g_downloaded_so_far = 0;
static curl_off_t g_last_dlnow        = 0;
static Napi::ThreadSafeFunction tsfn;

const std::string MANIFEST_URL    = "https://downloads.sweetstakes.org/manifest.json";
const std::string CHUNK_BASE_URL  = "https://downloads.sweetstakes.org/Chunks/";

// const fs::path    CACHE_FOLDER    = "Cache";
// const fs::path    LOCAL_MANIFEST  = CACHE_FOLDER / "last_manifest.json";
// const fs::path    CHUNK_FOLDER    = "Chunks";
// const fs::path    GAME_FOLDER     = "Game";

fs::path CHUNK_FOLDER;
fs::path GAME_FOLDER;
fs::path CACHE_FOLDER;
fs::path LOCAL_MANIFEST;
void SetGameFolder(const fs::path& path) {
    GAME_FOLDER     = path;
    CACHE_FOLDER    = GAME_FOLDER / "Cache";
    LOCAL_MANIFEST  = CACHE_FOLDER / "last_manifest.json";
    CHUNK_FOLDER    = GAME_FOLDER / "Chunks";
}


static std::string sanitizeFilename(const std::string& name) {
    if (name.size() >= 2 && name.front() == '"' && name.back() == '"')
        return name.substr(1, name.size() - 2);
    return name;
}

size_t WriteToString(void* ptr, size_t size, size_t nmemb, std::string* data) {
    data->append(reinterpret_cast<char*>(ptr), size * nmemb);
    return size * nmemb;
}

size_t WriteToFile(void* ptr, size_t size, size_t nmemb, void* userdata) {
    auto* stream = static_cast<std::ofstream*>(userdata);
    stream->write(static_cast<char*>(ptr), size * nmemb);
    return size * nmemb;
}

static int ProgressCallback(void* clientp,
                            curl_off_t dltotal,
                            curl_off_t dlnow,
                            curl_off_t ultotal,
                            curl_off_t ulnow)
{
    if (dltotal > 0) {
        curl_off_t delta = dlnow - g_last_dlnow;
        g_last_dlnow = dlnow;
        g_downloaded_so_far += delta;

        CURL* curl = static_cast<CURL*>(clientp);
        double speed = 0.0;
        curl_easy_getinfo(curl, CURLINFO_SPEED_DOWNLOAD, &speed);
        
        struct P { curl_off_t d, t; double s; } p{ g_downloaded_so_far, g_total_size, speed };
tsfn.BlockingCall([p](Napi::Env env, Napi::Function cb) {
    // Create the downloading object
    auto downloading = Napi::Object::New(env);
    downloading.Set("downloaded", Napi::Number::New(env, static_cast<double>(p.d)));
    downloading.Set("total",      Napi::Number::New(env, static_cast<double>(p.t)));
    downloading.Set("speed",      Napi::Number::New(env, p.s));

    // Create the full payload with status + downloading
    auto payload = Napi::Object::New(env);
    payload.Set("status", "downloading");
    payload.Set("downloading", downloading);

    // Call the JS callback
    cb.Call({ payload });
});

    }
    return 0;
}

bool DownloadFile(const std::string& url, const fs::path& outputPath) {
    g_last_dlnow = 0;
    CURL* curl = curl_easy_init();
    if (!curl) return false;

    std::ofstream outFile(outputPath, std::ios::binary);
    if (!outFile) { curl_easy_cleanup(curl); return false; }

    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    curl_easy_setopt(curl, CURLOPT_FAILONERROR, 1L);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteToFile);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &outFile);
    curl_easy_setopt(curl, CURLOPT_NOPROGRESS, 0L);
    curl_easy_setopt(curl, CURLOPT_XFERINFOFUNCTION, ProgressCallback);
    curl_easy_setopt(curl, CURLOPT_XFERINFODATA, curl);

    CURLcode res = curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    outFile.close();

    if (res != CURLE_OK) {
        fs::remove(outputPath);
        return false;
    }
    return true;
}

std::string GetSHA256(const fs::path& path) {
    std::ifstream file(path, std::ios::binary);
    if (!file) return "";

    SHA256_CTX ctx;
    SHA256_Init(&ctx);

    char buf[8192];
    while (file) {
        file.read(buf, sizeof(buf));
        std::streamsize n = file.gcount();
        if (n > 0)
            SHA256_Update(&ctx, buf, n);
    }

    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256_Final(hash, &ctx);

    std::ostringstream ss;
    for (auto b : hash)
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)b;
    return ss.str();
}

json FetchRemoteManifest() {
    std::string str;
    CURL* curl = curl_easy_init();
    if (!curl) throw std::runtime_error("curl init failed");

    curl_easy_setopt(curl, CURLOPT_URL, MANIFEST_URL.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteToString);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &str);
    CURLcode r = curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    if (r != CURLE_OK) throw std::runtime_error("Manifest fetch failed");

    return json::parse(str);
}

json LoadLocalManifest() {
    if (!fs::exists(LOCAL_MANIFEST)) 
        return json::object();      

    std::ifstream in(LOCAL_MANIFEST);
    if (!in) 
        return json::object();

    try {
        auto parsed = json::parse(in);
        
        if (!parsed.is_object())  
            return json::object();
        return parsed;
    } catch (const json::parse_error&) {
        
        fs::remove(LOCAL_MANIFEST);
        return json::object();
    }
}

bool ValidateGameFiles(const json& m) {
    for (auto& c : m["chunks"]) {
        auto f = sanitizeFilename(c["file"].get<std::string>());
        fs::path p = CHUNK_FOLDER / f;
        if (!fs::exists(p) || GetSHA256(p) != c["hash"].get<std::string>())
            return false;
    }
    return true;
}

void DownloadMissingChunks(const json& m) {
    fs::create_directories(CHUNK_FOLDER);
    CURL* esc = curl_easy_init();
std::cout << "CHUNK_FOLDER: " << CHUNK_FOLDER << std::endl;
    for (auto& c : m["chunks"]) {
        std::string file = sanitizeFilename(c["file"].get<std::string>());
        fs::path chunkPath = CHUNK_FOLDER / file;

        // Check if file already exists and if the SHA256 matches
        if (fs::exists(chunkPath) && GetSHA256(chunkPath) == c["hash"].get<std::string>()) {
            std::cout << "Skipping " << file << " (already downloaded and valid)" << std::endl;
            continue;
        }

        char* enc = curl_easy_escape(esc, file.c_str(), (int)file.size());
        std::string url = CHUNK_BASE_URL + (enc ? enc : file);
        if (enc) curl_free(enc);

        bool ok = DownloadFile(url, chunkPath);
        if (!ok) {
            curl_easy_cleanup(esc);
            throw std::runtime_error("Failed to download chunk: " + url);
        }
    }

    curl_easy_cleanup(esc);
}



void ReassembleFiles(const json& m) {
    fs::create_directories(GAME_FOLDER);
    std::map<std::string,std::vector<json>> groups;
    std::cout << "GAME_FOLDER: " << GAME_FOLDER << std::endl;

    for (auto& c : m["chunks"]) {
        groups[c["original"].get<std::string>()].push_back(c);
    }
    for (auto& [orig,chunks] : groups) {
        fs::path out = GAME_FOLDER / orig;
        fs::create_directories(out.parent_path());
        std::ofstream o(out, std::ios::binary);
        for (auto& c : chunks) {
            std::ifstream in(CHUNK_FOLDER / sanitizeFilename(c["file"].get<std::string>()), std::ios::binary);
            o << in.rdbuf();
        }
    }
}

void StartDownload() {
    try {
        auto remote = FetchRemoteManifest();
        auto local  = LoadLocalManifest();

        std::string remoteV = remote.value("version","0.0.0");
        std::string localV  = local.value("version","0.0.0");

        if (remoteV == localV && ValidateGameFiles(local)) {
            tsfn.BlockingCall([](Napi::Env env, Napi::Function cb){
                auto o = Napi::Object::New(env);
                o.Set("status", "play");
                cb.Call({ o });
            });
            return;
        }

        tsfn.BlockingCall([remoteV,localV](Napi::Env env, Napi::Function cb){
            auto o = Napi::Object::New(env);
            o.Set("status",        "update-required");
            o.Set("remoteVersion", remoteV);
            o.Set("localVersion",  localV);
            cb.Call({ o });
        });

        fs::create_directories(CACHE_FOLDER);
        g_total_size = 0;
        g_downloaded_so_far = 0;
        for (auto& c : remote["chunks"])
            g_total_size += c["size"].get<long long>();

        DownloadMissingChunks(remote);

        ReassembleFiles(remote);

        {
            fs::path tmp = CACHE_FOLDER / "last_manifest.tmp";
            std::ofstream out(tmp, std::ios::trunc);
            out << remote.dump(2);
            out.close();
            fs::rename(tmp, LOCAL_MANIFEST);
        }

        tsfn.BlockingCall([](Napi::Env env, Napi::Function cb){
            auto o = Napi::Object::New(env);
            o.Set("status", "play");
            cb.Call({ o });
        });
    }
    catch (const std::exception& e) {
        std::cerr << "Download error: " << e.what() << std::endl;
        tsfn.BlockingCall([msg=std::string(e.what())](Napi::Env env, Napi::Function cb){
            auto o = Napi::Object::New(env);
            o.Set("status",  "error");
            o.Set("message", msg);
            cb.Call({ o });
        });
    }
}

Napi::Value StartUpdate(const Napi::CallbackInfo& info) {
    auto env = info.Env();

    if (!info[0].IsFunction() || !info[1].IsString()) {
        Napi::TypeError::New(env, "Expected (callback, folderPath)").ThrowAsJavaScriptException();
        return env.Null();
    }

    auto cb = info[0].As<Napi::Function>();
    std::string folderStr = info[1].As<Napi::String>().Utf8Value();
std::cout << "Folder: " << folderStr << std::endl;
    SetGameFolder(fs::u8path(folderStr));  

    tsfn = Napi::ThreadSafeFunction::New(env, cb, "TSFN", 0, 1);
    std::thread([]() {
        StartDownload();
        tsfn.Release();
    }).detach();

    return Napi::String::New(env, "Started async");
}


// Napi::Value CheckStatus(const Napi::CallbackInfo& info) {
//     Napi::Env env = info.Env();
//     if (!info[0].IsString()) {
//         Napi::TypeError::New(env, "Expected folderPath string").ThrowAsJavaScriptException();
//         return env.Null();
//     }

//     std::string folderStr = info[0].As<Napi::String>().Utf8Value();
//     SetGameFolder(fs::u8path(folderStr));

//     try {
//         auto remote = FetchRemoteManifest();    
//         auto local  = LoadLocalManifest();

//         std::string remoteV = remote.value("version","0.0.0");
//         std::string localV  = local.value("version","0.0.0");
//         bool valid = (remoteV == localV) && ValidateGameFiles(local);

//         Napi::Object out = Napi::Object::New(env);
//         out.Set("localVersion",  localV);
//         out.Set("remoteVersion", remoteV);
//         out.Set("status",        valid ? "play" : "update-required");
//         return out;
//     } catch (const std::exception &e) {
//         Napi::Object out = Napi::Object::New(env);
//         out.Set("status", "error");
//         out.Set("error",  std::string(e.what()));
//         return out;
//     }
// }

Napi::Value CheckStatus(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (!info[0].IsString()) {
        Napi::TypeError::New(env, "Expected folderPath string").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string folderStr = info[0].As<Napi::String>().Utf8Value();
    SetGameFolder(fs::u8path(folderStr));

    try {
        auto remote = FetchRemoteManifest();    
        auto local  = LoadLocalManifest();

        std::string remoteV = remote.value("version", "0.0.0");
        std::string localV  = local.value("version", "0.0.0");

        bool valid = (remoteV == localV) && ValidateGameFiles(local);

        Napi::Object out = Napi::Object::New(env);

        // Check if local manifest exists, if not set status to "download"
        if (!fs::exists(LOCAL_MANIFEST)) {
            out.Set("status", "download");
        } else if (!valid) {
            out.Set("status", "update-required");
        } else {
            out.Set("status", "play");
        }

        out.Set("localVersion", localV);
        out.Set("remoteVersion", remoteV);

        return out;
    } catch (const std::exception& e) {
        Napi::Object out = Napi::Object::New(env);
        out.Set("status", "error");
        out.Set("error", std::string(e.what()));
        return out;
    }
}


Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("startUpdate",   Napi::Function::New(env, StartUpdate));
    exports.Set("checkStatus",   Napi::Function::New(env, CheckStatus)); 
    return exports;
}


NODE_API_MODULE(downloader, Init)