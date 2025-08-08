// OBJ2Desmos UI logic

document.addEventListener('DOMContentLoaded', function() {
  const dropArea = document.getElementById('drop-area');
  const fileElem = document.getElementById('fileElem');
  const fileSelect = document.getElementById('fileSelect');
  const objText = document.getElementById('objText');
  const convertBtn = document.getElementById('convertBtn');
  const realtimeCheckbox = document.getElementById('realtimeCheckbox');
  const vertexOutput = document.getElementById('vertexOutput');
  const edgeOutput = document.getElementById('edgeOutput');
  const faceOutput = document.getElementById('faceOutput');

  // ファイル選択ボタン
  fileSelect.addEventListener('click', () => fileElem.click());

  // ファイル選択
  fileElem.addEventListener('change', handleFiles);

  // ドラッグ＆ドロップ
  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
  });
  dropArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
  });
  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      fileElem.files = e.dataTransfer.files;
      handleFiles();
    }
  });

  function handleFiles() {
    const file = fileElem.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      objText.value = e.target.result;
      if (realtimeCheckbox.checked) convertObj();
    };
    reader.readAsText(file);
  }

  // コンバートボタン
  convertBtn.addEventListener('click', convertObj);

  // リアルタイム変換
  realtimeCheckbox.addEventListener('change', () => {
    if (realtimeCheckbox.checked) convertObj();
  });
  objText.addEventListener('input', () => {
    if (realtimeCheckbox.checked) convertObj();
  });

  // Tab switching logic
  const tabTables = document.getElementById('tab-tables');
  const tabLists = document.getElementById('tab-lists');
  const panelTables = document.getElementById('panel-tables');
  const panelLists = document.getElementById('panel-lists');

  tabTables.addEventListener('click', function() {
    tabTables.classList.add('active');
    tabLists.classList.remove('active');
    panelTables.style.display = '';
    panelLists.style.display = 'none';
  });
  tabLists.addEventListener('click', function() {
    tabLists.classList.add('active');
    tabTables.classList.remove('active');
    panelLists.style.display = '';
    panelTables.style.display = 'none';
  });

  // コピー機能
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = btn.getAttribute('data-target');
      const pre = document.getElementById(targetId);
      if (pre) {
        navigator.clipboard.writeText(pre.textContent).then(() => {
          btn.classList.add('copied');
          setTimeout(() => btn.classList.remove('copied'), 800);
        });
      }
    });
  });

  // OBJ→タブ区切り変換処理 & LaTeXリスト変換処理
  function convertObj() {
    const text = objText.value;
    const lines = text.split(/\r?\n/);
    let vOut = '', lOut = '', fOut = '';
    let vList = [], lList = [], fList = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('v ')) {
        // 頂点
        const vals = trimmed.slice(2).trim().split(/\s+/);
        vOut += vals.join('\t') + '\t\n';
        vList.push(vals);
      } else if (trimmed.startsWith('l ')) {
        // 線
        const vals = trimmed.slice(2).trim().split(/\s+/);
        lOut += vals.join('\t') + '\t\n';
        lList.push(vals);
      } else if (trimmed.startsWith('f ')) {
        // 面
        const vals = trimmed.slice(2).trim().split(/\s+/).map(face => {
          // 1/2/3 の場合は1だけ
          const first = face.split('/')[0];
          return first;
        });
        // 3つならそのまま、4つ以上なら三角形分割
        if (vals.length === 3) {
          fOut += vals.join('\t') + '\t\n';
          fList.push(vals);
        } else if (vals.length > 3) {
          for (let i = 1; i < vals.length - 1; i++) {
            fOut += vals[0] + '\t' + vals[i] + '\t' + vals[i + 1] + '\t\n';
            fList.push([vals[0], vals[i], vals[i + 1]]);
          }
        }
      }
    }
    vertexOutput.textContent = vOut.trim();
    edgeOutput.textContent = lOut.trim();
    faceOutput.textContent = fOut.trim();

    // LaTeXリスト生成
    function latexTuple(arr) {
      return '\\left(' + arr.join(', ') + '\\right)';
    }
    const vLatex = 'v = \\left[ ' + vList.map(latexTuple).join(', ') + ' \\right]';
    const lLatex = 'l = \\left[ ' + lList.map(l => '\\left(' + l.join(', ') + '\\right)').join(', ') + ' \\right]';
    const fLatex = 'f = \\left[ ' + fList.map(latexTuple).join(', ') + ' \\right]';
    const latexList = vLatex + '\n' + lLatex + '\n' + fLatex;
    const latexListOutput = document.getElementById('latexListOutput');
    if (latexListOutput) latexListOutput.textContent = latexList;
  }
  // Copy for LaTeX lists
  const copyLatexListBtn = document.getElementById('copyLatexListBtn');
  if (copyLatexListBtn) {
    copyLatexListBtn.addEventListener('click', function() {
      const pre = document.getElementById('latexListOutput');
      if (pre) {
        navigator.clipboard.writeText(pre.textContent).then(() => {
          copyLatexListBtn.classList.add('copied');
          setTimeout(() => copyLatexListBtn.classList.remove('copied'), 800);
        });
      }
    });
  }
});
