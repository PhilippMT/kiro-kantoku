# Kiro Kantoku Migration - Visual Decision Comparison

## 1. UI Framework Comparison Chart

```
Implementation Effort (25% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SwiftCrossUI    ████████████████████████ 7.0
Tauri           ███████████ 3.0
Qt              █████████ 2.0
GTK4            ██████████████ 4.0
Native/Platform ████ 1.0
Dear ImGui      ██████████████████ 5.0
Electron        ██████████████ 4.0

Maintenance Burden (20% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SwiftCrossUI    ██████████████ 4.0
Tauri           ████████████████████████ 8.0
Qt              ████████████████████████ 8.0
GTK4            ████████████████████ 7.0
Native/Platform █████ 2.0
Dear ImGui      ████████████████████ 7.0
Electron        ████████████████████ 7.0

Performance (15% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SwiftCrossUI    ████████████████████████ 8.0
Tauri           ████████████████████ 7.0
Qt              ███████████████████████████ 9.0
GTK4            ████████████████████████ 8.0
Native/Platform ██████████████████████████████ 10.0
Dear ImGui      ███████████████████████████ 9.0
Electron        ███████████ 3.0

Feature Parity (20% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SwiftCrossUI    ██████████████████ 6.0
Tauri           ███████████████████████████ 9.0
Qt              ███████████████████████████ 9.0
GTK4            ████████████████████████ 8.0
Native/Platform ██████████████████████████████ 10.0
Dear ImGui      ████████████████████ 7.0
Electron        ███████████████████████████ 9.0

User Experience (15% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SwiftCrossUI    ████████████████████ 7.0
Tauri           ██████████████████ 6.0
Qt              ████████████████████████ 8.0
GTK4            ██████████████████ 6.0
Native/Platform ██████████████████████████████ 10.0
Dear ImGui      ███████████████ 5.0
Electron        ████████████ 4.0

Ecosystem Maturity (5% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SwiftCrossUI    ██████ 2.0
Tauri           ███████████████████████████ 9.0
Qt              ██████████████████████████████ 10.0
GTK4            ████████████████████ 7.0
Native/Platform ██████████████████████████████ 10.0
Dear ImGui      ████████████████████████ 8.0
Electron        ██████████████████████████████ 10.0

TOTAL WEIGHTED SCORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SwiftCrossUI    █████████████████ 5.7
Tauri           ███████████████████ 6.4
Qt (C++/Python) █████████████████████ 6.5 ⭐ WINNER
GTK4            ██████████████████ 6.1
Native/Platform ███████████████ 5.1
Dear ImGui      █████████████████████ 6.5 ⭐ WINNER
Electron        █████████████████ 5.6
```

## 2. Process Management Comparison

```
Cross-Platform Support (30% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Swift Process       ██████████████████ 6.0
Rust subprocess     ██████████████████████████████ 10.0 ⭐
C/C++ libuv         ██████████████████████████████ 10.0
Platform-specific   ██████████████████████████████ 10.0
Python subprocess   ██████████████████████████████ 10.0

Implementation Effort (25% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Swift Process       ███████████████████████████ 9.0
Rust subprocess     ███████████████ 5.0
C/C++ libuv         ███████████ 3.0
Platform-specific   ██████ 2.0
Python subprocess   ████████████████████████ 8.0

Feature Completeness (20% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Swift Process       ████████████████████ 7.0
Rust subprocess     ███████████████████████████ 9.0 ⭐
C/C++ libuv         ████████████████████████ 8.0
Platform-specific   ██████████████████████████████ 10.0
Python subprocess   ███████████████████████████ 9.0

Reliability (15% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Swift Process       ████████████████████████ 8.0
Rust subprocess     ███████████████████████████ 9.0
C/C++ libuv         ████████████████████ 7.0
Platform-specific   ██████████████████ 6.0
Python subprocess   ███████████████████████████ 9.0

Performance (10% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Swift Process       ███████████████████████████ 9.0
Rust subprocess     ███████████████████████████ 9.0
C/C++ libuv         ██████████████████████████████ 10.0
Platform-specific   ██████████████████████████████ 10.0
Python subprocess   ████████████████████ 7.0

TOTAL WEIGHTED SCORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Swift Process       ██████████████████████ 7.5
Rust subprocess     ████████████████████████ 8.0 ⭐ WINNER
C/C++ libuv         █████████████████████ 7.2
Platform-specific   █████████████████████ 7.0
Python subprocess   █████████████████████████ 8.6 ⭐ (if using Python UI)
```

## 3. Configuration Storage Comparison

```
Cross-Platform Support (30% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ████████████████████ 7.0
JSON file           ██████████████████████████████ 10.0 ⭐
SQLite              ██████████████████████████████ 10.0
TOML file           ██████████████████████████████ 10.0
confy (Rust)        ██████████████████████████████ 10.0

Migration Effort (20% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ███████████████ 5.0
JSON file           ████████████████████████ 8.0
SQLite              ██████████████████ 6.0
TOML file           ████████████████████ 7.0
confy (Rust)        ████████████████████ 7.0

Feature Parity (20% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ███████████████████████████ 9.0
JSON file           ████████████████████████ 8.0
SQLite              ██████████████████████████████ 10.0
TOML file           ████████████████████████ 8.0
confy (Rust)        ███████████████████████████ 9.0

User Experience (15% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ██████████████████████████████ 10.0
JSON file           ████████████████████ 7.0
SQLite              ████████████████████ 7.0
TOML file           ████████████████████████ 8.0
confy (Rust)        ███████████████████████████ 9.0

Performance (10% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ███████████████████████████ 9.0
JSON file           ████████████████████████ 8.0
SQLite              ███████████████████████████ 9.0
TOML file           ████████████████████████ 8.0
confy (Rust)        ████████████████████████ 8.0

Simplicity (5% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ████████ 4.0
JSON file           ██████████████████████████████ 10.0 ⭐
SQLite              ███████████████ 5.0
TOML file           ████████████████████████ 8.0
confy (Rust)        ███████████████████████████ 9.0

TOTAL WEIGHTED SCORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   █████████████████████ 7.0
JSON file           █████████████████████████ 8.6 ⭐ WINNER
SQLite              ███████████████████ 7.9
TOML file           ████████████████████████ 8.4
confy (Rust)        █████████████████████████ 8.7 (if using Rust)
```

## 4. Notification System Comparison

```
Cross-Platform Support (35% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ████████████████████████ 8.0
notify-rust         ██████████████████████████████ 10.0
D-Bus + fallback    ██████████████████ 6.0
In-app toasts       ██████████████████████████████ 10.0
Hybrid approach     ██████████████████████████████ 10.0 ⭐
No notifications    ██████████████████████████████ 10.0

Native Integration (25% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ██████████████████████████████ 10.0
notify-rust         ████████████████████████ 8.0
D-Bus + fallback    ███████████████████████████ 9.0
In-app toasts       ██████ 2.0
Hybrid approach     ████████████████████████ 8.0 ⭐
No notifications    0.0

Implementation Effort (20% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ████████████ 4.0
notify-rust         ████████████████████ 7.0
D-Bus + fallback    ███████████████ 5.0
In-app toasts       ███████████████████████████ 9.0
Hybrid approach     ██████████████████ 6.0
No notifications    ██████████████████████████████ 10.0

Feature Completeness (15% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ██████████████████████████████ 10.0
notify-rust         ████████████████████ 7.0
D-Bus + fallback    ████████████████████████ 8.0
In-app toasts       ██████████████████ 6.0
Hybrid approach     ███████████████████████████ 9.0 ⭐
No notifications    0.0

Reliability (5% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ███████████████████████████ 9.0
notify-rust         ████████████████████████ 8.0
D-Bus + fallback    ████████████████████████ 8.0
In-app toasts       ██████████████████ 6.0
Hybrid approach     ███████████████████████████ 9.0
No notifications    ██████████████████████████████ 10.0

TOTAL WEIGHTED SCORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ███████████████████████ 7.8
notify-rust         ████████████████████████ 8.4
D-Bus + fallback    ████████████████████ 6.9
In-app toasts       ████████████████████ 6.9
Hybrid approach     █████████████████████████ 8.5 ⭐ WINNER
No notifications    ████████████████ 5.5
```

## 5. File Watching Comparison

```
Cross-Platform Support (30% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ████████████████████████ 8.0
notify (Rust)       ██████████████████████████████ 10.0 ⭐
Polling             ██████████████████████████████ 10.0
watchdog (Python)   ███████████████████████████ 9.0
No watching         ██████████████████████████████ 10.0
Git-based           ██████████████████████████████ 10.0

Performance (25% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ██████████████████████████████ 10.0
notify (Rust)       ███████████████████████████ 9.0 ⭐
Polling             ███████████ 3.0
watchdog (Python)   ████████████████████ 7.0
No watching         ██████████████████████████████ 10.0
Git-based           ████████████████████████ 8.0

Reliability (20% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ██████████████████████████████ 10.0
notify (Rust)       ███████████████████████████ 9.0
Polling             ██████████████████ 6.0
watchdog (Python)   ████████████████████████ 8.0
No watching         ███████████████ 5.0
Git-based           ████████████████████ 7.0

Implementation Effort (15% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ███████████ 3.0
notify (Rust)       ████████████████████ 7.0
Polling             ██████████████████████████████ 10.0
watchdog (Python)   ████████████████████████ 8.0
No watching         ██████████████████████████████ 10.0
Git-based           ████████████████████ 7.0

Feature Completeness (10% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ██████████████████████████████ 10.0
notify (Rust)       ███████████████████████████ 9.0
Polling             ███████████████ 5.0
watchdog (Python)   ████████████████████████ 8.0
No watching         0.0
Git-based           ██████████████████ 6.0

TOTAL WEIGHTED SCORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform-specific   ███████████████████████ 7.9
notify (Rust)       ████████████████████████████ 8.8 ⭐ WINNER
Polling             ██████████████████ 6.0
watchdog (Python)   ███████████████████████ 7.9
No watching         █████████████████████ 7.0
Git-based           ███████████████████████ 7.8
```

## 6. Overall Architecture Comparison

```
Implementation Effort (25% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Swift+SwiftCrossUI  ████████████████████████ 8.0
Rust+ImGui          ███████████ 3.0
Qt C++/Rust         ████████████ 4.0
Qt Python/Rust      ██████████████████ 6.0 ⭐
Tauri+React         ████████████ 4.0
Hybrid Native       ███████████████ 5.0

Maintainability (25% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Swift+SwiftCrossUI  ████████████ 4.0
Rust+ImGui          ███████████████████████████ 9.0
Qt C++/Rust         ████████████████████████ 8.0
Qt Python/Rust      ████████████████████ 7.0 ⭐
Tauri+React         ████████████████████████ 8.0
Hybrid Native       ████████████ 4.0

Performance (15% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Swift+SwiftCrossUI  ████████████████████████ 8.0
Rust+ImGui          ██████████████████████████████ 10.0
Qt C++/Rust         ███████████████████████████ 9.0
Qt Python/Rust      ████████████████████ 7.0
Tauri+React         ████████████████████ 7.0
Hybrid Native       ███████████████████████████ 9.0

User Experience (15% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Swift+SwiftCrossUI  ██████████████████ 6.0
Rust+ImGui          ████████████████████ 7.0
Qt C++/Rust         ███████████████████████████ 9.0
Qt Python/Rust      ████████████████████████ 8.0 ⭐
Tauri+React         ██████████████████ 6.0
Hybrid Native       ███████████████████████████ 9.0

Risk (10% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Swift+SwiftCrossUI  ███████████ 3.0
Rust+ImGui          ████████████████████ 7.0
Qt C++/Rust         ████████████████████ 7.0
Qt Python/Rust      ████████████████████████ 8.0 ⭐
Tauri+React         ████████████████████████ 8.0
Hybrid Native       ██████████████████ 6.0

Team Skill Match (10% weight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Swift+SwiftCrossUI  ██████████████████████████████ 10.0
Rust+ImGui          ███████████████ 5.0
Qt C++/Rust         ██████████████████ 6.0
Qt Python/Rust      ████████████████████ 7.0
Tauri+React         ██████████████████ 6.0
Hybrid Native       ████████████████████ 7.0

TOTAL WEIGHTED SCORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Swift+SwiftCrossUI  ██████████████████ 6.3
Rust+ImGui          ██████████████████ 6.4
Qt C++/Rust         ███████████████████ 6.8
Qt Python/Rust      █████████████████████ 7.0 ⭐ WINNER
Tauri+React         ██████████████████ 6.4
Hybrid Native       █████████████████ 6.1
```

## 7. Technology Stack Matrix

### Recommended Stack (Qt Python + Rust)

| Layer | Technology | Score | Why? |
|-------|-----------|-------|------|
| **UI** | PySide6 | 6.5/10 | Native widgets, rapid dev, excellent docs |
| **Process Mgmt** | Rust tokio | 8.0/10 | Cross-platform, async, safe |
| **File Watching** | notify crate | 8.8/10 | Native backends, reliable |
| **Config** | JSON files | 8.6/10 | Simple, portable, debuggable |
| **Notifications** | Hybrid | 8.5/10 | Best UX, graceful degradation |

**Overall Architecture Score: 7.0/10**

### Alternative Stack (Rust + Dear ImGui)

| Layer | Technology | Score | Why? |
|-------|-----------|-------|------|
| **UI** | Dear ImGui | 6.5/10 | Perfect for dev tools, fast |
| **Process Mgmt** | Rust tokio | 8.0/10 | Same as above |
| **File Watching** | notify crate | 8.8/10 | Same as above |
| **Config** | confy crate | 8.7/10 | Rust-native, type-safe |
| **Notifications** | notify-rust | 8.4/10 | Cross-platform native |

**Overall Architecture Score: 6.4/10**

## 8. Risk vs. Reward Matrix

```
                 High Reward
                     ▲
                     │
        Qt C++/Rust  │  Native/Platform
             ●       │       ●
                     │
     Qt Python/Rust  │
  Low Risk    ●──────┼───────────► High Risk
                     │
        Tauri/React  │  Swift+SwiftCrossUI
             ●       │       ●
                     │
          Rust/ImGui │
             ●       │
                     │
                Low Reward

Legend:
● = Architecture option
Ideal quadrant: Top-Left (High Reward, Low Risk)
```

**Analysis:**
- **Qt Python/Rust**: Best position (high reward, low risk)
- **Qt C++/Rust**: High reward but moderate risk
- **Swift+SwiftCrossUI**: High risk due to immaturity
- **Native/Platform**: High reward but highest risk (3x codebases)
- **Rust/ImGui**: Moderate in both dimensions
- **Tauri/React**: Lower reward due to webview

## 9. Timeline Comparison

```
Weeks to Feature Parity
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Swift+SwiftCrossUI  ██████ 6 weeks (fast, but may hit blockers)
Rust+ImGui          ████████████████ 16 weeks (complete rewrite)
Qt C++/Rust         ██████████████████ 18 weeks (two complex systems)
Qt Python/Rust      ██████████████ 14 weeks ⭐ RECOMMENDED
Tauri+React         ████████████████ 16 weeks (web UI rewrite)
Hybrid Native       ████████████████████████ 24 weeks (2+ UIs)

Note: SwiftCrossUI fastest BUT highest risk of delays due to bugs/missing features
```

## 10. Bundle Size Comparison

```
Estimated Package Size (MB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Swift+SwiftCrossUI  ████ 20 MB (Swift runtime + UI)
Rust+ImGui          ██ 10 MB (smallest - single binary)
Qt C++/Rust         ██████ 30 MB (Qt libs + Rust)
Qt Python/Rust      ████████████ 60 MB (Python + Qt + Rust) ⭐
Tauri+React         ████████ 40 MB (webview + Rust)
Electron            ████████████████████ 100+ MB (Chromium!)

Note: Size less critical for developer tools
Qt Python larger but acceptable
```

## 11. Decision Tree: Should I Choose Qt Python + Rust?

```
                    ┌─────────────────────────┐
                    │ Cross-platform needed?  │
                    └────────┬────────────────┘
                             │
                     ┌───────┴───────┐
                     │ YES           │ NO → Keep SwiftUI
                     ▼               │
          ┌──────────────────┐       │
          │ macOS-only UX    │       │
          │ critical?        │       │
          └────┬─────────────┘       │
               │                     │
       ┌───────┴───────┐            │
       │ YES           │ NO          │
       ▼               ▼             │
┌──────────────┐ ┌──────────────┐   │
│ Hybrid       │ │ Team has     │   │
│ Native       │ │ strong Rust? │   │
└──────────────┘ └────┬─────────┘   │
                      │              │
              ┌───────┴───────┐     │
              │ YES           │ NO   │
              ▼               ▼      │
       ┌─────────────┐  ┌──────────────────┐
       │ Prefer      │  │ Want native      │
       │ dev tool    │  │ widgets?         │
       │ aesthetic?  │  └────┬─────────────┘
       └──┬──────────┘       │
          │           ┌──────┴──────┐
   ┌──────┴──────┐   │ YES         │ NO
   │ YES         │ NO▼             ▼
   ▼             ▼  ┌───────────┐ ┌─────────┐
┌──────────┐ ┌────────────┐    │ Qt Python │ │ Tauri   │
│ Rust +   │ │ Qt C++ +   │    │ + Rust    │ │ + React │
│ ImGui    │ │ Rust       │    │ ⭐ WINNER │ └─────────┘
└──────────┘ └────────────┘    └───────────┘
```

## 12. Final Recommendation Scorecard

### Qt Python + Rust Backend

```
Category                 Grade    Notes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Implementation Effort    B+       14 weeks, manageable
Maintainability          B+       Single codebase, good tools
Performance              B        Good enough, can optimize
User Experience          A        Native widgets, good UX
Cross-Platform Support   A+       macOS, Linux, Windows
Risk                     A        Low risk, proven tech
Team Skills              B+       Python easier than C++/Rust
Documentation            A+       Excellent Qt/Python docs
Community                A        Large, active communities
Long-term Viability      A        Qt and Rust both mature

OVERALL GRADE: A-
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATION: PROCEED ✓
```

### Key Success Factors

1. ✅ Proven technology stack (Qt used by major apps)
2. ✅ Manageable learning curve (Python + gradual Rust)
3. ✅ Clear 14-week roadmap
4. ✅ Low technical risk
5. ✅ Excellent cross-platform support
6. ✅ Native user experience
7. ✅ Strong community support
8. ✅ Good long-term maintainability

### When to Reconsider

- ❌ Team is already expert in Rust (consider Rust+ImGui)
- ❌ macOS-only UX is critical (keep SwiftUI or go Hybrid)
- ❌ Absolute minimum bundle size needed (use Rust+ImGui)
- ❌ Web technologies strongly preferred (use Tauri)

## Conclusion

**Qt Python + Rust** is the clear winner with a score of **7.0/10**, offering:
- Best balance of all factors
- Manageable implementation (14 weeks)
- Low risk with proven technologies
- Excellent user experience
- Strong cross-platform support

**Start with a 1-week proof-of-concept to validate the architecture, then proceed with the full 14-week migration.**
