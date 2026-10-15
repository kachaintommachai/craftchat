use std::borrow::Cow;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::Path;
use std::process::Command;
use std::thread;
use std::time::Duration;
use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "../../dist"]
struct Asset;

fn get_mime(path_str: &str) -> &'static str {
    let p = Path::new(path_str);
    match p.extension().and_then(|s| s.to_str()).unwrap_or("") {
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

fn handle_client(mut stream: TcpStream) {
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

    let target_path = if sub_path.is_empty() {
        "index.html"
    } else {
        sub_path
    };

    let (status, content_type, body): (&str, &str, Cow<'static, [u8]>) =
        if let Some(file) = Asset::get(target_path) {
            ("200 OK", get_mime(target_path), file.data)
        } else if let Some(fallback) = Asset::get("index.html") {
            ("200 OK", "text/html; charset=utf-8", fallback.data)
        } else {
            ("404 Not Found", "text/plain", Cow::Borrowed(b"Asset not found"))
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

fn launch_browser(url: &str) {
    #[cfg(windows)]
    {
        let win_browsers = [
            ("msedge", vec![format!("--app={}", url)]),
            ("chrome", vec![format!("--app={}", url)]),
            ("brave", vec![format!("--app={}", url)]),
        ];
        for (bin, args) in win_browsers {
            if Command::new(bin).args(&args).spawn().is_ok() {
                println!("✔ Launched CraftChat GUI window via {}", bin);
                return;
            }
        }
        let _ = Command::new("cmd").args(["/c", "start", url]).spawn();
    }

    #[cfg(target_os = "macos")]
    {
        let mac_browsers = [
            ("open", vec!["-a".to_string(), "Google Chrome".to_string(), "--args".to_string(), format!("--app={}", url)]),
            ("open", vec!["-a".to_string(), "Brave Browser".to_string(), "--args".to_string(), format!("--app={}", url)]),
            ("open", vec![url.to_string()]),
        ];
        for (bin, args) in mac_browsers {
            if Command::new(bin).args(&args).spawn().is_ok() {
                println!("✔ Launched CraftChat window on macOS via {}", bin);
                return;
            }
        }
    }

    #[cfg(not(any(windows, target_os = "macos")))]
    {
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
    }
}

fn main() {
    println!("=====================================================");
    println!("  CraftChat GUI Server & Launcher (Embedded Assets)  ");
    println!("=====================================================");

    let port = 4243;
    let url = format!("http://127.0.0.1:{}", port);

    // Try binding to port 4243
    let listener = match TcpListener::bind(format!("127.0.0.1:{}", port)) {
        Ok(l) => {
            println!("✔ Built-in frontend assets: Embedded in binary (RAM)");
            println!("🌐 CraftChat UI listening at: {}", url);
            Some(l)
        }
        Err(e) => {
            println!("ℹ Note: Port {} already in use or could not bind ({}), opening GUI directly...", port, e);
            None
        }
    };

    // If we bound the listener, spawn thread to handle requests
    if let Some(listener) = listener {
        thread::spawn(move || {
            for stream in listener.incoming() {
                match stream {
                    Ok(stream) => {
                        thread::spawn(move || {
                            handle_client(stream);
                        });
                    }
                    Err(e) => eprintln!("Connection error: {}", e),
                }
            }
        });
    }

    // Give server thread 200ms to spin up
    thread::sleep(Duration::from_millis(200));

    // Launch desktop app window in browser
    launch_browser(&url);

    // Keep server alive so embedded web server does not exit!
    println!("🚀 CraftChat is running! Keep this process active while using the app.");
    loop {
        thread::sleep(Duration::from_secs(3600));
    }
}
