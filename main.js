// 유틸 함수 영역

// 각 항목이 유효한 형식인지 검사: id ≥ 1, value ≥ 0
function isValidEntry({ id, value }) {
  return (
      typeof id === 'number' &&
      id >= 1 &&
      typeof value === 'number' &&
      value >= 0
  );
}

// ID가 중복되었는지 검사
function hasDuplicateIds(dataArray) {
  const idSet = new Set();
  return dataArray.some(({ id }) => {
    if (idSet.has(id)) return true;
    idSet.add(id);
    return false;
  });
}

// JSON 텍스트를 파싱하고 유효성 검사
function parseAndValidateJSON(jsonText) {
  if (!jsonText) throw new Error("JSON 편집이 비었습니다.");
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) throw new Error("배열 형태여야 합니다.");
  if (parsed.length === 0) throw new Error("항목이 최소 1개 이상 필요합니다.");
  if (!parsed.every(isValidEntry)) throw new Error("ID는 1 이상, Value는 0 이상이어야 합니다.");
  if (hasDuplicateIds(parsed)) throw new Error("중복된 ID가 존재합니다.");
  return parsed;
}

// 메인 실행 영역

// 초기 데이터
let data = [
  { id: 1, value: 60 },
  { id: 2, value: 80 },
  { id: 3, value: 100 },
  { id: 4, value: 70 },
  { id: 5, value: 80 },
];

// DOM 요소 참조
const chartContainer = document.getElementById("chart");
const tableBody = document.getElementById("table-body");
const jsonEditor = document.getElementById("json-editor");

// 그래프 렌더링
function renderChart() {
  chartContainer.innerHTML = ''; // 기존 그래프 초기화
  const chartHeight = 400; // 전체 그래프 높이(px 기준)
  chartContainer.style.height = chartHeight + 'px';

  const maxVal = Math.max(...data.map(d => d.value), 100); // 가장 큰 value 값을 기준으로 높이 비율 계산

  data.forEach(item => {
    // 각 막대와 라벨을 감싸는 wrapper 생성
    const barWrapper = document.createElement('div');
    barWrapper.style.display = 'flex';
    barWrapper.style.flexDirection = 'column';
    barWrapper.style.alignItems = 'center';
    barWrapper.style.flex = 'unset';
    barWrapper.style.margin = '0 10px';
    barWrapper.style.minWidth = '50px';

    // 실제 막대 생성 (value 값을 height로 시각화)
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${(item.value / maxVal) * chartHeight}px`; // 최대값 기준 상대 비율로 높이 설정
    bar.innerText = item.value; // 막대 내부에 값 표시
    bar.style.width = '100%';

    // ID 라벨 (x축에 표시될 값)
    const label = document.createElement('div');
    label.className = 'x-label';
    label.innerText = item.id;

    // 그래프 영역에 추가
    barWrapper.appendChild(bar);
    barWrapper.appendChild(label);
    chartContainer.appendChild(barWrapper);
  });
}

// 테이블 렌더링
function renderTable() {
  tableBody.innerHTML = ''; // 기존 테이블 초기화

  data.forEach((item, idx) => {
    const row = document.createElement('tr');

    // ID는 수정 불가능하므로 텍스트로만 표시
    const idCell = document.createElement('td');
    idCell.innerText = item.id;

    // Value는 사용자가 직접 수정할 수 있도록 input 제공
    const valueCell = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'number';
    input.min = 0;
    input.value = item.value;
    input.dataset.index = idx; // 어떤 데이터인지 추적용 인덱스
    valueCell.appendChild(input);

    // 삭제 버튼
    const deleteCell = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.innerText = 'Delete';
    delBtn.onclick = () => {
      data.splice(idx, 1); // 해당 항목 제거
      updateAll();
    };
    deleteCell.appendChild(delBtn);

    // 테이블에 한 행 추가
    row.appendChild(idCell);
    row.appendChild(valueCell);
    row.appendChild(deleteCell);
    tableBody.appendChild(row);
  });
}

// JSON 편집기 반영
function renderJSON() {
  jsonEditor.value = JSON.stringify(data, null, 2); // 들여쓰기 포함해 JSON 문자열로 변환 후 표시
}

// 데이터 전체 업데이트 (정렬 → 렌더링)
function updateAll() {
  data.sort((a, b) => a.id - b.id); // id 오름차순 정렬
  renderChart();
  renderTable();
  renderJSON();
}

// 테이블에서 수정된 값 적용
document.getElementById('apply-table').onclick = () => {
  const inputs = tableBody.querySelectorAll('input'); // 모든 입력 필드 가져오기
  inputs.forEach(input => {
    const idx = input.dataset.index; // 수정 대상 데이터 인덱스 추출
    let newVal = parseInt(input.value); // 입력값을 숫자로 변환.
    if (isNaN(newVal) || newVal < 0) {
      alert("Value는 0 이상의 숫자여야 합니다.");
      return;
    }
    data[idx].value = newVal;
  });
  updateAll();
};

// 새 항목 추가
document.getElementById('add-btn').onclick = () => {
  const idInput = document.getElementById('new-id');
  const valueInput = document.getElementById('new-value');
  const id = parseInt(idInput.value);
  const value = parseInt(valueInput.value);

  if (!isValidEntry({ id, value })) {
    alert("ID는 1 이상, Value는 0 이상의 숫자여야 합니다.");
    return;
  }

  if (data.some(item => item.id === id)) {
    alert("중복된 ID입니다.");
    return;
  }

  data.push({ id, value });
  idInput.value = '';
  valueInput.value = '';
  updateAll();
};

// JSON 편집기에서 적용 버튼 클릭 시
document.getElementById('apply-json').onclick = () => {
  try {
    const input = jsonEditor.value.trim(); // 앞뒤 공백 제거
    const parsed = parseAndValidateJSON(input); // 유효성 검사 시작
    data = parsed; // 기존 데이터를 새로운 데이터로 덮어쓰기
    updateAll();
  } catch (e) {
    alert("JSON 오류: " + e.message); // 혹시 생각못했을 때의 에러가 발생했을 때를 대비
  }
};

// 최초 초기 렌더링
updateAll();
