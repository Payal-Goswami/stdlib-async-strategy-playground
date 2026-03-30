# 🚀 stdlib Async Strategy Playground

Technical showcase developed for my **GSoC 2026 proposal (Idea #9: Asynchronous Utilities)**.

## 🔍 The Project
This demo compares three asynchronous execution strategies to justify the implementation of `mapLimit`, `eachLimit`, and `retry` within the `stdlib` ecosystem.

## 📊 Performance Results
Against a task set with a theoretical sum of **2000ms**:

| Strategy | Logic | Observed Time | Verdict |
| :--- | :--- | :--- | :--- |
| **Sequential** | `eachLimit(tasks, 1)` | **~2050ms** | Safest, but slow. |
| **Full Parallel** | `parallel()` | **~815ms** | Fastest, but resource-heavy. |
| **Limited** | `eachLimit(tasks, 2)` | **~1040ms** | **The Sweet Spot.** Controlled throughput. |

## 💡 Technical Highlights
- **Custom `eachLimit` Implementation**: Demonstrates core concurrency management logic.
- **Result Collection**: Includes a `mapLimit` prototype for data processing pipelines.

## ⚙️ Installation & Usage

1. **Clone and Install:**
   ```bash
   npm install
   npm start
