# MCP של MWS Deploy

MCP מרוחק ל**חשבון לקוח ב-MWS**. כמו Cloudflare / Vercel: הסוכן מדבר עם האחסון, הדומיינים, הטיקטים והחיוב *שלכם*. לא כלי חיפוש ציבורי.

- **כתובת באתר (בלי התקנה):** `https://app.mws.co.il/mcp`
- **תיעוד:** https://app.mws.co.il/docs/mcp
- **הריפו הזה (`npx`):** `npx -y github:mws-cloud/mws-mcp`
- **English:** [README.md](./README.md)

## מה הסוכן יכול

| תחום | דוגמאות |
| --- | --- |
| דיפלוי | רשימת אפליקציות, סטטוס, פריסה, לוג בנייה/ריצה, Rollback |
| GitHub | סטטוס, ריפו, **התקנת GitHub App בלחיצה** (`install_url`), אחרי זה פריסה פרטית |
| חיוב | חשבוניות, לינק `https://mws.co.il/go.php?c=inv{id}`, תוכניות, הצעת מחיר |
| הזמנות | הזמנה / שדרוג / ביטול רק אחרי `confirm=true`. **בלי סליקת כרטיס** |
| חשבון | פרופיל, אנשי קשר, יתרה |
| דומיינים | רשימה, נעילה, אנשי קשר, EPP, חידוש (חשבונית), NS |
| DNS / Cloudflare | רשימה / הוספה / עדכון / מחיקה, סטטוס CF |
| טיקטים | רשימה, קריאה, פתיחה, תשובה |
| וורדפרס / VPN / שותפים | אתרים, `wp_action`, SSO לפאנל |

כתיבה רק אחרי שהלקוח אמר כן (`confirm=true`). תשלום = לינק. לא מחייבים כרטיס.

## 1. מהאתר / כל סוכן (OAuth)

מדביקים כקונקטור MCP מרוחק. לוגין בדפדפן ל-MWS. **בלי טוקן.**

```
https://app.mws.co.il/mcp
```

קלוד, ChatGPT (Connectors), Cursor, Gemini, Copilot, Windsurf, VS Code.

ב-ChatGPT: הגדרות → Connectors → מוסיפים את הכתובת. אין פלאגין GPT נפרד.

## 2. Cursor

```json
{
  "mcpServers": {
    "mws": {
      "url": "https://app.mws.co.il/mcp"
    }
  }
}
```

## 3. מגיטהאב / stdio מקומי

לסוכן שרץ רק מקומית. טוקן מהפאנל (הגדרות): `mws_dk_…`.

```json
{
  "mcpServers": {
    "mws": {
      "command": "npx",
      "args": ["-y", "github:mws-cloud/mws-mcp"],
      "env": {
        "MWS_TOKEN": "mws_dk_YOUR_TOKEN",
        "MWS_API_URL": "https://app.mws.co.il"
      }
    }
  }
}
```

אותם כלים כמו הכתובת המרוחקת.

## GitHub פרטי

`mws_github_status` מחזיר `install_url` → לחיצה ב-GitHub. אחרי אישור הסוכן בודק עד `connected=true`. בלי כניסה נוספת לפאנל.

## רישיון

MIT
