# ⚡ @shridey/transformer

**The "God Mode" Data Pipeline for TypeScript.**

A strictly typed, lazy-evaluated transformation library designed to bridge the gap between messy API responses and clean application state. Whether you are munging data for business logic or preparing complex datasets for **Chart.js**, **Nivo**, or **Recharts**, this is your all-in-one toolkit.

[![npm version](https://img.shields.io/npm/v/@shridey/transformer.svg?style=flat)](https://www.npmjs.com/package/@shridey/transformer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](http://www.typescriptlang.org/)

---

## 🚀 Why this? The Impact.

Most developers write the same fragile `map` / `filter` / `reduce` chains over and over again. When data gets complex (nested arrays, conditional summing, dynamic grouping), code becomes unreadable and slow.

**@shridey/transformer** changes the game:

1.  **⚡ Lazy Evaluation:** We use Generators. If you have 10,000 items but only need the top 5, we only process 5. No massive intermediate arrays.
2.  **🔒 Strict Typing:** If you typo a key, your build fails. If you change a schema, you know exactly what breaks.
3.  **🧠 The "Accessor" System:** Every method accepts either a **String Key** (`'price'`) OR a **Function** (`item => item.price * 1.2`).
4.  **📊 Visualization Ready:** Stop fighting with Chart.js config structures. We have pre-built "Collectors" that output exactly what charting libraries need.

---

## 📦 Installation

```bash
npm install @shridey/transformer

```

---

## 🛠️ Usage: The "All-Rounder"

This library isn't just for charts. It's for any time you touch an array.

### Scenario 1: Day-to-Day Data Munging

_Cleaning API responses, calculating totals, and reshaping objects._

```typescript
import { LazyPipeline, Aggregate, Sort } from "@shridey/transformer";

const rawUsers = [
  { id: 1, name: "Alice", role: "admin", meta: { loginCount: 50 } },
  { id: 2, name: "Bob", role: "user", meta: { loginCount: 12 } },
  { id: 3, name: "Charlie", role: "user", meta: { loginCount: 0 } },
];

const report = LazyPipeline.from(rawUsers)
  // 1. Filter: Clean logic
  .filter((u) => u.role === "user")

  // 2. Sort: Use helper or function
  .sort(Sort.desc((u) => u.meta.loginCount))

  // 3. Reshape: Pick exactly what you need
  .reshape({
    username: (u) => u.name,
    activityScore: (u) => u.meta.loginCount * 10,
    status: (u) => (u.meta.loginCount > 0 ? "Active" : "Inactive"),
  })
  .execute();

// Result:
// [
//   { username: 'Bob', activityScore: 120, status: 'Active' },
//   { username: 'Charlie', activityScore: 0, status: 'Inactive' }
// ]
```

---

### Scenario 2: The Visualization Hero

_Turning nested data (Users -> Orders -> Products) into a Chart.js Bar Chart._

```typescript
import { LazyPipeline, Aggregate } from "@shridey/transformer";
import { ToChartJsBar } from "@shridey/transformer/collectors";

// Complex nested source
const pipeline = LazyPipeline.from(users)
  .flatMap((user) => user.orders) // Unwind orders
  .filter((order) => order.isPaid) // Keep paid only
  .flatMap((order) => order.products) // Unwind products
  .groupBy("category") // Group by Category
  .reshape({
    category: (g) => g.key,
    revenue: (g) => Aggregate.sum("price", g.items),
    avgPrice: (g) => Aggregate.avg("price", g.items),
  });

// Zero-Config Chart Output
const chartConfig = pipeline.collect(
  ToChartJsBar({
    labelKey: "category",
    datasets: [
      {
        label: "Total Revenue",
        dataKey: "revenue",
        backgroundColor: "blue",
      },
      {
        label: "Avg Item Price",
        dataKey: "avgPrice",
        // Dynamic color based on data!
        backgroundColor: (item) => (item.avgPrice > 50 ? "red" : "green"),
      },
    ],
  })
);
```

---

## 📚 Core API

### `LazyPipeline<T>`

The engine of the library. It wraps your array and prepares it for transformation.

| Method                       | Description                                                                         | Example                           |
| ---------------------------- | ----------------------------------------------------------------------------------- | --------------------------------- |
| **`.filter(predicate)`**     | Keeps items matching the condition.                                                 | `.filter(x => x.active)`          |
| **`.flatMap(selector)`**     | Unwinds nested arrays into a flat stream.                                           | `.flatMap(u => u.orders)`         |
| **`.groupBy(accessor)`**     | Groups items. Returns `{ key, items[] }`.                                           | `.groupBy('status')`              |
| **`.reshape(schema)`**       | **The Powerhouse.** Transforms objects into a new shape defined by a key-value map. | `.reshape({ name: u => u.id })`   |
| **`.sort(comparator)`**      | Sorts the stream (buffers data).                                                    | `.sort(Sort.asc('date'))`         |
| **`.take(n)`**               | **Lazy.** Stops processing after `n` items found.                                   | `.take(5)`                        |
| **`.reduce(reducer, init)`** | **Terminal.** Reduces stream to a single value.                                     | `.reduce((acc, x) => acc + x, 0)` |
| **`.collect(collector)`**    | **Terminal.** Ends the pipeline and runs a formatter.                               | `.collect(ToChartJsBar(...))`     |
| **`.execute()`**             | **Terminal.** Returns the final array `T[]`.                                        | `.execute()`                      |

### `Helpers`

Utility functions to save you time. Import them from the root.

#### `Aggregate`

- `sum(accessor, items)`
- `avg(accessor, items)`
- `count(items)`
- `max(accessor, items)` / `min(accessor, items)` (Safe for large arrays)
- `sumIf(accessor, items, predicate)`

#### `Sort`

- `asc(accessor)`
- `desc(accessor)`

#### `Filter`

- `eq(accessor, value)`
- `gt(accessor, value)` / `lt`
- `includes(accessor, value)`

---

## 📊 Chart Collectors (Visualizations)

Stop writing spaghetti code to format data for libraries. Import collectors from `@shridey/transformer/collectors`.

### 1. Chart.js

Supported: `ToChartJsBar`, `ToChartJsLine`, `ToChartJsPie`, `ToChartJsScatter`.

```typescript
pipeline.collect(
  ToChartJsBar({
    labelKey: "month",
    datasets: [
      {
        label: "Sales",
        dataKey: "amount",
        // Supports static string, array, or function
        backgroundColor: (d) => (d.amount > 100 ? "#4caf50" : "#f44336"),
      },
    ],
  })
);
```

### 2. Nivo

Supported: `ToNivoBar`, `ToNivoLine`, `ToNivoPie`, `ToNivoScatter`.
_Handles Nivo's specific needs (nested `data` arrays for lines, flat objects for bars)._

```typescript
pipeline.collect(
  ToNivoLine({
    xKey: "date",
    lines: [
      { id: "Revenue", dataKey: "revenue" },
      { id: "Costs", dataKey: "costs" },
    ],
  })
);
```

### 3. Recharts

Supported: `ToRechartsLine`, `ToRechartsBar`, `ToRechartsPie`, `ToRechartsScatter`.
_Automatically remaps keys to Recharts-friendly structures while preserving your original data in `payload` for custom tooltips._

```typescript
pipeline.collect(
  ToRechartsLine({
    xAxisKey: "timestamp",
    lines: [
      { dataKey: "seriesA", accessor: "valueA" },
      { dataKey: "seriesB", accessor: (item) => item.valueB * 100 },
    ],
  })
);
```

---

## ⚡ Performance Note

If you have an array of 1,000,000 items:

```typescript
// STANDARD JS (Slow)
// Loops 1M times to map, then 1M times to filter, then creates a huge new array
data.map(expensiveFn).filter(condition).slice(0, 5);

// TRANSFORMER (Fast)
// Processes item 1 -> map -> filter -> keep
// ... repeats until 5 items are found
// Stops instantly.
LazyPipeline.from(data).map(expensiveFn).filter(condition).take(5).execute();
```

## 📄 License

MIT © [Shridhar Pandey](https://github.com/shridey)
