// CTA Study Planner - Adaptive Curriculum Logic
const CURRICULUM_DATA = {
    "재무회계": [
        "개념체계와 재무제표 표시", "수익", "건설계약", "현금흐름표", "재고자산과 농림어업",
        "유형자산", "차입원가", "무형자산", "금융부채", "충당부채와 보고기간후사건",
        "자본", "금융자산(1): 지분상품과 채무상품", "금융자산(2): 현금 및 수취채권",
        "복합금융상품", "주식기준보상", "리스", "법인세회계", "주당이익", "회계변경과 오류수정"
    ],
    "세법": [
        "법인세: 총설", "법인세: 세무조정과 소득처분", "법인세: 익금의 범위/의제배당", 
        "법인세: 손금의 범위/접대비/기부금", "법인세: 감가상각비/지급이자", "법인세: 손익의 귀속시기/자산평가",
        "법인세: 충당금과 준비금", "법인세: 부당행위계산의 부인", "법인세: 과세표준과 세액/신고납부",
        "국세기본법: 총칙/국세부과의 원칙", "국세기본법: 납세의무/확장", "국세기본법: 국세와 일반채권/과세",
        "국세기본법: 국세환급금/불복제도", "소득세: 총설/이자·배당소득", "소득세: 사업소득",
        "소득세: 근로·연금·기타소득/소득금액특례", "소득세: 과세표준/세액계산", "소득세: 퇴직/양도소득/신고납부",
        "부가가치세: 총설/과세거래", "부가가치세: 영세율과 면세/세금계산서", "부가가치세: 과세표준과 세액계산",
        "부가가치세: 신고와 납부/간이과세"
    ],
    "원가회계": [
        "원가관리회계의 개념/분류", "제조기업의 원가의 흐름", "원가배분/보조부문원가", "개별원가계산",
        "종합원가계산/공손품", "연산품과 부산물", "전부/변동/초변동원가계산", "활동기준원가계산(ABC)",
        "원가추정/CVP분석", "관련원가분석/자본예산", "종합예산/표준원가계산", "성과평가/대체가격결정",
        "전략적 원가관리/BSC"
    ],
    "재정학": [
        "재정학 기초/시장실패", "외부성/공공재이론", "공공선택이론", "정부지출/예산제도/비용편익분석",
        "조세의 기초/전가와 귀착", "조세와 효율성/최적과세론", "개별조세이론/조세의 경제적 효과",
        "소득분배/사회보장/공공요금", "공채론/지방재정"
    ]
};

// State Management
let state = {
    tasks: JSON.parse(localStorage.getItem('cta_tasks')) || [],
    settings: JSON.parse(localStorage.getItem('cta_settings')) || {
        startTime: "09:00",
        endTime: "22:00",
        breakTime: 2
    },
    selectedDate: new Date().toISOString().split('T')[0]
};

// DOM Elements
const elements = {
    dateInput: document.getElementById('selected-date'),
    taskList: document.getElementById('task-list'),
    progressBar: document.getElementById('daily-progress-bar'),
    percentageText: document.getElementById('daily-percentage'),
    remainingTime: document.getElementById('remaining-time'),
    aiFeedback: document.getElementById('ai-feedback'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    viewContents: document.querySelectorAll('.view-content'),
    addTaskForm: document.getElementById('add-task-form'),
    startTime: document.getElementById('start-time'),
    endTime: document.getElementById('end-time'),
    breakTime: document.getElementById('break-time'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    resetCurriculumBtn: document.getElementById('reset-curriculum-btn'),
    adjustPlanBtn: document.getElementById('adjust-plan-btn')
};

function init() {
    if (state.tasks.length === 0) {
        generateInitialPlan();
    }
    loadSettingsUI();
    setupEventListeners();
    renderDailyView();
    updateGlobalProgress();
}

function loadSettingsUI() {
    elements.startTime.value = state.settings.startTime;
    elements.endTime.value = state.settings.endTime;
    elements.breakTime.value = state.settings.breakTime;
}

// 1. Plan Generation Logic (Alternating: Tax/Financial)
function generateInitialPlan(startDateStr = null) {
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    let taskPool = [];
    
    let subjectIndices = { "재무회계": 0, "세법": 0, "원가회계": 0, "재정학": 0 };
    let datePointer = new Date(startDate);
    
    // Total steps = max curriculum length * 2 (roughly)
    const maxLen = Math.max(...Object.values(CURRICULUM_DATA).map(v => v.length));
    
    let dayCounter = 0;
    let finished = false;

    while (!finished) {
        // Skip weekends
        while (datePointer.getDay() === 0 || datePointer.getDay() === 6) {
            datePointer.setDate(datePointer.getDate() + 1);
        }

        const dateStr = datePointer.toISOString().split('T')[0];
        let subjectsToday = [];

        // Alternating logic:
        // Day 0, 2, 4... : Financial Accounting (Main) + Cost Accounting
        // Day 1, 3, 5... : Tax Law (Main) + Public Finance
        if (dayCounter % 2 === 0) {
            subjectsToday = ["재무회계", "원가회계"];
        } else {
            subjectsToday = ["세법", "재정학"];
        }

        subjectsToday.forEach(sub => {
            if (subjectIndices[sub] < CURRICULUM_DATA[sub].length) {
                taskPool.push({
                    id: `plan-${sub}-${subjectIndices[sub]}`,
                    date: dateStr,
                    title: CURRICULUM_DATA[sub][subjectIndices[sub]],
                    subject: sub,
                    time: sub === "재무회계" || sub === "세법" ? 180 : 120,
                    completed: false,
                    type: 'curriculum',
                    order: dayCounter * 10 + (sub === "재무회계" || sub === "세법" ? 0 : 1)
                });
                subjectIndices[sub]++;
            }
        });

        dayCounter++;
        datePointer.setDate(datePointer.getDate() + 1);

        // Check if all curriculum finished
        finished = Object.keys(CURRICULUM_DATA).every(sub => subjectIndices[sub] >= CURRICULUM_DATA[sub].length);
        if (dayCounter > 200) break; // Safety break
    }
    
    state.tasks = taskPool;
    saveState();
}

// 2. Adaptive Logic (Adjust from today or selected date)
function adjustFuturePlan(fromToday = true) {
    const startFrom = fromToday ? new Date().toISOString().split('T')[0] : state.selectedDate;
    const uncompleted = state.tasks.filter(t => !t.completed).sort((a, b) => a.order - b.order);
    
    if (uncompleted.length === 0) return;

    let datePointer = new Date(startFrom);
    let dayCounter = 0;
    
    // We need to maintain the alternating pattern
    // Determine if startFrom should be a "Financial" or "Tax" day
    // For simplicity, let's reset dayCounter and keep current pattern of tasks
    
    let lastDate = "";
    let tasksOnCurrentDay = 0;

    // Group tasks by their original "day" type (Financial/Cost vs Tax/Public)
    // Actually, just re-assigning dates to uncompleted tasks sequentially is easier
    
    let currentDayType = 0; // 0 for Fin/Cost, 1 for Tax/Pub
    
    uncompleted.forEach((task, idx) => {
        // This is tricky because we want to keep Fin/Cost together and Tax/Pub together
        // Let's just distribute them onto new dates
        
        // Find if this task belongs to the next available slot
        // For now, let's just shift dates
    });

    // Simple shift logic for now:
    let dateMap = new Map();
    let dPtr = new Date(startFrom);
    let subjectsFinishedForDay = new Set();
    
    // Logic: Keep tasks that were on the same day together
    const originalDays = [...new Set(uncompleted.map(t => t.date))];
    
    originalDays.forEach(oldDate => {
        while (dPtr.getDay() === 0 || dPtr.getDay() === 6) {
            dPtr.setDate(dPtr.getDate() + 1);
        }
        const newDateStr = dPtr.toISOString().split('T')[0];
        uncompleted.filter(t => t.date === oldDate).forEach(t => {
            t.date = newDateStr;
        });
        dPtr.setDate(dPtr.getDate() + 1);
    });

    saveState();
    renderDailyView();
}

// UI & Interaction
function setupEventListeners() {
    elements.dateInput.value = state.selectedDate;
    elements.dateInput.addEventListener('change', (e) => {
        state.selectedDate = e.target.value;
        renderDailyView();
    });

    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    elements.addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const subject = document.getElementById('task-subject').value;
        const time = parseInt(document.getElementById('task-time').value);
        
        state.tasks.push({
            id: Date.now().toString(),
            date: state.selectedDate,
            title, subject, time,
            completed: false,
            type: 'manual',
            order: 9999
        });
        saveState();
        renderDailyView();
        elements.addTaskForm.reset();
    });

    elements.saveSettingsBtn.addEventListener('click', () => {
        state.settings = {
            startTime: elements.startTime.value,
            endTime: elements.endTime.value,
            breakTime: parseFloat(elements.breakTime.value)
        };
        localStorage.setItem('cta_settings', JSON.stringify(state.settings));
        alert("설정이 저장되었습니다. 가용 시간이 업데이트됩니다.");
        renderDailyView();
    });

    elements.resetCurriculumBtn.addEventListener('click', () => {
        if (confirm("모든 진도 데이터를 삭제하고 새로 생성하시겠습니까?")) {
            generateInitialPlan();
            renderDailyView();
            updateGlobalProgress();
        }
    });

    elements.adjustPlanBtn.addEventListener('click', () => {
        adjustFuturePlan(true);
        generateAIFeedback();
    });

    document.getElementById('get-feedback-btn').addEventListener('click', () => {
        generateAIFeedback();
    });

    document.getElementById('add-review-task').addEventListener('click', () => {
        const completed = state.tasks.filter(t => t.completed);
        if (completed.length > 0) {
            const random = completed[Math.floor(Math.random() * completed.length)];
            state.tasks.push({
                id: `rev-${Date.now()}`,
                date: state.selectedDate,
                title: `[누적복습] ${random.title}`,
                subject: random.subject,
                time: 60,
                completed: false,
                type: 'review',
                order: 8888
            });
            saveState();
            renderDailyView();
        }
    });
}

function renderDailyView() {
    elements.taskList.innerHTML = '';
    const dayTasks = state.tasks.filter(t => t.date === state.selectedDate);
    
    if (dayTasks.length === 0) {
        elements.taskList.innerHTML = '<li class="task-item" style="justify-content:center; color:#999;">계획된 일정이 없습니다.</li>';
    }

    dayTasks.sort((a, b) => a.order - b.order).forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="task-checkbox" onclick="toggleTask('${task.id}')"></div>
            <div class="task-info">
                <span class="task-title">${task.title}</span>
                <div class="task-meta">
                    <span class="subject-tag subject-${task.subject}">${task.subject}</span> | 
                    <span><i class="far fa-clock"></i> ${task.time}분</span>
                </div>
            </div>
            <i class="fas fa-trash-alt" style="color:#e74c3c; cursor:pointer;" onclick="deleteTask('${task.id}')"></i>
        `;
        elements.taskList.appendChild(li);
    });

    updateDailyStats();
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveState();
        renderDailyView();
        updateGlobalProgress();
    }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveState();
    renderDailyView();
    updateGlobalProgress();
}

function updateDailyStats() {
    const dayTasks = state.tasks.filter(t => t.date === state.selectedDate);
    const completed = dayTasks.filter(t => t.completed);
    const percent = dayTasks.length > 0 ? Math.round((completed.length / dayTasks.length) * 100) : 0;
    
    elements.progressBar.style.width = `${percent}%`;
    elements.percentageText.textContent = `${percent}%`;

    // Calculate Available Time
    const start = state.settings.startTime.split(':');
    const end = state.settings.endTime.split(':');
    const startMin = parseInt(start[0]) * 60 + parseInt(start[1]);
    const endMin = parseInt(end[0]) * 60 + parseInt(end[1]);
    const totalAvailableMin = (endMin - startMin) - (state.settings.breakTime * 60);
    
    elements.remainingTime.textContent = `${(totalAvailableMin / 60).toFixed(1)}시간 (휴식 제외)`;
}

function switchView(viewName) {
    elements.tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewName));
    elements.viewContents.forEach(content => content.classList.toggle('active', content.id === `${viewName}-view`));
    
    if (viewName === 'weekly') renderWeeklyView();
}

function renderWeeklyView() {
    const container = document.getElementById('weekly-goals');
    container.innerHTML = '';
    
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dStr = d.toISOString().split('T')[0];
        const dayTasks = state.tasks.filter(t => t.date === dStr);
        
        if (dayTasks.length > 0 || (d.getDay() !== 0 && d.getDay() !== 6)) {
            const completed = dayTasks.filter(t => t.completed).length;
            const item = document.createElement('div');
            item.className = 'goal-item';
            const dayName = ['일','월','화','수','목','금','토'][d.getDay()];
            item.innerHTML = `
                <div class="goal-info">
                    <h4>${d.getMonth()+1}/${d.getDate()} (${dayName})</h4>
                    <p>${dayTasks.length > 0 ? dayTasks.map(t => `<span class="tiny-tag">${t.subject}</span> ${t.title}`).join('<br>') : '자율학습'}</p>
                </div>
                <div class="goal-progress">${completed}/${dayTasks.length}</div>
            `;
            container.appendChild(item);
        }
    }
}

function generateAIFeedback() {
    const today = new Date().toISOString().split('T')[0];
    const unfinished = state.tasks.filter(t => t.date < today && !t.completed);
    
    let feedback = "";
    if (unfinished.length > 4) {
        feedback = "진도가 조금 밀렸습니다. '진도 재조정' 버튼을 눌러 오늘부터의 계획을 다시 짜보세요. 재무와 세법은 꾸준함이 생명입니다!";
    } else if (unfinished.length > 0) {
        feedback = "어제 못한 공부가 있네요. 오늘 조금 더 힘내서 보충하거나 계획을 미뤄봅시다.";
    } else {
        feedback = "훌륭합니다! 계획대로 아주 잘 진행되고 있어요. 특히 김영덕/유은종 저자의 책은 예제가 중요하니 꼼꼼히 풀어보세요.";
    }
    elements.aiFeedback.textContent = feedback;
}

function saveState() {
    localStorage.setItem('cta_tasks', JSON.stringify(state.tasks));
}

function updateGlobalProgress() {
    const total = state.tasks.filter(t => t.type === 'curriculum').length;
    const completed = state.tasks.filter(t => t.type === 'curriculum' && t.completed).length;
    const overallPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('exam-countdown').textContent = `전체 커리큘럼 진도: ${overallPercent}% 완료`;
}

window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

init();
