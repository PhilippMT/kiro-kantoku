# Kiro Kantoku Cross-Platform Migration - Quick Reference

## TL;DR - Executive Decision

**Recommended Architecture: Qt Python + Rust Backend**
- **Score**: 7.0/10 (highest among all options)
- **Timeline**: 14 weeks
- **Risk**: Low
- **Team Size**: 2-3 developers

---

## Decision Summary

| Decision Point | Winner | Why? |
|---------------|--------|------|
| **UI Framework** | PySide6 (Qt) | Native widgets, mature ecosystem, rapid development |
| **Backend Language** | Rust | Safety, performance, excellent cross-platform support |
| **Process Management** | tokio::process | Async, cross-platform, battle-tested |
| **File Watching** | notify crate | Native backends (FSEvents/inotify), reliable |
| **Configuration** | JSON files | Simple, portable, human-readable |
| **Notifications** | Hybrid (in-app + notify-rust) | Best UX, works when focused or backgrounded |
| **Integration** | JSON-RPC over subprocess | Start simple, optimize with PyO3 later |

---

## Architecture Diagram

```
┌───────────────────────────────────────────┐
│         PySide6 (Qt for Python)           │  ← UI Layer
│  Dashboard • Agent View • Settings        │
└──────────────────┬────────────────────────┘
                   │
                   │ JSON-RPC IPC
                   │
┌──────────────────▼────────────────────────┐
│          Rust Backend                     │  ← Backend Layer
│  • tokio::process (subprocess mgmt)       │
│  • notify (file watching)                 │
│  • ACP client (agent protocol)            │
│  • notify-rust (notifications)            │
└──────────────────┬────────────────────────┘
                   │
┌──────────────────▼────────────────────────┐
│         JSON Configuration                │  ← Storage Layer
│  ~/.config/kiro-kantoku/config.json       │
└───────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Language**: Python 3.10+
- **UI Framework**: PySide6 6.x (Qt for Python)
- **Async**: asyncio + qasync
- **Testing**: pytest

### Backend
- **Language**: Rust (stable)
- **Runtime**: Tokio 1.x
- **Process**: tokio::process
- **File Watching**: notify 6.x
- **Notifications**: notify-rust
- **Config**: serde_json
- **Testing**: cargo test

### Integration
- **IPC**: JSON-RPC over stdin/stdout
- **Future**: PyO3 for performance-critical paths

---

## 14-Week Timeline

```
Week 1-2:   Foundation (Rust backend + Python shell)
Week 3-6:   Core UI (Sidebar, Dashboard, Settings)
Week 7-10:  Agent Integration (ACP client, Chat, Code panels)
Week 11-12: Polish (Notifications, Themes, Testing)
Week 13-14: Distribution (Packaging, Documentation, Release)
```

**Checkpoints:**
- Week 4: Can spawn process and see output
- Week 8: All UI panels implemented
- Week 10: Full agent interaction working
- Week 12: Feature parity achieved
- Week 14: Packages ready for distribution

---

## File Structure

```
kiro-kantoku/
├── backend/                    # Rust workspace
│   ├── kiro-process/          # Process management
│   ├── kiro-watcher/          # File watching
│   ├── kiro-acp/              # ACP client
│   ├── kiro-config/           # Configuration
│   └── kiro-bridge/           # Python IPC bridge
│
├── frontend/                   # Python application
│   ├── kiro_kantoku/
│   │   ├── ui/                # Qt widgets
│   │   │   ├── main_window.py
│   │   │   ├── sidebar.py
│   │   │   ├── dashboard.py
│   │   │   ├── agent_view.py
│   │   │   ├── chat_panel.py
│   │   │   ├── code_panel.py
│   │   │   └── settings.py
│   │   ├── models/            # Data models
│   │   │   ├── agent.py
│   │   │   ├── task.py
│   │   │   ├── workspace.py
│   │   │   └── config.py
│   │   ├── services/          # Business logic
│   │   │   ├── backend_bridge.py
│   │   │   ├── agent_manager.py
│   │   │   ├── task_manager.py
│   │   │   └── acp_service.py
│   │   └── main.py            # Entry point
│   ├── requirements.txt
│   └── setup.py
│
├── shared/                     # Shared schemas
│   └── schemas/
│
└── docs/                       # Documentation
    ├── MIGRATION_DECISION_TREES.md
    ├── MIGRATION_SUMMARY.md
    ├── MIGRATION_VISUAL_COMPARISON.md
    └── MIGRATION_IMPLEMENTATION_PLAN.md
```

---

## Key Code Snippets

### Rust Process Manager
```rust
// backend/kiro-process/src/lib.rs
use tokio::process::Command;

pub async fn spawn_kiro_cli(cwd: &str, args: Vec<String>) -> Result<Child> {
    Command::new("kiro-cli")
        .current_dir(cwd)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
}
```

### Python Qt Main Window
```python
# frontend/kiro_kantoku/ui/main_window.py
from PySide6.QtWidgets import QMainWindow, QSplitter

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Kiro Kantoku")

        splitter = QSplitter()
        splitter.addWidget(SidebarView())
        splitter.addWidget(AgentView())

        self.setCentralWidget(splitter)
```

### Python-Rust Bridge
```python
# frontend/kiro_kantoku/services/backend_bridge.py
import json
import asyncio

class BackendBridge:
    async def call(self, method: str, params: dict) -> dict:
        request = {"method": method, "params": params}
        self.process.stdin.write(json.dumps(request).encode() + b"\n")

        response = await self.process.stdout.readline()
        return json.loads(response)
```

---

## Migration Checklist

### Phase 1: Foundation ✓
- [ ] Set up Rust workspace
- [ ] Set up Python project
- [ ] Implement process manager (Rust)
- [ ] Implement file watcher (Rust)
- [ ] Create IPC bridge
- [ ] Test on macOS and Linux

### Phase 2: Core UI ✓
- [ ] Main window and menu bar
- [ ] Sidebar with task list
- [ ] Dashboard view
- [ ] Settings panel
- [ ] Port all data models to Python

### Phase 3: Agent Integration ✓
- [ ] Port ACP client to Rust
- [ ] Implement agent manager
- [ ] Chat panel with message display
- [ ] Permission request dialogs
- [ ] Code panel (files, diff, terminal)

### Phase 4: Polish ✓
- [ ] Notification system (hybrid)
- [ ] Theme support (light/dark)
- [ ] Keyboard shortcuts
- [ ] Error handling
- [ ] Unit and integration tests

### Phase 5: Distribution ✓
- [ ] macOS .app bundle
- [ ] Linux AppImage/.deb
- [ ] User documentation
- [ ] Migration guide
- [ ] Release announcement

---

## Common Commands

### Development

```bash
# Backend (Rust)
cd backend
cargo build --release
cargo test
cargo run --bin kiro-bridge

# Frontend (Python)
cd frontend
pip install -r requirements.txt
python main.py

# Run tests
pytest tests/
cargo test
```

### Packaging

```bash
# macOS
pyinstaller --windowed --name="Kiro Kantoku" frontend/main.py

# Linux
pyinstaller --onefile frontend/main.py
# Create AppImage from dist/

# Both
cd backend && cargo build --release
cp backend/target/release/kiro-bridge dist/
```

---

## Platform-Specific Notes

### macOS
- Config dir: `~/Library/Application Support/KiroKantoku/`
- Use py2app or PyInstaller for .app bundle
- Sign and notarize for distribution
- Test on macOS 12+

### Linux
- Config dir: `~/.config/kiro-kantoku/`
- Use AppImage for universal compatibility
- Create .deb for Debian/Ubuntu
- Test on Ubuntu 22.04+ and Fedora 38+

### Windows (Optional)
- Config dir: `%APPDATA%\KiroKantoku\`
- Use PyInstaller for .exe
- Use Inno Setup for installer
- Test on Windows 10/11

---

## Troubleshooting

### Issue: Python can't find Rust binary
**Solution**: Ensure kiro-bridge is in same directory as Python executable or in PATH

### Issue: Qt imports failing
**Solution**: Install PySide6: `pip install PySide6`

### Issue: Process not spawning
**Solution**: Check kiro-cli path is correct and executable

### Issue: File watcher not working
**Solution**: Verify notify crate backend for your platform is working

### Issue: High CPU usage
**Solution**: Check file watcher debouncing settings, reduce polling frequency

---

## Resources

### Documentation
- **Qt for Python**: https://doc.qt.io/qtforpython-6/
- **Rust Book**: https://doc.rust-lang.org/book/
- **Tokio Tutorial**: https://tokio.rs/tokio/tutorial
- **PyO3 Guide**: https://pyo3.rs/

### Example Projects
- **Qt Python Examples**: https://github.com/qt/pyside-pyside-setup/tree/dev/examples
- **Tauri** (for Rust patterns): https://github.com/tauri-apps/tauri
- **notify examples**: https://github.com/notify-rs/notify/tree/main/examples

### Community
- **Qt Forum**: https://forum.qt.io/
- **Rust Users**: https://users.rust-lang.org/
- **r/rust**: https://reddit.com/r/rust
- **r/learnpython**: https://reddit.com/r/learnpython

---

## FAQs

### Q: Why not SwiftCrossUI?
**A**: Too immature (0.x version), high risk of breaking changes and missing features.

### Q: Why not keep it macOS-only?
**A**: Linux is a primary target platform for developers, cross-platform support is essential.

### Q: Why Python instead of pure Rust?
**A**: Faster UI development, larger Qt ecosystem, easier to find developers. Rust handles performance-critical backend.

### Q: Can we add Windows support later?
**A**: Yes! The architecture supports it. Add Windows-specific testing and packaging.

### Q: What if PyO3 FFI is too complex?
**A**: Start with subprocess IPC (simpler), migrate to PyO3 only if performance requires it.

### Q: How big will the package be?
**A**: ~60MB (Python + Qt + Rust). Acceptable for a desktop developer tool.

### Q: Will it feel native?
**A**: Yes! Qt uses native widgets on each platform. It will look and feel native.

### Q: How do I migrate my existing data?
**A**: Migration script will export macOS UserDefaults to JSON format.

---

## Decision Comparison (Visual)

```
Score Comparison (out of 10)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Qt Python + Rust    █████████████████████ 7.0  ⭐ RECOMMENDED
Qt C++ + Rust       ███████████████████ 6.8
Rust + Dear ImGui   ██████████████████ 6.4
Tauri + React       ██████████████████ 6.4
Swift + SwiftCrossUI████████████████ 5.7
Hybrid Native       █████████████████ 6.1
```

**Qt Python + Rust wins on:**
- ✅ Balanced implementation effort
- ✅ Strong maintainability
- ✅ Excellent user experience
- ✅ Low risk
- ✅ Good performance (where it matters)

---

## Success Criteria

### Technical
- ✓ Runs on macOS 12+, Ubuntu 22.04+, Fedora 38+
- ✓ < 100MB package size
- ✓ < 2 second cold start
- ✓ 60fps UI performance
- ✓ Native look and feel

### Functional
- ✓ 100% feature parity with current macOS version
- ✓ All 57 views reimplemented
- ✓ ACP protocol fully working
- ✓ File watching on all platforms
- ✓ Notifications working

### User Experience
- ✓ Intuitive navigation
- ✓ Responsive UI (no blocking)
- ✓ Clear error messages
- ✓ Keyboard shortcuts preserved
- ✓ Settings migration from macOS

---

## Final Recommendation

**PROCEED with Qt Python + Rust Backend Architecture**

**Next Steps:**
1. ✅ Get team buy-in
2. ✅ Set up development environment
3. ✅ Build 1-week proof-of-concept
4. ✅ Review POC and commit to full migration
5. ✅ Execute 14-week implementation plan

**Timeline: 14 weeks to production-ready cross-platform application**

**Risk: LOW** (proven technologies, clear path forward)

**Reward: HIGH** (excellent UX, maintainable codebase, cross-platform support)

---

## Contact and Support

For questions during migration:
- **Rust**: Rust Users Forum, r/rust
- **Python/Qt**: Qt Forum, Stack Overflow
- **Architecture**: Review decision tree docs in this repo

**Good luck with the migration! 🚀**
