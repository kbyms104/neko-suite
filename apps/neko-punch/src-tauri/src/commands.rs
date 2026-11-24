use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::path::Path;
use std::process::Command;
use std::sync::Mutex;
use sysinfo::{Pid, ProcessRefreshKind, ProcessesToUpdate, System, UpdateKind};

pub struct SystemState(pub Mutex<System>);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortProcessInfo {
    pub port: u16,
    pub pid: u32,
    pub name: String,
    pub cmd_hint: String,
    pub memory_mb: f64,
    pub protocol: String,
    pub local_addr: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PunchResult {
    pub success: bool,
    pub message: String,
    pub pid: u32,
}

fn extract_cmd_hint(proc: &sysinfo::Process) -> String {
    let cwd_name = proc
        .cwd()
        .and_then(|p| p.file_name())
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_default();

    let args: Vec<String> = proc
        .cmd()
        .iter()
        .skip(1)
        .map(|s| s.to_string_lossy().to_string())
        .collect();

    let keywords = [
        "vite", "next", "nuxt", "remix", "astro", "webpack", "rollup", "esbuild", "tsx",
        "ts-node", "nodemon", "uvicorn", "gunicorn", "fastapi", "flask", "django", "celery",
        "tauri", "cargo", "spring", "docker", "jupyter", "streamlit", "gradio",
    ];

    let mut script_or_tool = String::new();
    for arg in &args {
        let lower = arg.to_lowercase();
        if let Some(kw) = keywords.iter().find(|&&k| lower.contains(k)) {
            script_or_tool = (*kw).to_string();
            break;
        }
        if !arg.starts_with('-')
            && (lower.ends_with(".js")
                || lower.ends_with(".mjs")
                || lower.ends_with(".cjs")
                || lower.ends_with(".ts")
                || lower.ends_with(".py")
                || lower.ends_with(".jar"))
        {
            if let Some(fname) = Path::new(arg).file_name() {
                script_or_tool = fname.to_string_lossy().to_string();
                break;
            }
        }
    }

    if script_or_tool.is_empty() {
        if let Some(first_non_flag) = args.iter().find(|a| !a.starts_with('-') && !a.is_empty()) {
            let clean = Path::new(first_non_flag)
                .file_name()
                .map(|s| s.to_string_lossy().to_string())
                .unwrap_or_else(|| first_non_flag.clone());
            if !clean.is_empty() && clean.len() <= 24 {
                script_or_tool = clean;
            }
        }
    }

    match (script_or_tool.is_empty(), cwd_name.is_empty()) {
        (false, false) if script_or_tool != cwd_name => format!("{} · {}", script_or_tool, cwd_name),
        (false, _) => script_or_tool,
        (true, false) => cwd_name,
        (true, true) => String::new(),
    }
}

#[tauri::command]
pub fn scan_listening_ports(state: tauri::State<'_, SystemState>) -> Result<Vec<PortProcessInfo>, String> {
    // Windows netstat -ano -p tcp 실행하여 LISTEN 중인 포트와 PID 획득
    #[cfg(target_os = "windows")]
    let output = {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        Command::new("netstat")
            .args(&["-ano", "-p", "tcp"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .map_err(|e| format!("Failed to execute netstat: {}", e))?
    };

    #[cfg(not(target_os = "windows"))]
    let output = Command::new("netstat")
        .args(&["-tuln", "-p"])
        .output()
        .map_err(|e| format!("Failed to execute netstat: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);

    let mut raw_entries: Vec<(u16, u32, String, String)> = Vec::new();
    let mut seen = HashSet::new();
    let mut target_pids: HashSet<Pid> = HashSet::new();

    for line in stdout.lines() {
        let trimmed = line.trim();
        if !trimmed.starts_with("TCP") {
            continue;
        }

        let parts: Vec<&str> = trimmed.split_whitespace().collect();
        if parts.len() < 5 {
            continue;
        }

        let protocol = parts[0];
        let local_addr = parts[1];
        let state_str = parts[3];
        let pid_str = parts[4];

        if state_str.to_uppercase() != "LISTENING" {
            continue;
        }

        let pid = match pid_str.parse::<u32>() {
            Ok(p) => p,
            Err(_) => continue,
        };

        let port = match local_addr.rfind(':') {
            Some(idx) => match local_addr[idx + 1..].parse::<u16>() {
                Ok(p) => p,
                Err(_) => continue,
            },
            None => continue,
        };

        let key = (port, pid);
        if seen.contains(&key) {
            continue;
        }
        seen.insert(key);

        if pid > 4 {
            target_pids.insert(Pid::from_u32(pid));
        }
        raw_entries.push((port, pid, protocol.to_string(), local_addr.to_string()));
    }

    // 공유 System 인스턴스로 LISTEN 중인 PID만 최소 리프레시하여 CPU/메모리 오버헤드 최소화
    let pid_vec: Vec<Pid> = target_pids.into_iter().collect();
    let mut sys = state.0.lock().map_err(|e| format!("System lock error: {}", e))?;
    if !pid_vec.is_empty() {
        sys.refresh_processes_specifics(
            ProcessesToUpdate::Some(&pid_vec),
            ProcessRefreshKind::new()
                .with_memory()
                .with_cmd(UpdateKind::OnlyIfNotSet)
                .with_cwd(UpdateKind::OnlyIfNotSet),
        );
    }

    let mut list = Vec::with_capacity(raw_entries.len());
    for (port, pid, protocol, local_addr) in raw_entries {
        let (name, cmd_hint, memory_mb) = if let Some(proc) = sys.process(Pid::from_u32(pid)) {
            let proc_name = proc.name().to_string_lossy().to_string();
            let hint = extract_cmd_hint(proc);
            let mem_mb = proc.memory() as f64 / (1024.0 * 1024.0);
            (proc_name, hint, (mem_mb * 10.0).round() / 10.0)
        } else if pid == 0 {
            ("System Idle".to_string(), String::new(), 0.0)
        } else if pid == 4 {
            ("System Kernel".to_string(), String::new(), 0.0)
        } else {
            ("Unknown Process".to_string(), String::new(), 0.0)
        };

        list.push(PortProcessInfo {
            port,
            pid,
            name,
            cmd_hint,
            memory_mb,
            protocol,
            local_addr,
        });
    }

    // 포트 번호 오름차순 정렬
    list.sort_by_key(|item| item.port);

    Ok(list)
}

#[tauri::command]
pub fn punch_process(pid: u32) -> Result<PunchResult, String> {
    if pid <= 4 {
        return Err("시스템 핵심 프로세스는 종료할 수 없습니다.".to_string());
    }

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        // /F: 강제 종료, /T: 하위 자식 프로세스 트리까지 함께 종료
        let output = Command::new("taskkill")
            .args(&["/F", "/T", "/PID", &pid.to_string()])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .map_err(|e| format!("taskkill 실행 실패: {}", e))?;

        if output.status.success() {
            Ok(PunchResult {
                success: true,
                message: format!("프로세스(PID: {})를 성공적으로 종료했습니다.", pid),
                pid,
            })
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("프로세스 종료 실패: {}", stderr.trim()))
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let output = Command::new("kill")
            .args(&["-9", &pid.to_string()])
            .output()
            .map_err(|e| format!("kill execution failed: {}", e))?;

        if output.status.success() {
            Ok(PunchResult {
                success: true,
                message: format!("Process PID {} terminated successfully", pid),
                pid,
            })
        } else {
            Err("Failed to terminate process".to_string())
        }
    }
}

#[tauri::command]
pub fn punch_processes(pids: Vec<u32>) -> Result<Vec<u32>, String> {
    let mut killed = Vec::new();
    let unique_pids: HashSet<u32> = pids.into_iter().filter(|&p| p > 4).collect();
    for pid in unique_pids {
        if punch_process(pid).is_ok() {
            killed.push(pid);
        }
    }
    Ok(killed)
}

#[tauri::command]
pub fn hide_window(window: tauri::Window) {
    let _ = window.hide();
}

#[tauri::command]
pub fn exit_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[tauri::command]
pub fn close_window(window: tauri::Window) {
    let _ = window.close();
}

#[tauri::command]
pub fn minimize_window(window: tauri::Window) {
    let _ = window.minimize();
}

#[tauri::command]
pub fn start_drag_window(window: tauri::Window) {
    let _ = window.start_dragging();
}

