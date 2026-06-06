let csvData=[],csvHeaders=[],csvMode='mean',csvTail='two';
function initC9(){
  const zone=document.getElementById('uploadZone'),fileInput=document.getElementById('csvFile');
  zone.addEventListener('click',()=>fileInput.click());
  zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('drag');});
  zone.addEventListener('dragleave',()=>zone.classList.remove('drag'));
  zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('drag');const f=e.dataTransfer.files[0];if(f)parseCSV(f);});
  fileInput.addEventListener('change',()=>{if(fileInput.files[0])parseCSV(fileInput.files[0]);});
  document.querySelectorAll('#csvModeGroup .mode-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#csvModeGroup .mode-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');csvMode=btn.dataset.csvmode;
      document.getElementById('valueColGroup').style.display=csvMode==='mean'?'':'none';
      document.getElementById('successColGroup').style.display=csvMode==='proportion'?'':'none';
    });
  });
  document.querySelectorAll('#csvTailGroup .tail-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#csvTailGroup .tail-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');csvTail=btn.dataset.tail;
    });
  });
  const sl=document.getElementById('csvAlphaSlider'),bx=document.getElementById('csvAlphaBox');
  sl.addEventListener('input',()=>{bx.value=sl.value;});
  bx.addEventListener('input',()=>{sl.value=bx.value;});
  document.getElementById('runCsvBtn').addEventListener('click',runCsvTest);
}
function parseCSV(file){
  const reader=new FileReader();
  reader.onload=e=>{
    const lines=e.target.result.trim().split(/\r?\n/);
    csvHeaders=lines[0].split(',').map(h=>h.trim());
    csvData=lines.slice(1).map(line=>{
      const vals=line.split(',');const row={};
      csvHeaders.forEach((h,i)=>row[h]=(vals[i]||'').trim());return row;
    }).filter(row=>Object.values(row).some(v=>v!==''));
    populateCsvControls();showPreview();
  };
  reader.readAsText(file);
}
function populateCsvControls(){
  document.getElementById('csvControls').style.display='';
  ['groupColSelect','valueColSelect','successColSelect'].forEach(id=>{
    const sel=document.getElementById(id);
    sel.innerHTML=csvHeaders.map(h=>`<option value="${h}">${h}</option>`).join('');
  });
  if(csvHeaders.length>1){
    document.getElementById('valueColSelect').value=csvHeaders[csvHeaders.length-1];
    document.getElementById('successColSelect').value=csvHeaders[csvHeaders.length-1];
  }
  updateGroupOptions();
  document.getElementById('groupColSelect').addEventListener('change',updateGroupOptions);
}
function updateGroupOptions(){
  const groupCol=document.getElementById('groupColSelect').value;
  const groups=[...new Set(csvData.map(r=>r[groupCol]))].filter(Boolean);
  ['benchGroupSelect','testGroupSelect'].forEach((id,idx)=>{
    const sel=document.getElementById(id);
    sel.innerHTML=groups.map(g=>`<option value="${g}">${g}</option>`).join('');
    if(groups[idx])sel.value=groups[idx];
  });
}
function showPreview(){
  document.getElementById('csvPreviewCard').style.display='';
  const rows=csvData.slice(0,8);
  let html=`<table class="csv-table"><thead><tr>${csvHeaders.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>`;
  rows.forEach(row=>{html+=`<tr>${csvHeaders.map(h=>`<td>${row[h]}</td>`).join('')}</tr>`;});
  if(csvData.length>8)html+=`<tr><td colspan="${csvHeaders.length}" style="color:var(--text-dim);text-align:center;">… ${csvData.length-8} more rows</td></tr>`;
  html+='</tbody></table>';
  document.getElementById('csvPreview').innerHTML=html;
}
function runCsvTest(){
  const groupCol=document.getElementById('groupColSelect').value;
  const benchGroup=document.getElementById('benchGroupSelect').value;
  const testGroup=document.getElementById('testGroupSelect').value;
  const alpha=parseFloat(document.getElementById('csvAlphaBox').value)||0.05;
  const benchRows=csvData.filter(r=>r[groupCol]===benchGroup);
  const testRows=csvData.filter(r=>r[groupCol]===testGroup);
  if(!benchRows.length||!testRows.length){alert('Could not find rows for selected groups.');return;}
  let zStat,pValue,summaryHtml,resultsHtml;
  if(csvMode==='mean'){
    const valCol=document.getElementById('valueColSelect').value;
    const benchVals=benchRows.map(r=>parseFloat(r[valCol])).filter(v=>!isNaN(v));
    const testVals=testRows.map(r=>parseFloat(r[valCol])).filter(v=>!isNaN(v));
    if(!benchVals.length||!testVals.length){alert('No valid numeric values found.');return;}
    const bStats=summaryStats(benchVals),tStats=summaryStats(testVals);
    zStat=zStatMean(tStats.mean,bStats.mean,bStats.sd,tStats.n);
    pValue=calcPValue(zStat,csvTail);
    summaryHtml=buildSummaryHtml(benchGroup,bStats,testGroup,tStats,'mean');
  }else{
    const sucCol=document.getElementById('successColSelect').value;
    const benchBin=benchRows.map(r=>r[sucCol]),testBin=testRows.map(r=>r[sucCol]);
    const bStats=proportionStats(benchBin),tStats=proportionStats(testBin);
    zStat=zStatProp(tStats.phat,bStats.phat,tStats.n);
    pValue=calcPValue(zStat,csvTail);
    summaryHtml=buildSummaryHtml(benchGroup,bStats,testGroup,tStats,'proportion');
  }
  resultsHtml=buildResultsHtml(zStat,pValue,alpha);
  document.getElementById('summaryGrid').innerHTML=summaryHtml;
  document.getElementById('csvResultsGrid').innerHTML=resultsHtml;
  document.getElementById('csvGraphCard').style.display='';
  document.getElementById('csvResultsCard').style.display='';
  drawNormalCurve('csvCanvas',zStat,csvTail,alpha,pValue);
  const reject=pValue<alpha;
  const decisionBox=document.getElementById('csvDecisionBox');
  const decisionTitle=document.getElementById('csvDecisionTitle');
  const decisionText=document.getElementById('csvDecisionText');
  if(reject){
    decisionBox.className='decision-box reject';decisionTitle.textContent='✗  Reject H₀';decisionTitle.style.color='var(--reject)';
    decisionText.textContent=`p-value (${fmtP(pValue)}) < α (${fmt(alpha,2)}). Sufficient evidence to conclude that "${testGroup}" differs significantly from "${benchGroup}".`;
  }else{
    decisionBox.className='decision-box fail';decisionTitle.textContent='✓  Fail to Reject H₀';decisionTitle.style.color='var(--accent2)';
    decisionText.textContent=`p-value (${fmtP(pValue)}) ≥ α (${fmt(alpha,2)}). Not enough evidence to conclude that "${testGroup}" differs significantly from "${benchGroup}".`;
  }
}
function buildSummaryHtml(bName,bS,tName,tS,type){
  if(type==='mean'){
    const r=(l,v)=>`<div class="summary-stat"><span>${l}</span><strong>${fmt(v,3)}</strong></div>`;
    return`<div class="summary-group"><div class="summary-group-title">Benchmark: ${bName}</div>${r('n',bS.n)}${r('Mean',bS.mean)}${r('SD',bS.sd)}${r('Median',bS.median)}</div>
           <div class="summary-group"><div class="summary-group-title">Test: ${tName}</div>${r('n',tS.n)}${r('Mean',tS.mean)}${r('SD',tS.sd)}${r('Median',tS.median)}</div>`;
  }else{
    const r=(l,v)=>`<div class="summary-stat"><span>${l}</span><strong>${v}</strong></div>`;
    return`<div class="summary-group"><div class="summary-group-title">Benchmark: ${bName}</div>${r('n',bS.n)}${r('Successes',bS.successes)}${r('p̂',fmt(bS.phat,4))}</div>
           <div class="summary-group"><div class="summary-group-title">Test: ${tName}</div>${r('n',tS.n)}${r('Successes',tS.successes)}${r('p̂',fmt(tS.phat,4))}</div>`;
  }
}
function buildResultsHtml(zStat,pValue,alpha){
  const critVals=criticalValues(alpha,csvTail);
  return`<div class="result-item"><span class="result-label">Test Statistic (z)</span><span class="result-value">${fmt(zStat,4)}</span></div>
         <div class="result-item"><span class="result-label">P-value</span><span class="result-value">${fmtP(pValue)}</span></div>
         <div class="result-item"><span class="result-label">Critical Value(s)</span><span class="result-value" style="font-size:1rem;">${critVals.map(v=>fmt(v,3)).join(' / ')}</span></div>
         <div class="result-item"><span class="result-label">Alpha (α)</span><span class="result-value">${fmt(alpha,2)}</span></div>`;
}
