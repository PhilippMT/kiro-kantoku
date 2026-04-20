# Kiro Kantoku Cross-Platform Migration Decision Trees

## Executive Summary

This document provides comprehensive decision trees for migrating Kiro Kantoku from a macOS-only SwiftUI application to a cross-platform solution supporting macOS, Linux, and potentially Windows.

**Current State:**
- 57 SwiftUI view files
- Pure macOS SwiftUI application
- Tight integration with macOS APIs (UserDefaults, UserNotifications, FSEvents)
- Process management via Foundation's Process API
- Complex UI with dashboard, agent views, chat panels, code panels, pixel office visualization
- ACP (Agent Control Protocol) client implementation

---

## 1. UI Framework Decision Tree

### Evaluation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Implementation Effort | 25% | Time/complexity to migrate existing 57 views |
| Maintenance Burden | 20% | Long-term upkeep and technical debt |
| Performance | 15% | Runtime performance and resource usage |
| Feature Parity | 20% | Ability to replicate current UI features |
| User Experience | 15% | Native feel and platform conventions |
| Ecosystem Maturity | 5% | Community support, tooling, documentation |

### Options Analysis

#### Option 1: SwiftCrossUI
**Description:** Swift-native cross-platform UI framework using native GTK/Qt/Win32 backends

**Pros:**
- Minimal code changes (SwiftUI-like API)
- Same language as current codebase
- Type safety and Swift concurrency support
- Native rendering on each platform

**Cons:**
- Very immature ecosystem (0.x version)
- Limited documentation and community
- May not support all SwiftUI features
- Uncertain long-term viability
- Complex views may not translate cleanly

**Scoring:**
- Implementation Effort: 7/10 (similar API, but may need workarounds)
- Maintenance Burden: 4/10 (immature, breaking changes expected)
- Performance: 8/10 (native backends)
- Feature Parity: 6/10 (subset of SwiftUI features)
- User Experience: 7/10 (native rendering)
- Ecosystem Maturity: 2/10 (very new project)

**Weighted Score: 5.7/10**

#### Option 2: Tauri + Web Frontend (React/Svelte)
**Description:** Rust backend with web-based frontend using system webview

**Pros:**
- Mature ecosystem with excellent tooling
- Cross-platform out of the box
- Rich UI component libraries
- Good performance with system webview
- Strong security model
- Active community and development

**Cons:**
- Complete UI rewrite required
- Different language/paradigm
- Non-native feel (webview-based)
- Requires learning Rust + web framework
- Larger bundle size

**Scoring:**
- Implementation Effort: 3/10 (complete rewrite)
- Maintenance Burden: 8/10 (stable, well-maintained)
- Performance: 7/10 (webview overhead, but optimized)
- Feature Parity: 9/10 (web has rich capabilities)
- User Experience: 6/10 (webview, not native)
- Ecosystem Maturity: 9/10 (mature project)

**Weighted Score: 6.4/10**

#### Option 3: Qt for Python (PySide6) or Qt C++
**Description:** Industry-standard cross-platform native UI framework

**Pros:**
- Proven cross-platform solution
- Excellent documentation
- Native look and feel per platform
- Comprehensive widget set
- Strong performance
- Mature tooling

**Cons:**
- Complete rewrite in Python/C++
- Licensing considerations (LGPL/Commercial)
- Learning curve for Qt framework
- Verbose compared to declarative UIs
- Different architectural patterns

**Scoring:**
- Implementation Effort: 2/10 (complete rewrite, different paradigm)
- Maintenance Burden: 8/10 (stable, well-maintained)
- Performance: 9/10 (native C++/Python)
- Feature Parity: 9/10 (comprehensive framework)
- User Experience: 8/10 (native widgets)
- Ecosystem Maturity: 10/10 (decades of development)

**Weighted Score: 6.5/10**

#### Option 4: GTK4 (via Swift or Rust bindings)
**Description:** GNOME's cross-platform UI toolkit

**Pros:**
- Native on Linux (primary target)
- Swift bindings available (SwiftGtk)
- Modern GTK4 features
- Open source (LGPL)
- Good performance

**Cons:**
- Non-native on macOS
- Less polished on Windows
- Smaller community than Qt
- Steeper learning curve
- May feel foreign to macOS users

**Scoring:**
- Implementation Effort: 4/10 (rewrite, but Swift bindings available)
- Maintenance Burden: 7/10 (stable, but binding maintenance)
- Performance: 8/10 (native toolkit)
- Feature Parity: 8/10 (modern features)
- User Experience: 6/10 (great on Linux, less so elsewhere)
- Ecosystem Maturity: 7/10 (mature toolkit, newer bindings)

**Weighted Score: 6.1/10**

#### Option 5: Native Per Platform (SwiftUI + GTK + Win32)
**Description:** Maintain separate UI implementations per platform

**Pros:**
- Best native experience per platform
- Maximum feature access
- Optimal performance
- Platform-specific optimizations possible

**Cons:**
- 3x implementation and maintenance cost
- Expertise needed in multiple frameworks
- Feature parity challenges
- Testing complexity
- Significantly more code

**Scoring:**
- Implementation Effort: 1/10 (write everything 3 times)
- Maintenance Burden: 2/10 (maintain 3 codebases)
- Performance: 10/10 (optimal per platform)
- Feature Parity: 10/10 (can use all platform features)
- User Experience: 10/10 (truly native)
- Ecosystem Maturity: 10/10 (all mature)

**Weighted Score: 5.1/10**

#### Option 6: Dear ImGui (C++ with Swift/Rust bindings)
**Description:** Immediate-mode GUI for tool UIs

**Pros:**
- Perfect for developer tools
- Excellent performance
- Cross-platform
- Easy to integrate with existing code
- Simple mental model
- Great for rapid iteration

**Cons:**
- Non-native appearance
- Custom look (may be pro or con)
- Requires rendering context setup
- Less suitable for document-based UIs
- Manual layout calculations

**Scoring:**
- Implementation Effort: 5/10 (different paradigm, moderate learning curve)
- Maintenance Burden: 7/10 (stable, simple model)
- Performance: 9/10 (extremely efficient)
- Feature Parity: 7/10 (good for tools, less for rich UIs)
- User Experience: 5/10 (non-native, but functional)
- Ecosystem Maturity: 8/10 (widely used in gamedev/tools)

**Weighted Score: 6.5/10**

#### Option 7: Electron
**Description:** Chromium + Node.js based desktop apps

**Pros:**
- Massive ecosystem
- Cross-platform
- Rich web technologies
- Many component libraries
- Easy to find developers

**Cons:**
- Very heavy resource usage
- Large bundle size (100MB+)
- Security concerns
- Poor battery life
- Not native feel
- Memory intensive

**Scoring:**
- Implementation Effort: 4/10 (complete rewrite)
- Maintenance Burden: 7/10 (mature ecosystem)
- Performance: 3/10 (resource heavy)
- Feature Parity: 9/10 (web capabilities)
- User Experience: 4/10 (non-native, heavy)
- Ecosystem Maturity: 10/10 (very mature)

**Weighted Score: 5.6/10**

### Decision Matrix Summary

| Option | Implementation | Maintenance | Performance | Features | UX | Ecosystem | **Total** |
|--------|---------------|-------------|-------------|----------|----|-----------|-----------|
| SwiftCrossUI | 7.0 | 4.0 | 8.0 | 6.0 | 7.0 | 2.0 | **5.7** |
| Tauri | 3.0 | 8.0 | 7.0 | 9.0 | 6.0 | 9.0 | **6.4** |
| Qt | 2.0 | 8.0 | 9.0 | 9.0 | 8.0 | 10.0 | **6.5** |
| GTK4 | 4.0 | 7.0 | 8.0 | 8.0 | 6.0 | 7.0 | **6.1** |
| Native Per-Platform | 1.0 | 2.0 | 10.0 | 10.0 | 10.0 | 10.0 | **5.1** |
| Dear ImGui | 5.0 | 7.0 | 9.0 | 7.0 | 5.0 | 8.0 | **6.5** |
| Electron | 4.0 | 7.0 | 3.0 | 9.0 | 4.0 | 10.0 | **5.6** |

### Recommendation: Qt (C++ or Python) or Dear ImGui

**Primary Recommendation: Dear ImGui (C++ with Swift backend)**

For a developer-focused agent monitoring tool, Dear ImGui offers the best balance:
- Excellent for terminal/code views, logs, and real-time monitoring
- Very fast rendering (critical for live agent output)
- Clean integration with existing Swift process management
- Unified codebase across platforms
- Perfect aesthetic match for a developer tool

**Secondary Recommendation: Qt (C++)**

If a more traditional application feel is desired:
- Industry-proven cross-platform solution
- Native widgets and excellent platform integration
- Rich feature set for complex UIs
- Strong stability and performance

**Why not SwiftCrossUI:**
Despite the ease of migration, the project's immaturity poses too high a risk for production use. Breaking changes and lack of feature support could create major headaches.

**Why not Tauri:**
While mature and popular, the webview approach doesn't provide the best experience for a developer tool that shows logs, diffs, and real-time terminal output.

---

## 2. Process Management Decision Tree

### Evaluation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Cross-Platform Support | 30% | Works on macOS, Linux, Windows |
| Implementation Effort | 25% | Ease of migration from current Process API |
| Feature Completeness | 20% | PTY, environment, signals, I/O streaming |
| Reliability | 15% | Stability and error handling |
| Performance | 10% | Overhead and resource usage |

### Options Analysis

#### Option 1: Keep Swift Foundation Process (with platform abstraction)
**Description:** Continue using Foundation's Process class with platform-specific handling

**Pros:**
- Minimal changes to existing code
- Well-tested on macOS
- Integrated with Swift ecosystem
- Good documentation

**Cons:**
- macOS and Linux only (no Windows)
- Limited PTY support
- Platform differences require abstraction
- Some features unavailable on Linux

**Scoring:**
- Cross-Platform Support: 6/10 (macOS + Linux only)
- Implementation Effort: 9/10 (already implemented)
- Feature Completeness: 7/10 (basic features covered)
- Reliability: 8/10 (well-tested)
- Performance: 9/10 (native, low overhead)

**Weighted Score: 7.5/10**

#### Option 2: Rust subprocess crates (via FFI or separate binary)
**Description:** Use Rust's tokio::process or similar, exposed via FFI or as subprocess wrapper

**Pros:**
- Excellent cross-platform support (including Windows)
- Async/await integration
- Robust error handling
- Good PTY support via portable-pty
- Active maintenance

**Cons:**
- FFI complexity
- Additional language/toolchain
- Async boundary management
- Rust learning curve

**Scoring:**
- Cross-Platform Support: 10/10 (macOS, Linux, Windows)
- Implementation Effort: 5/10 (FFI or rewrite)
- Feature Completeness: 9/10 (comprehensive)
- Reliability: 9/10 (Rust safety)
- Performance: 9/10 (efficient)

**Weighted Score: 8.0/10**

#### Option 3: C/C++ libev or libuv based solution
**Description:** Low-level event-driven process management

**Pros:**
- Cross-platform (via libuv)
- Very high performance
- Full control over I/O
- Well-tested (Node.js uses libuv)

**Cons:**
- Low-level, more code required
- Manual memory management
- Steeper learning curve
- More potential for bugs

**Scoring:**
- Cross-Platform Support: 10/10 (excellent)
- Implementation Effort: 3/10 (low-level, complex)
- Feature Completeness: 8/10 (full control)
- Reliability: 7/10 (manual management risks)
- Performance: 10/10 (minimal overhead)

**Weighted Score: 7.2/10**

#### Option 4: Platform-specific abstractions (POSIX spawn + Windows CreateProcess)
**Description:** Write thin abstraction layer over platform APIs

**Pros:**
- Maximum platform integration
- Minimal dependencies
- Full feature access
- Optimal performance

**Cons:**
- Significant implementation work
- Platform-specific expertise needed
- Testing complexity
- Maintenance burden

**Scoring:**
- Cross-Platform Support: 10/10 (all platforms)
- Implementation Effort: 2/10 (write everything)
- Feature Completeness: 10/10 (direct API access)
- Reliability: 6/10 (more surface area for bugs)
- Performance: 10/10 (optimal)

**Weighted Score: 7.0/10**

#### Option 5: Python subprocess module (if UI is Python-based)
**Description:** Use Python's subprocess module if Qt Python is chosen

**Pros:**
- Excellent cross-platform support
- Rich feature set
- Easy to use
- Well-documented
- Mature and stable

**Cons:**
- Requires Python runtime
- Less performant than native
- GIL considerations
- Dependency on Python version

**Scoring:**
- Cross-Platform Support: 10/10 (excellent)
- Implementation Effort: 8/10 (if already using Python)
- Feature Completeness: 9/10 (comprehensive)
- Reliability: 9/10 (battle-tested)
- Performance: 7/10 (Python overhead)

**Weighted Score: 8.6/10** (if using Python for UI)
**Weighted Score: 4.0/10** (if not using Python)

### Decision Matrix Summary

| Option | Cross-Platform | Implementation | Features | Reliability | Performance | **Total** |
|--------|---------------|----------------|----------|-------------|-------------|-----------|
| Swift Process | 6.0 | 9.0 | 7.0 | 8.0 | 9.0 | **7.5** |
| Rust subprocess | 10.0 | 5.0 | 9.0 | 9.0 | 9.0 | **8.0** |
| C/C++ libuv | 10.0 | 3.0 | 8.0 | 7.0 | 10.0 | **7.2** |
| Platform-specific | 10.0 | 2.0 | 10.0 | 6.0 | 10.0 | **7.0** |
| Python subprocess | 10.0 | 8.0 | 9.0 | 9.0 | 7.0 | **8.6*** |

*Conditional on using Python for UI

### Recommendation: Rust subprocess with FFI

**Rationale:**
- Best cross-platform support including Windows
- Excellent reliability and safety guarantees
- Good FFI options (swift-bridge or cbindgen)
- Can be packaged as small subprocess wrapper if FFI is too complex
- Strong ecosystem for async subprocess management
- portable-pty crate for PTY support

**Implementation approach:**
1. Create Rust library with C-compatible FFI
2. Expose async process creation, I/O streaming, signal sending
3. Use Swift async/await to bridge to Rust futures
4. Package Rust binary alongside application

**Alternative:** If UI framework is Python-based (Qt Python), use Python subprocess directly for simplicity.

---

## 3. Configuration Storage Decision Tree

### Evaluation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Cross-Platform Support | 30% | Works on all target platforms |
| Migration Effort | 20% | Ease of migrating from UserDefaults |
| Feature Parity | 20% | Supports all current settings patterns |
| User Experience | 15% | Standard platform locations, sync |
| Performance | 10% | Read/write speed |
| Simplicity | 5% | API ease of use |

### Options Analysis

#### Option 1: Platform-specific (UserDefaults + dconf/Registry)
**Description:** Use native storage on each platform

**Pros:**
- Most native UX
- Platform conventions
- May sync on macOS
- System integration

**Cons:**
- Different APIs per platform
- Complex abstraction needed
- Migration complexity
- Testing complexity

**Scoring:**
- Cross-Platform Support: 7/10 (works, but different APIs)
- Migration Effort: 5/10 (needs abstraction layer)
- Feature Parity: 9/10 (full platform features)
- User Experience: 10/10 (native)
- Performance: 9/10 (optimized per platform)
- Simplicity: 4/10 (complex abstraction)

**Weighted Score: 7.0/10**

#### Option 2: JSON file in standard config directory
**Description:** Simple JSON file in XDG_CONFIG_HOME/~/Library/Application Support

**Pros:**
- Extremely simple
- Portable
- Easy to debug/edit
- Version control friendly
- Atomic writes possible

**Cons:**
- No type safety at storage level
- Manual parsing
- No built-in syncing
- Race condition potential

**Scoring:**
- Cross-Platform Support: 10/10 (works everywhere)
- Migration Effort: 8/10 (straightforward conversion)
- Feature Parity: 8/10 (can store all data)
- User Experience: 7/10 (standard locations)
- Performance: 8/10 (fast enough for config)
- Simplicity: 10/10 (very simple)

**Weighted Score: 8.6/10**

#### Option 3: SQLite database
**Description:** Embedded SQLite database for settings

**Pros:**
- ACID properties
- Structured data
- Migration support
- Concurrent access
- Rich query capabilities

**Cons:**
- Overkill for simple key-value
- Larger dependency
- Schema management
- More complex than needed

**Scoring:**
- Cross-Platform Support: 10/10 (everywhere)
- Migration Effort: 6/10 (schema definition needed)
- Feature Parity: 10/10 (can do anything)
- User Experience: 7/10 (standard locations)
- Performance: 9/10 (very fast)
- Simplicity: 5/10 (more complex)

**Weighted Score: 7.9/10**

#### Option 4: TOML configuration file
**Description:** TOML file for human-readable configuration

**Pros:**
- Human-readable and editable
- Good for structured config
- Comments supported
- Type hints
- Popular in Rust ecosystem

**Cons:**
- Parsing library needed
- Less suited for programmatic updates
- Manual file management

**Scoring:**
- Cross-Platform Support: 10/10 (text file)
- Migration Effort: 7/10 (need parser)
- Feature Parity: 8/10 (good structure support)
- User Experience: 8/10 (user can edit)
- Performance: 8/10 (fast parsing)
- Simplicity: 8/10 (simple format)

**Weighted Score: 8.4/10**

#### Option 5: confy crate (Rust) or equivalent
**Description:** Opinionated config library handling platform paths

**Pros:**
- Handles platform directories
- Serialization built-in
- Simple API
- Atomic writes
- Type-safe

**Cons:**
- Rust-specific
- Less control
- Opinionated structure

**Scoring:**
- Cross-Platform Support: 10/10 (handles all platforms)
- Migration Effort: 7/10 (if using Rust)
- Feature Parity: 9/10 (serde serialization)
- User Experience: 9/10 (correct paths)
- Performance: 8/10 (efficient)
- Simplicity: 9/10 (very easy API)

**Weighted Score: 8.7/10** (if using Rust)

### Decision Matrix Summary

| Option | Cross-Platform | Migration | Features | UX | Performance | Simplicity | **Total** |
|--------|---------------|-----------|----------|-------|-------------|------------|-----------|
| Platform-specific | 7.0 | 5.0 | 9.0 | 10.0 | 9.0 | 4.0 | **7.0** |
| JSON file | 10.0 | 8.0 | 8.0 | 7.0 | 8.0 | 10.0 | **8.6** |
| SQLite | 10.0 | 6.0 | 10.0 | 7.0 | 9.0 | 5.0 | **7.9** |
| TOML file | 10.0 | 7.0 | 8.0 | 8.0 | 8.0 | 8.0 | **8.4** |
| confy (Rust) | 10.0 | 7.0 | 9.0 | 9.0 | 8.0 | 9.0 | **8.7*** |

*Conditional on using Rust

### Recommendation: JSON file with structured directories

**Rationale:**
- Simple, portable, debuggable
- Use directories: `~/.config/kiro-kantoku/` (Linux), `~/Library/Application Support/KiroKantoku/` (macOS)
- Store as `config.json` with atomic writes
- Easy migration from UserDefaults (just export to JSON)
- Can add schema validation if needed
- Version field for future migrations

**Implementation:**
```
$CONFIG_DIR/
  config.json           # Main settings
  agent_configs/        # Agent configuration profiles
    default.json
    custom1.json
  workspaces.json       # Workspace state
```

**Alternative:** If using Rust for backend, use confy crate for even simpler implementation.

---

## 4. Notification System Decision Tree

### Evaluation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Cross-Platform Support | 35% | Works on macOS, Linux, Windows |
| Native Integration | 25% | Uses platform notification systems |
| Implementation Effort | 20% | Migration complexity |
| Feature Completeness | 15% | Actions, icons, sounds |
| Reliability | 5% | Delivery guarantees |

### Options Analysis

#### Option 1: Platform-specific (UNUserNotificationCenter + libnotify + Windows Toast)
**Description:** Native notification API per platform

**Pros:**
- Best native integration
- Platform features (actions, etc.)
- System settings integration
- Notification center support

**Cons:**
- Three different APIs
- Complex abstraction layer
- Permission handling varies
- Testing complexity

**Scoring:**
- Cross-Platform Support: 8/10 (works but different)
- Native Integration: 10/10 (fully native)
- Implementation Effort: 4/10 (complex abstraction)
- Feature Completeness: 10/10 (all platform features)
- Reliability: 9/10 (platform-guaranteed)

**Weighted Score: 7.8/10**

#### Option 2: notify-rust crate (Rust)
**Description:** Cross-platform notification library in Rust

**Pros:**
- Single API for all platforms
- Good platform integration
- Active maintenance
- Handles platform differences

**Cons:**
- Rust dependency
- FFI or subprocess communication
- Some platform features limited
- Less control than native

**Scoring:**
- Cross-Platform Support: 10/10 (macOS, Linux, Windows, BSD)
- Native Integration: 8/10 (uses native backends)
- Implementation Effort: 7/10 (if using Rust backend)
- Feature Completeness: 7/10 (common subset)
- Reliability: 8/10 (well-tested)

**Weighted Score: 8.4/10** (with Rust backend)

#### Option 3: D-Bus notifications (Linux) + fallback
**Description:** Use D-Bus on Linux, platform-specific elsewhere

**Pros:**
- Standard on Linux
- Good integration
- Well-specified protocol

**Cons:**
- Linux-only for main path
- Still need macOS/Windows solutions
- D-Bus complexity
- Less unified

**Scoring:**
- Cross-Platform Support: 6/10 (great on Linux, need other solutions)
- Native Integration: 9/10 (very native on Linux)
- Implementation Effort: 5/10 (still need multiple paths)
- Feature Completeness: 8/10 (good on Linux)
- Reliability: 8/10 (D-Bus is reliable)

**Weighted Score: 6.9/10**

#### Option 4: Toast notifications (electron-like approach)
**Description:** In-app toast notifications rendered in UI

**Pros:**
- Fully cross-platform
- Complete control
- Consistent UX
- No permissions needed
- Easy to implement

**Cons:**
- Not native
- Requires app to be open
- No system integration
- Won't show when minimized

**Scoring:**
- Cross-Platform Support: 10/10 (UI-based)
- Native Integration: 2/10 (not native)
- Implementation Effort: 9/10 (easy)
- Feature Completeness: 6/10 (basic)
- Reliability: 6/10 (app must be running)

**Weighted Score: 6.9/10**

#### Option 5: Hybrid approach (in-app + native when available)
**Description:** In-app toasts with optional native notifications

**Pros:**
- Best of both worlds
- Graceful degradation
- Works when app focused
- Native when backgrounded
- User preference control

**Cons:**
- More implementation work
- Two notification paths
- Complexity in state management

**Scoring:**
- Cross-Platform Support: 10/10 (always works)
- Native Integration: 8/10 (when available)
- Implementation Effort: 6/10 (moderate)
- Feature Completeness: 9/10 (comprehensive)
- Reliability: 9/10 (dual path)

**Weighted Score: 8.5/10**

#### Option 6: No notifications (developer tool philosophy)
**Description:** Remove notifications, rely on in-app indicators

**Pros:**
- Simplest solution
- No platform dependencies
- No permission requests
- No interruptions
- Developer tools often skip this

**Cons:**
- Loss of background awareness
- User might miss important events
- No out-of-app alerts

**Scoring:**
- Cross-Platform Support: 10/10 (N/A)
- Native Integration: 0/10 (none)
- Implementation Effort: 10/10 (remove code)
- Feature Completeness: 0/10 (no notifications)
- Reliability: 10/10 (N/A)

**Weighted Score: 5.5/10**

### Decision Matrix Summary

| Option | Cross-Platform | Native | Implementation | Features | Reliability | **Total** |
|--------|---------------|---------|----------------|----------|-------------|-----------|
| Platform-specific | 8.0 | 10.0 | 4.0 | 10.0 | 9.0 | **7.8** |
| notify-rust | 10.0 | 8.0 | 7.0 | 7.0 | 8.0 | **8.4** |
| D-Bus + fallback | 6.0 | 9.0 | 5.0 | 8.0 | 8.0 | **6.9** |
| In-app toasts | 10.0 | 2.0 | 9.0 | 6.0 | 6.0 | **6.9** |
| Hybrid | 10.0 | 8.0 | 6.0 | 9.0 | 9.0 | **8.5** |
| No notifications | 10.0 | 0.0 | 10.0 | 0.0 | 10.0 | **5.5** |

### Recommendation: Hybrid approach (in-app + notify-rust)

**Rationale:**
- In-app toast notifications for when user is actively using the app
- Native notifications via notify-rust for background events
- User preference: "Enable background notifications" toggle
- Best user experience across all scenarios
- Graceful degradation if native notifications unavailable

**Implementation:**
1. In-app notification system (part of UI)
2. notify-rust integration for background events
3. Smart routing: in-app if window focused, native if not
4. User settings for notification preferences per event type

**Alternative:** If notifications prove less critical for a developer tool, consider in-app only approach for simplicity.

---

## 5. File Watching Decision Tree

### Evaluation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Cross-Platform Support | 30% | Works on all platforms |
| Performance | 25% | CPU/resource usage, latency |
| Reliability | 20% | Event accuracy, no missed changes |
| Implementation Effort | 15% | Complexity to implement |
| Feature Completeness | 10% | Recursive, filters, etc. |

### Options Analysis

#### Option 1: Platform-specific (FSEvents + inotify + ReadDirectoryChangesW)
**Description:** Native file watching APIs per platform

**Pros:**
- Best performance per platform
- Lowest latency
- Most reliable
- Platform-optimized
- Comprehensive events

**Cons:**
- Three different APIs
- Complex abstraction
- Different event models
- Testing complexity

**Scoring:**
- Cross-Platform Support: 8/10 (works, different APIs)
- Performance: 10/10 (optimal)
- Reliability: 10/10 (native guarantees)
- Implementation Effort: 3/10 (very complex)
- Feature Completeness: 10/10 (full access)

**Weighted Score: 7.9/10**

#### Option 2: notify crate (Rust)
**Description:** Cross-platform file watching library in Rust

**Pros:**
- Single API for all platforms
- Uses native backends
- Well-maintained
- Good performance
- Debouncing built-in
- Handles platform quirks

**Cons:**
- Rust dependency
- FFI complexity
- Some event translation overhead

**Scoring:**
- Cross-Platform Support: 10/10 (excellent support)
- Performance: 9/10 (near-native)
- Reliability: 9/10 (battle-tested)
- Implementation Effort: 7/10 (if using Rust)
- Feature Completeness: 9/10 (comprehensive)

**Weighted Score: 8.8/10** (with Rust backend)

#### Option 3: Polling with file system timestamps
**Description:** Periodically check file modification times

**Pros:**
- Extremely simple
- Works everywhere
- No native dependencies
- Predictable behavior
- Easy to debug

**Cons:**
- High latency (1-5 second intervals)
- Higher CPU usage
- Can miss rapid changes
- Battery impact
- Scalability issues with many files

**Scoring:**
- Cross-Platform Support: 10/10 (trivial)
- Performance: 3/10 (CPU intensive, high latency)
- Reliability: 6/10 (can miss events)
- Implementation Effort: 10/10 (very simple)
- Feature Completeness: 5/10 (basic)

**Weighted Score: 6.0/10**

#### Option 4: watchdog (Python library)
**Description:** Python file system event monitoring

**Pros:**
- Good cross-platform support
- Native backends
- Python-friendly
- Active maintenance
- Good documentation

**Cons:**
- Python dependency
- Some platform limitations
- Event model complexity

**Scoring:**
- Cross-Platform Support: 9/10 (good)
- Performance: 7/10 (Python overhead)
- Reliability: 8/10 (well-tested)
- Implementation Effort: 8/10 (if using Python)
- Feature Completeness: 8/10 (good features)

**Weighted Score: 7.9/10** (if using Python)

#### Option 5: No file watching (user-initiated refresh)
**Description:** Remove automatic watching, use manual refresh or git hooks

**Pros:**
- No complexity
- No resource usage
- Explicit control
- Simpler architecture

**Cons:**
- Less convenient UX
- Manual refresh needed
- Miss real-time updates
- More user actions required

**Scoring:**
- Cross-Platform Support: 10/10 (N/A)
- Performance: 10/10 (no overhead)
- Reliability: 5/10 (user-dependent)
- Implementation Effort: 10/10 (remove feature)
- Feature Completeness: 0/10 (no watching)

**Weighted Score: 7.0/10**

#### Option 6: Git-based watching only
**Description:** Watch git index changes instead of raw file system

**Pros:**
- More relevant for code changes
- Less noise
- Git already tracks what matters
- Lower resource usage
- Simpler implementation

**Cons:**
- Only works in git repos
- Misses non-staged changes
- Delayed detection
- Limited to git workflows

**Scoring:**
- Cross-Platform Support: 10/10 (git everywhere)
- Performance: 8/10 (efficient)
- Reliability: 7/10 (limited scope)
- Implementation Effort: 7/10 (moderate)
- Feature Completeness: 6/10 (git-only)

**Weighted Score: 7.8/10**

### Decision Matrix Summary

| Option | Cross-Platform | Performance | Reliability | Implementation | Features | **Total** |
|--------|---------------|-------------|-------------|----------------|----------|-----------|
| Platform-specific | 8.0 | 10.0 | 10.0 | 3.0 | 10.0 | **7.9** |
| notify (Rust) | 10.0 | 9.0 | 9.0 | 7.0 | 9.0 | **8.8** |
| Polling | 10.0 | 3.0 | 6.0 | 10.0 | 5.0 | **6.0** |
| watchdog (Python) | 9.0 | 7.0 | 8.0 | 8.0 | 8.0 | **7.9** |
| No watching | 10.0 | 10.0 | 5.0 | 10.0 | 0.0 | **7.0** |
| Git-based | 10.0 | 8.0 | 7.0 | 7.0 | 6.0 | **7.8** |

### Recommendation: notify crate (Rust)

**Rationale:**
- Best cross-platform solution with native backends
- Excellent performance and reliability
- Single unified API
- Handles platform differences transparently
- Can integrate with Rust process management backend
- Active development and community

**Implementation:**
- Use notify crate with recommended backend per platform
- Debouncing to reduce event noise
- Filter events by relevance (ignore .git internals, temp files)
- Async event stream integration

**Alternative:** Git-based watching as a simpler first implementation, can add full file watching later if needed.

---

## 6. Overall Architecture Decision Tree

### Evaluation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Total Implementation Effort | 25% | Overall migration complexity |
| Long-term Maintainability | 25% | Technical debt, updates, evolution |
| Performance | 15% | Overall system performance |
| User Experience | 15% | Quality of the final product |
| Risk | 10% | Technical risk and unknowns |
| Team Skill Match | 10% | Existing team expertise |

### Architecture Options

#### Option A: Full Swift with SwiftCrossUI
**Stack:**
- UI: SwiftCrossUI
- Backend: Swift (existing code)
- Process: Foundation Process (macOS/Linux)
- Config: JSON files
- Notifications: Platform-specific or hybrid
- File Watching: Platform-specific or notify via subprocess

**Pros:**
- Minimal code changes
- Leverage existing Swift expertise
- Keep current architecture
- Fastest time to initial cross-platform build

**Cons:**
- Immature UI framework (high risk)
- Limited to macOS + Linux
- May hit SwiftCrossUI limitations
- Breaking changes likely
- Small community

**Scoring:**
- Implementation Effort: 8/10
- Maintainability: 4/10
- Performance: 8/10
- User Experience: 6/10
- Risk: 3/10 (high risk)
- Skill Match: 10/10

**Weighted Score: 6.3/10**

#### Option B: Rust + Dear ImGui
**Stack:**
- UI: Dear ImGui (imgui-rs)
- Backend: Rust
- Process: tokio::process
- Config: confy crate
- Notifications: notify-rust
- File Watching: notify crate

**Pros:**
- Excellent cross-platform support (including Windows)
- Perfect for developer tools
- High performance
- Single language
- Strong ecosystem
- Great for real-time monitoring

**Cons:**
- Complete rewrite
- Team needs Rust expertise
- Different paradigm
- Initial learning curve
- Non-native UI appearance

**Scoring:**
- Implementation Effort: 3/10
- Maintainability: 9/10
- Performance: 10/10
- User Experience: 7/10
- Risk: 7/10
- Skill Match: 5/10

**Weighted Score: 6.4/10**

#### Option C: Qt C++ with Rust backend
**Stack:**
- UI: Qt C++ (QtWidgets or QtQuick)
- Backend: Rust (process, file watching, notifications)
- Process: Rust tokio
- Config: JSON via Rust
- Integration: C FFI

**Pros:**
- Best-in-class cross-platform UI
- Native appearance
- Mature and stable
- Clear separation of concerns
- Can leverage both ecosystems

**Cons:**
- Two languages
- FFI complexity
- Qt learning curve
- Licensing considerations
- More complex build

**Scoring:**
- Implementation Effort: 4/10
- Maintainability: 8/10
- Performance: 9/10
- User Experience: 9/10
- Risk: 7/10
- Skill Match: 6/10

**Weighted Score: 6.8/10**

#### Option D: Python Qt (PySide6) with Rust backend
**Stack:**
- UI: PySide6 (Qt for Python)
- Backend: Rust (via PyO3 or subprocess)
- Process: Rust or Python subprocess
- Config: JSON or Python configparser
- Notifications: notify-rust via PyO3

**Pros:**
- Rapid UI development
- Excellent Qt bindings
- Python's ease of use
- Good Rust integration options
- Large community

**Cons:**
- Python runtime dependency
- Performance overhead in UI
- GIL limitations
- Distribution complexity
- Two languages

**Scoring:**
- Implementation Effort: 6/10
- Maintainability: 7/10
- Performance: 7/10
- User Experience: 8/10
- Risk: 8/10
- Skill Match: 7/10

**Weighted Score: 7.0/10**

#### Option E: Tauri + React/Svelte
**Stack:**
- UI: React or Svelte
- Backend: Rust (Tauri backend)
- Process: Rust tokio
- Config: Tauri store
- Notifications: Tauri notifications
- File Watching: notify crate

**Pros:**
- Modern development experience
- Rich web ecosystem
- Good Rust integration
- Security model built-in
- Active community
- Good tooling

**Cons:**
- Webview-based (not native)
- Complete UI rewrite
- Different mental model
- Larger bundle
- Web technology stack

**Scoring:**
- Implementation Effort: 4/10
- Maintainability: 8/10
- Performance: 7/10
- User Experience: 6/10
- Risk: 8/10
- Skill Match: 6/10

**Weighted Score: 6.4/10**

#### Option F: Hybrid - Keep macOS native, add Linux Qt/ImGui
**Stack:**
- macOS: Keep current SwiftUI
- Linux: Qt C++ or Dear ImGui
- Shared: ACP protocol, business logic

**Pros:**
- Preserve excellent macOS experience
- Target Linux specifically
- No macOS user disruption
- Gradual migration

**Cons:**
- Two UI codebases
- Feature parity challenges
- Double maintenance
- More testing required

**Scoring:**
- Implementation Effort: 5/10
- Maintainability: 4/10
- Performance: 9/10
- User Experience: 9/10
- Risk: 6/10
- Skill Match: 7/10

**Weighted Score: 6.1/10**

### Decision Matrix Summary

| Architecture | Implementation | Maintainability | Performance | UX | Risk | Skill | **Total** |
|--------------|---------------|-----------------|-------------|-----|------|-------|-----------|
| Swift + SwiftCrossUI | 8.0 | 4.0 | 8.0 | 6.0 | 3.0 | 10.0 | **6.3** |
| Rust + ImGui | 3.0 | 9.0 | 10.0 | 7.0 | 7.0 | 5.0 | **6.4** |
| Qt C++ + Rust | 4.0 | 8.0 | 9.0 | 9.0 | 7.0 | 6.0 | **6.8** |
| Qt Python + Rust | 6.0 | 7.0 | 7.0 | 8.0 | 8.0 | 7.0 | **7.0** |
| Tauri + React | 4.0 | 8.0 | 7.0 | 6.0 | 8.0 | 6.0 | **6.4** |
| Hybrid Native | 5.0 | 4.0 | 9.0 | 9.0 | 6.0 | 7.0 | **6.1** |

---

## Final Recommendation: Qt Python (PySide6) + Rust Backend

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│                  PySide6 (Qt for Python)                     │
│  - Dashboard, Agent Views, Chat, Code Panel, Settings       │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              │ PyO3 FFI or subprocess IPC
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                     Backend Layer (Rust)                     │
│  - Process Management (tokio::process)                       │
│  - File Watching (notify crate)                              │
│  - Notifications (notify-rust)                               │
│  - ACP Client Implementation                                 │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                   Storage Layer (Rust/Python)                │
│  - Config: JSON files (confy or serde_json)                  │
│  - Session Storage: JSON                                     │
│  - Workspace State: JSON                                     │
└──────────────────────────────────────────────────────────────┘
```

### Why This Architecture Wins

**1. Best Balance of All Factors (7.0/10)**
- Strong in all categories, no critical weaknesses
- Manageable implementation effort
- Good long-term maintainability
- Excellent user experience with native Qt widgets

**2. Cross-Platform Excellence**
- Qt is the gold standard for cross-platform desktop apps
- Works identically on macOS, Linux, Windows
- Native look and feel per platform
- Comprehensive widget set

**3. Development Velocity**
- Python enables rapid UI development
- Qt Designer for visual layout
- Rich PySide6 documentation and examples
- Large community and ecosystem

**4. Performance Where It Matters**
- Rust backend for heavy lifting (process management, file I/O)
- Python fast enough for UI event handling
- Qt rendering is highly optimized
- Can optimize hot paths with Rust

**5. Safety and Reliability**
- Rust's safety guarantees for critical backend code
- Python's ease of debugging for UI logic
- Qt's proven stability

**6. Skill Acquisition**
- Python is easier to learn than C++ or Rust alone
- Qt has excellent learning resources
- Rust learning focused on backend only
- Gradual complexity curve

### Implementation Roadmap

#### Phase 1: Foundation (Weeks 1-2)
- Set up Rust backend library
  - Process management (tokio::process)
  - File watching (notify crate)
  - Configuration (JSON via serde)
- PyO3 bindings or subprocess IPC bridge
- Basic PySide6 application shell

#### Phase 2: Core UI (Weeks 3-6)
- Main window and navigation
- Dashboard view
- Sidebar with task/workspace list
- Settings panel
- Basic agent view

#### Phase 3: Agent Integration (Weeks 7-10)
- ACP client in Rust
- Chat panel UI
- Permission request dialogs
- Code/diff panel
- Terminal output view

#### Phase 4: Polish (Weeks 11-12)
- Notifications (hybrid approach)
- Keyboard shortcuts
- Themes (light/dark)
- Error handling and recovery
- Testing and bug fixes

#### Phase 5: Distribution (Weeks 13-14)
- Package for macOS (.app bundle)
- Package for Linux (.AppImage, .deb)
- Installation scripts
- Documentation
- Migration guide for users

### Technology Stack Details

**UI Framework: PySide6**
- Version: PySide6 6.x
- Widgets: QtWidgets for classic UI, QtQuick for modern
- Styling: QSS (Qt Style Sheets) for theming
- Layout: QVBoxLayout, QHBoxLayout, QSplitter

**Backend: Rust**
- Runtime: Tokio for async
- Process: tokio::process
- File watching: notify 6.x
- Notifications: notify-rust
- Config: serde_json
- ACP: Existing swift-sdk port to Rust

**Integration: PyO3 or Subprocess**
- PyO3 for tight integration (if team comfortable with FFI)
- Or: Rust binary communicating via JSON-RPC or similar
- Start with subprocess, optimize with PyO3 later if needed

**Configuration Storage**
- Format: JSON
- Location:
  - macOS: `~/Library/Application Support/KiroKantoku/`
  - Linux: `~/.config/kiro-kantoku/`
- Structure:
  ```
  config.json
  agent_configs/
  workspaces.json
  sessions/
  ```

**Build and Distribution**
- Build: PyInstaller or Briefcase
- macOS: .app bundle with py2app
- Linux: AppImage or system packages
- Single binary distribution with embedded Python

### Risk Mitigation

**Risk: Python distribution complexity**
- Mitigation: Use PyInstaller early, test on target platforms
- Fallback: Provide source distribution with pip install

**Risk: PyO3 FFI complexity**
- Mitigation: Start with subprocess IPC, add PyO3 optimization later
- Alternative: Keep subprocess if performance acceptable

**Risk: Qt licensing**
- Mitigation: LGPL license is acceptable for most use cases
- Alternative: Can switch to MIT-licensed Qt for Python if needed

**Risk: Team Rust learning curve**
- Mitigation: Backend is smaller surface area, focus learning there
- Support: Pair programming, code review, documentation

### Migration Path from Current Codebase

1. **Models (Low effort)**
   - Swift structs → Python dataclasses or Pydantic models
   - Mostly 1:1 translation
   - Keep same JSON serialization format

2. **Services (Moderate effort)**
   - AgentManager → Python class wrapping Rust backend
   - KiroClient → Rust implementation
   - GitService → Rust subprocess wrapper
   - TaskManager → Python orchestration layer

3. **Views (High effort)**
   - 57 SwiftUI views → PySide6 widgets
   - Layout translation: VStack → QVBoxLayout, etc.
   - State management: @State → Qt signals/slots
   - Preserve UI structure and flow

4. **Platform Integration (Moderate effort)**
   - UserDefaults → JSON config
   - UserNotifications → notify-rust + in-app toasts
   - FSEvents → notify crate
   - Process → tokio::process

### Success Metrics

- Week 4: Basic UI running on macOS and Linux
- Week 8: Can create agent and see chat
- Week 10: Feature parity with current macOS version
- Week 12: Alpha testing with users
- Week 14: Production release

### Alternative Recommendation: Rust + Dear ImGui

**If the team has strong Rust skills or wants to invest in Rust:**

The Rust + Dear ImGui approach (6.4/10) is a close second and has some compelling advantages:

**Pros:**
- Single language ecosystem
- Perfect aesthetic for developer tool
- Extremely high performance
- Simpler deployment (single binary)
- No FFI complexity

**Cons:**
- Steeper learning curve
- Complete rewrite required
- Non-native UI appearance

**When to choose this:**
- Team is committed to Rust
- Performance is critical
- Prefer single language
- Don't need native OS integration
- Developer tool aesthetic is acceptable

---

## Conclusion

The **Qt Python + Rust Backend** architecture provides the optimal balance of:
- ✅ Manageable migration effort (6/10)
- ✅ Strong long-term maintainability (7/10)
- ✅ Excellent user experience (8/10)
- ✅ Low risk (8/10)
- ✅ Good performance (7/10)
- ✅ Reasonable skill requirements (7/10)

This approach leverages the best tool for each job:
- **Python/Qt for UI**: Rapid development, native widgets, excellent UX
- **Rust for backend**: Safety, performance, cross-platform process management
- **JSON for config**: Simple, portable, debuggable
- **Hybrid notifications**: Best of both worlds

The migration can be executed in 3-4 months with a small team, with clear milestones and manageable risk.

### Next Steps

1. **Prototype**: Build a small proof-of-concept (1 week)
   - Basic PySide6 window
   - Rust backend with PyO3/subprocess
   - Single agent view
   - Validate the architecture

2. **Design**: Create detailed UI mockups (1 week)
   - Map existing SwiftUI views to Qt widgets
   - Define Python class structure
   - Plan state management approach

3. **Execute**: Follow the 14-week roadmap
   - Regular testing on all platforms
   - Weekly demos
   - Iterative refinement

4. **Deliver**: Package and distribute
   - macOS .app bundle
   - Linux AppImage
   - Migration guide
   - Release notes
