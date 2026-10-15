use std::fs;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::thread;
use std::time::Duration;

fn get_mime(path: &Path) -> &'static str {
    match path.extension().and_then(|s| s.to_str()).unwrap_or("") {
        "html" => "text/html; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "js" | "mjs" => "application/javascript; charset=utf-8",
        "json" => "application/json",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "svg" => "image/svg+xml",
        "ico" => "image/x-icon",
        "webp" => "image/webp",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "ttf" => "font/ttf",
        _ => "application/octet-stream",
    }
}

fn handle_client(mut stream: TcpStream, dist_dir: &Path) {
    let mut buffer = [0u8; 4096];
    let n = match stream.read(&mut buffer) {
        Ok(n) if n > 0 => n,
        _ => return,
    };
    let request = String::from_utf8_lossy(&buffer[..n]);
    let first_line = request.lines().next().unwrap_or("");
    let mut parts = first_line.split_whitespace();
    let _method = parts.next();
    let url_path = parts.next().unwrap_or("/");

    let clean_path = url_path.split('?').next().unwrap_or("/");
    let sub_path = clean_path.trim_start_matches('/');

    let file_path = if sub_path.is_empty() {
        dist_dir.join("index.html")
    } else {
        dist_dir.join(sub_path)
    };

    let (status, content_type, body) = if file_path.exists() && file_path.is_file() {
        let content = fs::read(&file_path).unwrap_or_default();
        ("200 OK", get_mime(&file_path), content)
    } else {
        // Fallback to index.html for SPA client-side routing
        let index_file = dist_dir.join("index.html");
        if index_file.exists() {
            let content = fs::read(&index_file).unwrap_or_default();
            ("200 OK", "text/html; charset=utf-8", content)
        } else {
            ("404 Not Found", "text/plain", b"CraftChat UI files not found".to_vec())
        }
    };

    let response = format!(
        "HTTP/1.1 {}\r\nContent-Type: {}\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\n",
        status,
        content_type,
        body.len()
    );
    let _ = stream.write_all(response.as_bytes());
    let _ = stream.write_all(&body);
}

fn find_dist_dir() -> PathBuf {
    // 1. Check AppImage runtime APPDIR environment variable
    if let Ok(appdir) = std::env::var("APPDIR") {
        let p = PathBuf::from(appdir).join("usr/share/craft-chat/dist");
        if p.exists() && p.join("index.html").exists() {
            return p;
        }
    }

    // 2. Check relative to current executable
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            let candidates = [
                parent.join("dist"),
                parent.join("../share/craft-chat/dist"),
                parent.join("../../dist"),
                parent.join("../../../dist"),
            ];
            for c in candidates {
                if c.exists() && c.join("index.html").exists() {
                    return c;
                }
            }
        }
    }

    // 3. Check current working directory
    let cwd_candidates = [
        PathBuf::from("dist"),
        PathBuf::from("usr/share/craft-chat/dist"),
    ];
    for c in cwd_candidates {
        if c.exists() && c.join("index.html").exists() {
            return c;
        }
    }

    PathBuf::from("dist")
}

fn launch_browser(url: &str) {
    let browsers = [
        ("google-chrome", vec![format!("--app={}", url), "--class=CraftChat".to_string()]),
        ("google-chrome-stable", vec![format!("--app={}", url), "--class=CraftChat".to_string()]),
        ("brave-browser", vec![format!("--app={}", url), "--class=CraftChat".to_string()]),
        ("chromium", vec![format!("--app={}", url), "--class=CraftChat".to_string()]),
        ("chromium-browser", vec![format!("--app={}", url), "--class=CraftChat".to_string()]),
        ("firefox", vec!["-new-window".to_string(), url.to_string()]),
        ("xdg-open", vec![url.to_string()]),
    ];

    for (bin, args) in browsers {
        if Command::new(bin).args(&args).spawn().is_ok() {
            println!("✔ Launched CraftChat window via {}", bin);
            return;
        }
    }

    eprintln!("⚠️ Note: Could not auto-open browser. Please visit: {}", url);
}

fn main() {
    println!("=====================================================");
    println!("  CraftChat GUI Server & Launcher (Multi-OS Desktop)  ");
    println!("=====================================================");

    let dist_dir = find_dist_dir();
    println!("📂 UI Assets directory: {:?}", dist_dir);

    // Try binding default port 4243, fallback to port 0 if busy
    let target_port = 4243;
    let (listener, port) = match TcpListener::bind(format!("127.0.0.1:{}", target_port)) {
        Ok(l) => (l, target_port),
        Err(_) => {
            // Check if CraftChat is already running on port 4243
            if TcpStream::connect(format!("127.0.0.1:{}", target_port)).is_ok() {
                println!("ℹ CraftChat server is already active on port {}.", target_port);
                let url = format!("http://127.0.0.1:{}", target_port);
                launch_browser(&url);
                return;
            }
            let l = TcpListener::bind("127.0.0.1:0").expect("Failed to bind any local port");
            let p = l.local_addr().unwrap().port();
            (l, p)
        }
    };

    let url = format!("http://127.0.0.1:{}", port);
    println!("🌐 CraftChat UI listening at: {}", url);

    // Start background thread for HTTP static server
    let dist_dir_clone = dist_dir.clone();
    thread::spawn(move || {
        for stream in listener.incoming() {
            if let Ok(stream) = stream {
                let dist = dist_dir_clone.clone();
                thread::spawn(move || {
                    handle_client(stream, &dist);
                });
            }
        }
    });

    // Launch desktop app window in browser
    launch_browser(&url);

    // Keep server alive so AppImage mount and web server do not exit!
    println!("🚀 CraftChat is running! Keep this process active while using the app.");
    loop {
        thread::sleep(Duration::from_secs(3600));
    }
}
