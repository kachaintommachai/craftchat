use std::fs;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;

fn get_mime(path: &Path) -> &'static str {
    match path.extension().and_then(|s| s.to_str()).unwrap_or("") {
        "html" => "text/html; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "js" => "application/javascript; charset=utf-8",
        "json" => "application/json",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "svg" => "image/svg+xml",
        "ico" => "image/x-icon",
        "woff2" => "font/woff2",
        _ => "application/octet-stream",
    }
}

fn handle_client(mut stream: TcpStream, dist_dir: &Path) {
    let mut buffer = [0u8; 2048];
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
            ("404 Not Found", "text/plain", b"File Not Found".to_vec())
        }
    };

    let response = format!(
        "HTTP/1.1 {}\r\nContent-Type: {}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
        status,
        content_type,
        body.len()
    );
    let _ = stream.write_all(response.as_bytes());
    let _ = stream.write_all(&body);
}

fn main() {
    println!("Starting CraftChat Standalone GUI Launcher...");

    // Find dist directory
    let exe_dir = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."));

    let possible_paths = [
        exe_dir.join("dist"),
        exe_dir.join("../share/craft-chat/dist"),
        exe_dir.join("../../dist"),
        PathBuf::from("dist"),
    ];

    let dist_dir = possible_paths
        .into_iter()
        .find(|p| p.exists() && p.join("index.html").exists())
        .unwrap_or_else(|| PathBuf::from("dist"));

    println!("Serving UI from: {:?}", dist_dir);

    // Pick available local port
    let listener = TcpListener::bind("127.0.0.1:0").expect("Failed to bind local port");
    let port = listener.local_addr().unwrap().port();
    let url = format!("http://127.0.0.1:{}", port);
    println!("Web UI listening at: {}", url);

    let dist_dir_clone = dist_dir.clone();
    let running = Arc::new(AtomicBool::new(true));
    let r_clone = running.clone();

    // Start HTTP server thread
    thread::spawn(move || {
        for stream in listener.incoming() {
            if !r_clone.load(Ordering::Relaxed) {
                break;
            }
            if let Ok(stream) = stream {
                let dist = dist_dir_clone.clone();
                thread::spawn(move || {
                    handle_client(stream, &dist);
                });
            }
        }
    });

    // Try launch browser in App mode
    let browsers = [
        ("google-chrome", vec![format!("--app={}", url), "--class=CraftChat".to_string()]),
        ("google-chrome-stable", vec![format!("--app={}", url), "--class=CraftChat".to_string()]),
        ("brave-browser", vec![format!("--app={}", url), "--class=CraftChat".to_string()]),
        ("chromium", vec![format!("--app={}", url), "--class=CraftChat".to_string()]),
        ("chromium-browser", vec![format!("--app={}", url), "--class=CraftChat".to_string()]),
        ("firefox", vec!["-new-window".to_string(), url.clone()]),
        ("xdg-open", vec![url.clone()]),
    ];

    let mut launched = false;
    for (bin, args) in browsers {
        if let Ok(mut child) = Command::new(bin).args(&args).spawn() {
            println!("Launched CraftChat via {}", bin);
            launched = true;
            let _ = child.wait();
            break;
        }
    }

    if !launched {
        eprintln!("Could not launch browser window automatically. Please open {} in your browser.", url);
    }
}
