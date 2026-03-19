// CTA Study Planner - Advanced Adaptive Logic (Weighted Subjects)
const CURRICULUM_DATA = {
    "재무회계": [
        "회계원리 기초", "재무보고 개념체계", "자산(현금/금융자산)", "자산(재고자산)", 
        "자산(유형자산 상)", "자산(유형자산 하)", "무형자산/투자부동산", "부채(금융부채)", 
        "부채(충당부채)", "자본계정 총괄", "수익인식 기준", "회계변경/오류수정",
        "주당이익", "리스회계", "법인세회계", "현금흐름표"
    ],
    "세법": [
        "조세총론 기초", "법인세법 익금", "법인세법 손금", "법인세법 소득처분", 
        "소득세법 종합소득", "소득세법 원천징수", "부가가치세법 과세대상", "부가가치세법 영세율", 
        "국세기본법 조세채권", "국세기본법 불복절차", "부가가치세 신고/납부", "소득세 공제/세액감면",
        "법인세 과세표준", "접대비/기부금 세무조정", "퇴직급여 세무조정"
    ],
    "원가회계": [
        "원가개념/흐름", "요소별/부문별 원가", "개별원가계산", "활동기준원가(ABC)", 
        "종합원가계산 기초", "종합원가계산 심화", "결합원가계산", "표준원가계산"
    ],
    "재정학": [
        "재정학 기초이론", "외부성과 시장실패", "공공재 이론", "공공선택이론", 
        "조세의 경제적 효과", "개별조세론(소득/소비)", "재정정책과 경제안정"
    ]
};

// State Management
let state = {
    tasks: JSON.parse(localStorage.getItem('cta_tasks')) || [],
    selectedDate: new Date().toISOString().split('T')[0],
    studyStartTime: "10:00",
    studyEndTime: "17:00",
    lunchBreak: 1.5, // hours
    isFirstRun: !localStorage.getItem('cta_tasks')
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
    addTaskForm: document.getElementById('add-task-form')
};

function init() {
    if (state.isFirstRun) {
        generateInitialPlan();
    }
    setupEventListeners();
    renderDailyView();
    updateGlobalProgress();
}

// 1. Plan Generation Logic (재무/세법 비중 강화)
function generateInitialPlan() {
    const startDate = new Date();
    let taskPool = [];
    
    // 비중 조절: 재무회계(2), 세법(2), 원가회계(1), 재정학(1) 비율로 구성
    const weightedSubjects = [
        "재무회계", "세법", "재무회계", "세법", "원가회계", "재정학"
    ];
    let datePointer = new Date(startDate);
    
    // 과목별 다음 토픽 인덱스 추적
    let subjectIndices = { "재무회계": 0, "세법": 0, "원가회계": 0, "재정학": 0 };
    
    // 매일 2개 항목씩 총 40일(80개 항목) 계획 생성
    for (let i = 0; i < 80; i++) {
        // 주말 제외 (토, 일)
        while (datePointer.getDay() === 0 || datePointer.getDay() === 6) {
            datePointer.setDate(datePointer.getDate() + 1);
        }
        
        const dateStr = datePointer.toISOString().split('T')[0];
        const subject = weightedSubjects[i % weightedSubjects.length];
        
        // 해당 과목의 커리큘럼에서 순차적으로 추출 (순환)
        const topicIndex = subjectIndices[subject] % CURRICULUM_DATA[subject].length;
        const topic = CURRICULUM_DATA[subject][topicIndex];
        subjectIndices[subject]++;
        
        taskPool.push({
            id: `plan-${i}`,
            date: dateStr,
            title: topic,
            subject: subject,
            time: 150, // 한 항목당 약 2.5시간
            completed: false,
            type: 'curriculum',
            order: i
        });
        
        // 하루에 2개씩 배정 후 다음 날로 이동
        if (i % 2 === 1) {
            datePointer.setDate(datePointer.getDate() + 1);
        }
    }
    
    state.tasks = taskPool;
    state.isFirstRun = false;
    saveState();
}

// 2. Adaptive Logic (진도에 따른 자동 수정)
function adjustFuturePlan() {
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);
    
    // 미완료된 모든 과목을 정렬
    const uncompleted = state.tasks.filter(t => !t.completed).sort((a, b) => a.order - b.order);
    
    if (uncompleted.length === 0) return;

    let datePointer = new Date(today);
    let currentDayTaskCount = 0;
    
    uncompleted.forEach(task => {
        // 주말 건너뛰기
        while (datePointer.getDay() === 0 || datePointer.getDay() === 6) {
            datePointer.setDate(datePointer.getDate() + 1);
        }
        
        task.date = datePointer.toISOString().split('T')[0];
        currentDayTaskCount++;
        
        if (currentDayTaskCount >= 2) { // 하루 2개 단원 기준
            datePointer.setDate(datePointer.getDate() + 1);
            currentDayTaskCount = 0;
        }
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

    document.getElementById('get-feedback-btn').addEventListener('click', () => {
        adjustFuturePlan();
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
        elements.taskList.innerHTML = '<li class="task-item" style="justify-content:center; color:#999;">오늘의 공식 일정이 없습니다. (주말 또는 미지정)</li>';
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
                    ${task.type === 'curriculum' ? '<span class="badge">핵심강의</span>' : ''}
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
    }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveState();
    renderDailyView();
}

function updateDailyStats() {
    const dayTasks = state.tasks.filter(t => t.date === state.selectedDate);
    const completed = dayTasks.filter(t => t.completed);
    const percent = dayTasks.length > 0 ? Math.round((completed.length / dayTasks.length) * 100) : 0;
    
    elements.progressBar.style.width = `${percent}%`;
    elements.percentageText.textContent = `${percent}%`;

    const totalAvailable = 5.5 * 60; // 10:00~17:00 minus 1.5h lunch
    const used = dayTasks.filter(t => t.completed).reduce((acc, curr) => acc + curr.time, 0);
    const remaining = Math.max(0, (totalAvailable - used) / 60);
    elements.remainingTime.textContent = `${remaining.toFixed(1)}시간`;
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
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dStr = d.toISOString().split('T')[0];
        const dayTasks = state.tasks.filter(t => t.date === dStr);
        
        if (dayTasks.length > 0 || d.getDay() !== 0 && d.getDay() !== 6) {
            const completed = dayTasks.filter(t => t.completed).length;
            const item = document.createElement('div');
            item.className = 'goal-item';
            item.innerHTML = `
                <div class="goal-info">
                    <h4>${d.getMonth()+1}/${d.getDate()} (${['일','월','화','수','목','금','토'][d.getDay()]})</h4>
                    <p>${dayTasks.length > 0 ? dayTasks.map(t => t.title).join(', ') : '휴식 또는 자율학습'}</p>
                </div>
                <div class="goal-progress">${completed}/${dayTasks.length}</div>
            `;
            container.appendChild(item);
        }
    }
}

function generateAIFeedback() {
    const today = new Date().toISOString().split('T')[0];
    const unfinished = state.tasks.filter(t => t.date <= today && !t.completed);
    
    let feedback = "";
    if (unfinished.length > 4) {
        feedback = "재무회계와 세법은 양이 방대하여 한번 밀리면 걷잡을 수 없습니다. 미이행 항목을 모두 오늘 이후로 재배치했으니, 다시 집중해봅시다!";
    } else if (unfinished.length > 0) {
        feedback = "약간의 미이행 항목이 있네요. 세법은 휘발성이 강하니 오늘 분량은 꼭 오늘 끝내는 것이 좋습니다.";
    } else {
        feedback = "완벽합니다! 재무/세법 비중을 높인 커리큘럼을 잘 소화하고 계시네요. 이대로라면 1차 합격은 확실합니다!";
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
    document.getElementById('exam-countdown').textContent = `커리큘럼 진도 ${overallPercent}% | D-320`;
}

// 최초 실행 시 또는 데이터가 없을 때 새로 생성 (비중 반영)
if (!localStorage.getItem('cta_tasks')) {
    generateInitialPlan();
}

init();
