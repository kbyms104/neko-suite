use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::process::Command;
use sysinfo::{Pid, System};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortProcessInfo {
    pub port: u16,
    pub pid: u32,
    pub name: String,
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

#[tauri::command]
pub fn scan_listening_ports() -> Result<Vec<PortProcessInfo>, String> {
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

    // 프로세스 메모리 및 이름 조회를 위해 sysinfo 초기화
    let mut sys = System::new_all();
    sys.refresh_all();

    let mut list = Vec::new();
    let mut seen = HashSet::new();

    for line in stdout.lines() {
        let trimmed = line.trim();
        if !trimmed.starts_with("TCP") {
            continue;
        }

        // 공백으로 토큰 분리
        // 예: ["TCP", "0.0.0.0:8080", "0.0.0.0:0", "LISTENING", "14208"]
        let parts: Vec<&str> = trimmed.split_whitespace().collect();
        if parts.len() < 5 {
            continue;
        }

        let protocol = parts[0];
        let local_addr = parts[1];
        let state = parts[3];
        let pid_str = parts[4];

        if state.to_uppercase() != "LISTENING" {
            continue;
        }

        let pid = match pid_str.parse::<u32>() {
            Ok(p) => p,
            Err(_) => continue,
        };

        // 포트 번호 파싱 (예: "0.0.0.0:8080" 또는 "[::]:3000")
        let port = match local_addr.rfind(':') {
            Some(idx) => match local_addr[idx + 1..].parse::<u16>() {
                Ok(p) => p,
                Err(_) => continue,
            },
            None => continue,
        };

        // 중복 포트 & PID 쌍 필터링
        let key = (port, pid);
        if seen.contains(&key) {
            continue;
        }
        seen.insert(key);

        // sysinfo를 통해 프로세스 이름 및 메모리 추출
        let (name, memory_mb) = if let Some(proc) = sys.process(Pid::from(pid as usize)) {
            let proc_name = proc.name().to_string_lossy().to_string();
            let mem_mb = proc.memory() as f64 / (1024.0 * 1024.0);
            (proc_name, (mem_mb * 10.0).round() / 10.0)
        } else if pid == 0 {
            ("System Idle".to_string(), 0.0)
        } else if pid == 4 {
            ("System Kernel".to_string(), 0.0)
        } else {
            ("Unknown Process".to_string(), 0.0)
        };

        list.push(PortProcessInfo {
            port,
            pid,
            name,
            memory_mb,
            protocol: protocol.to_string(),
            local_addr: local_addr.to_string(),
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

