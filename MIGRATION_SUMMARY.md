# Kiro Kantoku Cross-Platform Migration - Executive Summary

## Quick Decision Matrix

### Overall Rankings

| Category | Winner | Score | Runner-Up | Score |
|----------|--------|-------|-----------|-------|
| **UI Framework** | Qt (C++ or Python) | 6.5/10 | Dear ImGui | 6.5/10 |
| **Process Management** | Rust subprocess | 8.0/10 | Python subprocess* | 8.6/10 |
| **Configuration** | JSON files | 8.6/10 | confy (Rust)* | 8.7/10 |
| **Notifications** | Hybrid approach | 8.5/10 | notify-rust | 8.4/10 |
| **File Watching** | notify (Rust) | 8.8/10 | Platform-specific | 7.9/10 |
| **Architecture** | Qt Python + Rust | 7.0/10 | Rust + ImGui | 6.4/10 |

*Conditional on language choice

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Kiro Kantoku (Cross-Platform)              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        UI LAYER                              │
│                                                              │
│                  PySide6 (Qt for Python)                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │  Agent View  │  │   Settings   │      │
│  │              │  │              │  │              │      │
│  │  • Tasks     │  │  • Chat      │  │  • Config    │      │
│  │  • Agents    │  │  • Code      │  │  • Profiles  │      │
│  │  • Activity  │  │  • Terminal  │  │  • Prefs     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  Native Qt widgets, cross-platform, native look & feel      │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ PyO3 FFI or JSON-RPC IPC
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                     BACKEND LAYER (Rust)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Process Manager (tokio::process)                    │   │
│  │  • kiro-cli subprocess lifecycle                     │   │
│  │  • stdout/stderr streaming                           │   │
│  │  • Signal handling (SIGTERM, SIGKILL)               │   │
│  │  • Environment management                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  File Watcher (notify crate)                         │   │
│  │  • Recursive directory watching                      │   │
│  │  • Debounced events                                  │   │
│  │  • Platform-native backends (FSEvents/inotify/etc)   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ACP Client                                          │   │
│  │  • Agent Control Protocol implementation             │   │
│  │  • Session management                                │   │
│  │  • Permission requests                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Notification Manager (notify-rust)                  │   │
│  │  • Native system notifications                       │   │
│  │  • Cross-platform (macOS/Linux/Windows)             │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                     STORAGE LAYER                            │
│                                                              │
│  Platform Config Directories:                               │
│  • macOS: ~/Library/Application Support/KiroKantoku/        │
│  • Linux: ~/.config/kiro-kantoku/                           │
│                                                              │
│  Files:                                                      │
│  ├── config.json              # App settings                │
│  ├── workspaces.json          # Workspace state             │
│  ├── agent_configs/           # Agent profiles              │
│  │   ├── default.json                                       │
│  │   └── custom1.json                                       │
│  └── sessions/                # Session history             │
│      └── <session-id>.json                                  │
│                                                              │
│  Format: JSON (human-readable, versionable, portable)       │
└──────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Components

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **UI Framework** | PySide6 (Qt 6.x) | Native widgets, excellent cross-platform support, rapid development |
| **Backend Runtime** | Rust + Tokio | Safety, performance, async process management |
| **Process Management** | tokio::process | Cross-platform subprocess with async/await |
| **File Watching** | notify crate | Native backends (FSEvents/inotify), debouncing, reliability |
| **Notifications** | notify-rust + in-app toasts | Hybrid: native when backgrounded, in-app when focused |
| **Configuration** | JSON files (serde_json) | Simple, portable, debuggable, human-readable |
| **ACP Client** | Rust port of swift-sdk | Type-safe protocol implementation |
| **Integration** | PyO3 or subprocess IPC | Python-Rust bridge (start simple, optimize later) |

### Build and Distribution

| Platform | Package Format | Tool |
|----------|---------------|------|
| macOS | .app bundle | py2app or PyInstaller |
| Linux | AppImage, .deb | PyInstaller, fpm |
| Windows | .exe installer | PyInstaller, Inno Setup |

## Migration Effort Breakdown

### Estimated Timeline: 14 Weeks

#### Phase 1: Foundation (2 weeks)
- [ ] Set up Rust workspace with backend modules
- [ ] Implement process manager (tokio::process)
- [ ] Implement file watcher (notify crate)
- [ ] Implement config storage (JSON)
- [ ] Create PyO3 bindings or IPC protocol
- [ ] Basic PySide6 application shell

#### Phase 2: Core UI (4 weeks)
- [ ] Main window and menu bar
- [ ] Sidebar navigation (workspaces, tasks)
- [ ] Dashboard view
- [ ] Settings panel
- [ ] Basic agent view layout
- [ ] State management (Qt signals/slots)

#### Phase 3: Agent Integration (4 weeks)
- [ ] Port ACP client to Rust
- [ ] Chat panel with message history
- [ ] Permission request dialogs
- [ ] Code/diff viewer panel
- [ ] Terminal output view
- [ ] Agent status indicators
- [ ] Skill discovery and display

#### Phase 4: Polish (2 weeks)
- [ ] Notification system (hybrid approach)
- [ ] Keyboard shortcuts
- [ ] Theme support (light/dark)
- [ ] Error handling and recovery
- [ ] Loading states and progress indicators
- [ ] Testing (unit, integration, E2E)

#### Phase 5: Distribution (2 weeks)
- [ ] Package for macOS (.app)
- [ ] Package for Linux (AppImage, .deb)
- [ ] Installation instructions
- [ ] User migration guide
- [ ] Documentation
- [ ] Release announcement

## Code Migration Map

### Models (Low effort - mostly 1:1 translation)

| Swift File | Python Equivalent | Effort |
|-----------|------------------|--------|
| AppSettings.swift | app_settings.py (dataclass) | Low |
| Agent.swift | agent.py | Low |
| AgentTask.swift | agent_task.py | Low |
| Workspace.swift | workspace.py | Low |
| ChatMessage.swift | chat_message.py | Low |
| GitRepository.swift | git_repository.py | Low |

### Services (Moderate effort - rewrite in Rust/Python)

| Swift File | New Implementation | Effort |
|-----------|-------------------|--------|
| KiroClient.swift | Rust ACP client | High |
| AgentManager.swift | Python wrapper + Rust backend | Moderate |
| TaskManager.swift | Python orchestration layer | Moderate |
| FileWatcher.swift | Rust notify crate | Low |
| NotificationManager.swift | Rust notify-rust + Python | Moderate |
| GitService.swift | Rust subprocess wrapper | Moderate |

### Views (High effort - redesign in Qt)

| SwiftUI Component | Qt Equivalent | Notes |
|------------------|--------------|-------|
| VStack, HStack | QVBoxLayout, QHBoxLayout | Similar layout concepts |
| List | QListView / QTableView | Qt provides powerful list widgets |
| TextField | QLineEdit | Similar functionality |
| TextEditor | QTextEdit / QPlainTextEdit | Rich text support |
| Button | QPushButton | Direct equivalent |
| @State, @Observable | Qt Signals/Slots | Different pattern, well-documented |
| NavigationSplitView | QSplitter | Resizable split panes |
| Sheet | QDialog | Modal dialogs |

### View Count: 57 SwiftUI files → ~40-45 Qt widgets/views
(Some views can be combined, Qt has more reusable components)

## Key Technical Decisions

### Decision 1: Why Qt Python over SwiftCrossUI?
- **Risk mitigation**: Qt is proven, SwiftCrossUI is experimental (0.x)
- **Ecosystem**: Qt has decades of development, comprehensive docs
- **Features**: Qt supports all needed UI components
- **Community**: Large community, many examples
- **Trade-off**: Complete rewrite, but lower long-term risk

### Decision 2: Why Rust backend over pure Python?
- **Performance**: Critical for process management, file watching
- **Safety**: Rust prevents many classes of bugs
- **Async**: Tokio provides excellent async runtime
- **Cross-platform**: Rust's ecosystem is very cross-platform friendly
- **Trade-off**: Additional language, but isolated to backend

### Decision 3: Why JSON over SQLite/TOML?
- **Simplicity**: Easy to read, write, debug
- **Portability**: Universal format
- **Human-editable**: Users can manually fix config if needed
- **Versioning**: Can track in git for user config templates
- **Trade-off**: No transactions, but config writes are infrequent

### Decision 4: Why hybrid notifications?
- **UX**: Best of both worlds - in-app when focused, native when not
- **Flexibility**: User can disable native if preferred
- **Graceful degradation**: Works even if native unavailable
- **Trade-off**: Two notification paths, but isolated logic

### Decision 5: Why PyO3/subprocess over embedded Python in Rust?
- **Simplicity**: Easier to start with subprocess, optimize later
- **Debugging**: Clearer separation during development
- **Flexibility**: Can switch to PyO3 without major refactor
- **Trade-off**: IPC overhead, but negligible for this use case

## Risk Assessment

### High Risk
- ✅ **MITIGATED**: Qt licensing → Using LGPL license (acceptable)
- ✅ **MITIGATED**: Python distribution → PyInstaller tested early

### Medium Risk
- ⚠️ **MONITOR**: PyO3 FFI complexity → Start with subprocess
- ⚠️ **MONITOR**: Team Rust learning curve → Focus backend only
- ⚠️ **MONITOR**: Qt learning curve → Excellent documentation available

### Low Risk
- ✓ Cross-platform file paths → Use pathlib/std::path
- ✓ Platform-specific styling → Qt handles automatically
- ✓ Configuration migration → JSON import script

## Success Criteria

### Technical
- ✅ Runs on macOS 12+, Ubuntu 22.04+, Fedora 38+
- ✅ Single binary distribution (with embedded Python)
- ✅ < 100MB package size
- ✅ < 2 second cold start time
- ✅ Native look and feel on each platform

### Functional
- ✅ 100% feature parity with current macOS version
- ✅ All 57 views/panels reimplemented
- ✅ ACP protocol fully functional
- ✅ Notifications working (hybrid approach)
- ✅ File watching working on all platforms

### User Experience
- ✅ Smooth performance (60fps UI)
- ✅ Responsive (no UI blocking)
- ✅ Clear error messages
- ✅ Keyboard shortcuts preserved
- ✅ Settings migration from macOS version

## Why This Beats Alternatives

### vs. SwiftCrossUI
- ✅ Lower risk (mature vs. experimental)
- ✅ Better documentation
- ✅ Larger community
- ✅ More features
- ❌ Requires rewrite (but safer long-term)

### vs. Tauri + React
- ✅ Native widgets (not webview)
- ✅ Better for developer tools (terminal, code views)
- ✅ Lower resource usage
- ✅ More native feel
- ❌ Smaller web ecosystem (but Qt ecosystem is large)

### vs. Rust + Dear ImGui
- ✅ Native OS integration
- ✅ Easier team adoption (Python)
- ✅ Faster UI development
- ❌ Lower raw performance (but sufficient)
- ❌ Larger bundle size

### vs. Native per platform
- ✅ 1/3 the implementation work
- ✅ 1/3 the maintenance
- ✅ Single codebase
- ❌ Slightly less native (but Qt is 95% native)

## Next Steps

### Week 1: Proof of Concept
1. Create basic PySide6 window
2. Implement Rust process manager
3. Set up PyO3 or subprocess IPC
4. Display output from a kiro-cli subprocess
5. Verify on macOS and Linux

### Week 2: Architecture Validation
1. Implement file watcher
2. Implement config storage
3. Test notification delivery
4. Build comprehensive error handling
5. Performance profiling

### Week 3-14: Full Implementation
Follow the 5-phase roadmap in the detailed decision tree document.

## Resources

### Learning Resources
- **Qt for Python**: https://doc.qt.io/qtforpython-6/
- **Rust Book**: https://doc.rust-lang.org/book/
- **Tokio**: https://tokio.rs/
- **PyO3**: https://pyo3.rs/
- **notify crate**: https://docs.rs/notify/

### Example Projects
- **PyQt apps**: https://github.com/topics/pyqt6
- **Tauri apps** (for Rust backend patterns): https://github.com/tauri-apps/tauri
- **ACP clients**: https://github.com/aptove/swift-sdk

### Community
- **Qt Forum**: https://forum.qt.io/
- **Rust Users Forum**: https://users.rust-lang.org/
- **r/rust**: https://reddit.com/r/rust
- **r/Python**: https://reddit.com/r/Python

## Conclusion

The **Qt Python + Rust Backend** architecture provides:
- ✅ Manageable 14-week migration timeline
- ✅ Strong technical foundation
- ✅ Excellent user experience
- ✅ Low risk
- ✅ Long-term maintainability
- ✅ Full cross-platform support (macOS, Linux, Windows)

This approach balances implementation effort with quality results, leveraging the best tool for each layer while maintaining a cohesive architecture.

**Recommendation: Proceed with Qt Python + Rust Backend architecture.**
