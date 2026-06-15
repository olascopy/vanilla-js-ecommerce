
const columns = [["date", "Date", true], ["gb_no", "GB No", true], ["tracking", "Tracking", false], ["total_ctns", "Total Ctns", true], ["total_kg", "Total Kg", true], ["yaba_ctns", "Yaba Ctns", false], ["yaba_kg", "Yaba Kg", false], ["trade_fair_ctns", "Trade Fair Ctns", true], ["trade_fair_kg", "Trade Fair Kg", true], ["main_market_ctns", "Main Market Ctns", false], ["main_market_kg", "Main Market Kg", false], ["mandelas_ctns", "Mandelas Ctns", true], ["mandelas_kg", "Mandelas Kg", true], ["arena_ctns", "Arena Ctns", false], ["arena_kg", "Arena Kg", false], ["gbajumo_ctns", "Gbajumo Ctns", true], ["gbajumo_kg", "Gbajumo Kg", true], ["ochanja_ctns", "Ochanja Ctns", false], ["ochanja_kg", "Ochanja Kg", false]];
const checks = document.getElementById("checks");
columns.forEach(c => { checks.innerHTML += `<label><input type="checkbox" value="${c[0]}" ${c[2] ? "checked" : ""}>${c[1]}</label>` });
let rows = [];
function getSelected() { return [...document.querySelectorAll("input[type=checkbox]:checked")].map(x => x.value) }
function cleanNum(n) { return parseFloat(String(n || '0').replace(/,/g, '')) || 0 }

function parseMarkets(text, row) { const map = [["yaba", "yaba"], ["trade fair", "trade_fair"], ["main market", "main_market"], ["mandelas", "mandelas"], ["arena", "arena"], ["gbajumo", "gbajumo"], ["ochanja", "ochanja"]]; map.forEach(m => { row[m[1] + "_ctns"] = 0; row[m[1] + "_kg"] = 0 }); const inside = text.match(/\((.*?)\)/gs); if (!inside) return; inside.forEach(part => { map.forEach(m => { const rg = new RegExp(m[0].replace(/ /g, "\\s*") + "[^\\d]*(\\d[\\d,]*)\\s*ctns?[^\\d]*(\\d[\\d,]*)\\s*kg", "i"); const f = part.match(rg); if (f) { row[m[1] + "_ctns"] = f[1]; row[m[1] + "_kg"] = f[2] } }) }); }

document.getElementById("pasteBtn").onclick = async () => {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById("txt").value = text;
    } catch (err) {
        alert("Allow clipboard permission, then try again");
    }
};

document.getElementById("parseBtn").onclick = () => { const txt = document.getElementById("txt").value.trim(); rows = []; const dateBlocks = txt.split(/(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/g); for (let i = 1; i < dateBlocks.length; i += 2) { let currentDate = dateBlocks[i]; let blockContent = dateBlocks[i + 1] || ''; const lines = blockContent.split(/\r?\n/); const blocks = []; let current = ""; lines.forEach(line => { if (/^gb\s*\d+/i.test(line.trim())) { if (current.trim()) blocks.push(current); current = line + "\n" } else { current += line + "\n" } }); if (current.trim()) blocks.push(current); blocks.forEach(b => { const row = {}; row.date = currentDate; const gb = b.match(/gb\s*(\d+)/i); row.gb_no = gb ? 'GB' + gb[1] : ""; const tr = b.match(/\b\d{3}-\d+\b/); row.tracking = tr ? tr[0] : ""; const ctn = b.match(/(\d[\d,]*)\s*ctns?/i); row.total_ctns = ctn ? ctn[1] : 0; const kg = b.match(/(\d[\d,]*)\s*kg/i); row.total_kg = kg ? kg[1] : 0; parseMarkets(b, row); rows.push(row) }) } if (rows.length == 0) { alert('No GB rows found under dates'); return } document.getElementById("exportTitle").innerText = document.getElementById("tableTitle").value || "Table Result"; render() };

function render() { const selected = getSelected(); const table = document.getElementById("table"); if (!rows.length) { table.innerHTML = ""; return } let html = "<thead><tr>"; selected.forEach(c => { const obj = columns.find(x => x[0] === c); html += "<th>" + obj[1] + "</th>" }); html += "</tr></thead><tbody>"; rows.forEach(r => { html += "<tr>"; selected.forEach(c => { html += "<td>" + (r[c] ?? 0) + "</td>" }); html += "</tr>" }); let totalRow = '<tr class="total-row"><td>TOTAL</td>'; selected.slice(1).forEach(c => { if (c.includes('ctns') || c.includes('kg')) { let sum = rows.reduce((a, r) => a + cleanNum(r[c]), 0); totalRow += `<td>${sum.toLocaleString()}</td>` } else { totalRow += `<td>-</td>` } }); totalRow += '</tr></tbody>'; html += totalRow; table.innerHTML = html }

// CSV ONLY - No XLS
document.getElementById("csvBtn").onclick = () => { if (!rows.length) { alert("Build table first"); return } const selected = getSelected(); let csv = selected.map(c => columns.find(x => x[0] === c)[1]).join(",") + "\n"; rows.forEach(r => { csv += selected.map(c => '"' + String(r[c] ?? 0).replace(/"/g, '""') + '"').join(",") + "\n" }); let totals = selected.map((c, i) => { if (i == 0) return 'TOTAL'; if (c.includes('ctns') || c.includes('kg')) { return rows.reduce((a, r) => a + cleanNum(r[c]), 0) } return '' }).join(','); csv += totals; const blob = new Blob([csv], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = (document.getElementById("tableTitle").value || "waybills") + ".csv"; a.click() }

document.getElementById("pdfBtn").onclick = () => {
    if (!rows.length) { alert("Build table first"); return }
    document.getElementById("exportTitle").innerText = document.getElementById("tableTitle").value || "Table Result";
    window.print();
}

// Image always wide
document.getElementById("imgBtn").onclick = () => {
    const selected = getSelected();
    if (!rows.length) { alert("Build table first"); return }

    let cellW = 170, cellH = 40, pad = 25;
    let cols = selected.length, rowsCount = rows.length + 2;
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    canvas.width = cols * cellW + pad * 2;
    canvas.height = rowsCount * cellH + pad * 2 + 70;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 26px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(document.getElementById("exportTitle").innerText, canvas.width / 2, 40);

    for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < cols; c++) {
            let x = pad + c * cellW;
            let y = pad + 70 + r * cellH;
            let val = '';

            if (r == 0) {
                val = columns.find(x => x[0] === selected[c])[1];
                ctx.fillStyle = '#00c853';
                ctx.fillRect(x, y, cellW, cellH);
                ctx.fillStyle = '#ffffff';
            } else if (r == rowsCount - 1) {
                val = c == 0 ? 'TOTAL' : (selected[c].includes('ctns') || selected[c].includes('kg') ? rows.reduce((a, row) => a + cleanNum(row[selected[c]]), 0).toLocaleString() : '-');
                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(x, y, cellW, cellH);
                ctx.fillStyle = '#00e676';
            } else {
                val = rows[r - 1][selected[c]];
                ctx.fillStyle = r % 2 == 0 ? '#f8f8f8' : '#ffffff';
                ctx.fillRect(x, y, cellW, cellH);
                ctx.fillStyle = '#000';
            }

            ctx.strokeStyle = '#cccccc';
            ctx.strokeRect(x, y, cellW, cellH);

            ctx.font = r == rowsCount - 1 ? 'bold 18px Arial' : 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(val, x + cellW / 2, y + cellH / 2 + 6);
        }
    }

    let link = document.createElement('a');
    link.download = (document.getElementById("tableTitle").value || "waybills") + ".png";
    link.href = canvas.toDataURL('image/png');
    link.click();
};
