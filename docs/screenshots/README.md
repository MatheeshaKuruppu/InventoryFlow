# Screenshots

Drop your application screenshots in this folder using these exact filenames so
the links in the main project [README](../../README.md) resolve automatically:

| Filename | Page to capture |
| --- | --- |
| `dashboard.png` | Dashboard — KPI cards + charts (try light mode) |
| `products.png` | Products — table with search/filters visible |
| `categories.png` | Categories — the category cards grid |
| `stock.png` | Stock — operations table or the History tab |
| `settings.png` | Settings — ideally in **dark mode** to show theming |

## How to capture (Windows)

1. Make sure the dev server is running (`npm run dev`) and open
   <http://localhost:5173>.
2. Use **Win + Shift + S** (Snipping Tool) to capture each page, or press
   **F11** for a clean full-screen view first.
3. Save each image into this folder with the matching filename above.
4. Recommended width: ~1440px for crisp, readable screenshots.

Once the files are here, commit and push:

```bash
git add docs/screenshots
git commit -m "docs: add application screenshots"
git push
```
