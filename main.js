const CURRICULUM_DATA = {
    "재무회계": [
        "2장 수익", "3장 건설계약", "4장 현금흐름표", "5장 재고자산과 농림어업",
        "6장 유형자산", "7장 차입원가", "8장 무형자산", "9장 금융부채",
        "10장 충당부채와 보고기간후사건", "11장 자본", "12장 금융자산(지분/채무)",
        "13장 금융자산(현금/수취채권)", "14장 복합금융상품", "15장 주식기준보상",
        "16장 리스", "17장 법인세회계", "18장 주당이익", "19장 회계변경과 오류수정"
    ],
    "세법": [
        "법인세 5장 손금", "6장 접대비/기부금", "7장 감가상각비", "8장 지급이자",
        "9장 손익의 귀속시기", "10장 자산의 취득과 평가", "11-13장 충당금과 준비금",
        "14장 부당행위계산의 부인", "15-16장 과세표준과 세액", "국기법 총칙/국세부과",
        "국기법 납세의무/확장/과세", "국기법 국세환급금/불복제도", "소득세 총설/이자·배당",
        "소득세 사업소득", "소득세 근로·연금·기타소득", "소득세 과세표준/세액계산",
        "소득세 퇴직/양도소득/신고납부", "부가세 총설/과세거래", "부가세 영세율과 면세/세금계산서",
        "부가세 과세표준과 세액계산", "부가세 신고와 납부/간이과세"
    ],
    "원가회계": [
        "7장 공손품회계", "8장 연산품과 부산물", "9장 전부/변동/초변동원가계산", "10장 활동기준원가계산(ABC)",
        "11-12장 원가추정/CVP분석", "13-14장 관련원가분석/자본예산", "16장 종합예산",
        "17-18장 표준원가계산", "19-21장 성과평가/대체가격결정", "22-24장 전략적 원가관리"
    ],
    "재정학": [
        "2편 후생경제학(외부성/공공재)", "3편 공공지출/비용편익분석", "4편 조세의 전가와 귀착",
        "5편 조세의 초과부담/최적과세론", "6편 개별조세의 경제적 효과", "7편 소득분배/사회보장", "7편 공채론/지방재정"
    ]
};

const REVIEW_INTERVALS = [1, 3, 7, 14, 30]; // 복습 주기 (일)

// State Management
let state = {
    tasks: JSON.parse(localStorage.getItem('cta_tasks')) || [],
    settings: JSON.parse(localStorage.getItem('cta_settings')) || {
        startTime: "09:00",
        endTime: "22:00",
        breakTime: 2,
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
    tabBtns: document.querySelectorAll('.tab-btn'),
    viewContents: document.querySelectorAll('.view-content'),
    addTaskForm: document.getElementById('add-task-form'),
    startTime: document.getElementById('start-time'),
    endTime: document.getElementById('end-time'),
    breakTime: document.getElementById('break-time'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    resetCurriculumBtn: document.getElementById('reset-curriculum-btn'),
    chatWidget: document.getElementById('chat-widget'),
    chatBody: document.getElementById('chat-body'),
    chatInput: document.getElementById('chat-input')
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

function getStudyTimePerDay() {
    const start = state.settings.startTime.split(':').map(Number);
    const end = state.settings.endTime.split(':').map(Number);
    const startMins = start[0] * 60 + start[1];
    const endMins = end[0] * 60 + end[1];
    return (endMins - startMins) - (state.settings.breakTime * 60);
}

function generateInitialPlan(startDateStr = null) {
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    let taskPool = [];
    let subjectIndices = { "재무회계": 0, "세법": 0, "원가회계": 0, "재정학": 0 };
    let datePointer = new Date(startDate);
    let dayCounter = 0;
    let finished = false;

    const totalTimePerDay = getStudyTimePerDay();
    const mainSubTime = totalTimePerDay * 0.7; // 70%
    const minorSubTime = totalTimePerDay * 0.3; // 30%

    while (!finished) {
        if (datePointer.getDay() === 0 || datePointer.getDay() === 6) { // 주말 제외
            datePointer.setDate(datePointer.getDate() + 1);
            continue;
        }

        const dateStr = datePointer.toISOString().split('T')[0];
        const [mainSub, minorSub] = (dayCounter % 2 === 0) ? ["세법", "재정학"] : ["재무회계", "원가회계"];

        if (subjectIndices[mainSub] < CURRICULUM_DATA[mainSub].length) {
            taskPool.push(createTask(dateStr, mainSub, CURRICULUM_DATA[mainSub][subjectIndices[mainSub]], mainSubTime, 'curriculum', dayCounter * 10));
            subjectIndices[mainSub]++;
        }

        if (subjectIndices[minorSub] < CURRICULUM_DATA[minorSub].length) {
            taskPool.push(createTask(dateStr, minorSub, CURRICULUM_DATA[minorSub][subjectIndices[minorSub]], minorSubTime, 'curriculum', dayCounter * 10 + 1));
            subjectIndices[minorSub]++;
        }

        dayCounter++;
        datePointer.setDate(datePointer.getDate() + 1);
        finished = Object.keys(CURRICULUM_DATA).every(sub => subjectIndices[sub] >= CURRICULUM_DATA[sub].length);
        if (dayCounter > 365) break; // 무한 루프 방지
    }
    
    state.tasks = taskPool;
    saveState();
}

function createTask(date, subject, title, time, type, order, originalId = null) {
    return {
        id: type === 'review' ? `rev-${originalId}-${Date.now()}` : `task-${Date.now()}-${Math.random()}`,
        date,
        title,
        subject,
        time: Math.round(time / 5) * 5, // 5분 단위로 반올림
        completed: false,
        type, // curriculum, review, manual
        order, // 정렬 순서
        originalTaskId: originalId // 복습 태스크의 원본 태스크 ID
    };
}

// --- 지능형 기능 --- //
function scheduleReviewTasks(completedTask) {
    if (completedTask.type !== 'curriculum') return;

    const completionDate = new Date(state.selectedDate);
    REVIEW_INTERVALS.forEach(interval => {
        const reviewDate = new Date(completionDate);
        reviewDate.setDate(reviewDate.getDate() + interval);
        
        if (reviewDate.getDay() === 0) reviewDate.setDate(reviewDate.getDate() + 1);
        if (reviewDate.getDay() === 6) reviewDate.setDate(reviewDate.getDate() + 2);

        const reviewDateStr = reviewDate.toISOString().split('T')[0];
        const reviewTitle = `${completedTask.title}`;
        
        const existingReview = state.tasks.find(t => t.type === 'review' && t.originalTaskId === completedTask.id && t.date === reviewDateStr);

        if (!existingReview) {
             state.tasks.push(createTask(reviewDateStr, completedTask.subject, reviewTitle, 30, 'review', 9000 + interval, completedTask.id));
        }
    });
}

function adjustForLateStart() {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = state.tasks.filter(t => t.date === todayStr && t.type === 'curriculum' && !t.completed);

    if (todayTasks.length >= 2) {
        todayTasks.sort((a, b) => a.time - b.time);
        const taskToRemove = todayTasks[0]; // 중요도 낮은 과목 제거
        state.tasks = state.tasks.filter(t => t.id !== taskToRemove.id);
        
        // 남은 과목 시간 재조정
        const remainingTask = todayTasks.find(t => t.id !== taskToRemove.id);
        if(remainingTask) remainingTask.time = getStudyTimePerDay();

        saveState();
        renderDailyView();
        return `오늘은 1과목에 집중하도록 계획을 조정했어요. (${taskToRemove.subject} 제외)`;
    }
    return "이미 1과목만 남았거나, 조정할 일정이 없네요. 바로 시작하세요!";
}

function adjustFuturePlan() {
    const today = new Date();
    const uncompleted = state.tasks.filter(t => t.type === 'curriculum' && !t.completed).sort((a, b) => a.order - b.order);
    if (uncompleted.length === 0) return;

    const uniqueDayGroups = [...new Set(uncompleted.map(t => Math.floor(t.order / 10)))].sort((a,b)=>a-b);
    let currentProcessingDate = today;

    uniqueDayGroups.forEach(dayGroup => {
        while (currentProcessingDate.getDay() === 0 || currentProcessingDate.getDay() === 6) {
            currentProcessingDate.setDate(currentProcessingDate.getDate() + 1);
        }
        const newDateStr = currentProcessingDate.toISOString().split('T')[0];
        uncompleted.filter(t => Math.floor(t.order / 10) === dayGroup).forEach(t => { t.date = newDateStr; });
        currentProcessingDate.setDate(currentProcessingDate.getDate() + 1);
    });

    saveState();
    renderDailyView();
}

// --- UI & 이벤트 리스너 --- //
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
        state.tasks.push(createTask(state.selectedDate, subject, title, time, 'manual', 9999));
        saveState();
        renderDailyView();
        elements.addTaskForm.reset();
    });

    elements.saveSettingsBtn.addEventListener('click', () => {
        state.settings = {
            startTime: elements.startTime.value,
            endTime: elements.endTime.value,
            breakTime: parseFloat(elements.breakTime.value),
        };
        localStorage.setItem('cta_settings', JSON.stringify(state.settings));
        alert("설정이 저장되었습니다. 새 학습 시간을 적용하려면 '진도 전체 초기화'를 진행해주세요.");
        renderDailyView();
    });

    elements.resetCurriculumBtn.addEventListener('click', () => {
        if (confirm("모든 학습 기록과 복습 일정이 삭제됩니다. 현재 설정에 맞춰 전체 계획을 새로 생성하시겠습니까?")) {
            generateInitialPlan();
            renderDailyView();
            updateGlobalProgress();
        }
    });

    elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing) { // 한영 변환 중 Enter 방지
            e.preventDefault();
            sendMessage();
        }
    });
}

function sendMessage() {
    const text = elements.chatInput.value.trim();
    if (!text) return;
    addChatMessage(text, 'user');
    elements.chatInput.value = '';

    const lowerText = text.toLowerCase();
    const isAdjustmentRequest = /수정|조정|밀렸어|다시/.test(lowerText);
    const isLateStartRequest = /늦었|지금 시작|오후 2시|2시에 시작/.test(lowerText);

    setTimeout(() => {
        if (isLateStartRequest) {
            const adjustmentMessage = adjustForLateStart();
            addChatMessage(`네, 알겠습니다! 늦은 시작도 괜찮아요. 중요한 건 '시작' 그 자체입니다. 🔥 ${adjustmentMessage}`, 'bot');
        } else if (isAdjustmentRequest) {
            adjustFuturePlan();
             addChatMessage("네, 알겠습니다! 📅 오늘부터 밀린 일정을 재배치했습니다. 주간 계획을 확인해보세요.", 'bot');
        } else if (lowerText.includes("안녕")) {
            addChatMessage("안녕하세요! 오늘도 합격을 위해 달려봅시다. 🔥", 'bot');
        } else {
            addChatMessage("제가 이해할 수 있는 말은 '진도 수정해줘' 또는 '오후 2시에 시작할게' 같은 거예요.", 'bot');
        }
    }, 500);
}

function addChatMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.textContent = text;
    elements.chatBody.appendChild(div);
    elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
}

function renderDailyView() {
    elements.taskList.innerHTML = '';
    const dayTasks = state.tasks.filter(t => t.date === state.selectedDate).sort((a,b) => a.order - b.order);
    
    if (dayTasks.length === 0) {
        elements.taskList.innerHTML = '<li class="task-item" style="justify-content:center; color:#999;">계획된 일정이 없습니다.</li>';
    }

    dayTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item type-${task.type} ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="task-checkbox" onclick="toggleTask('${task.id}')"></div>
            <div class="task-info">
                <span class="task-title">${task.title}</span>
                <div class="task-meta">
                    <span class="subject-tag subject-${task.subject}">${task.subject}</span> | 
                    <span><i class="far fa-clock"></i> ${task.time}분</span>
                </div>
            </div>
            <i class="fas fa-trash-alt" onclick="deleteTask('${task.id}')"></i>
        `;
        elements.taskList.appendChild(li);
    });
    updateDailyStats();
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            scheduleReviewTasks(task);
        }
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
    const totalTime = getStudyTimePerDay();
    elements.remainingTime.textContent = `${(totalTime / 60).toFixed(1)}시간`;

    const dayTasks = state.tasks.filter(t => t.date === state.selectedDate);
    const completed = dayTasks.filter(t => t.completed);
    const percent = dayTasks.length > 0 ? Math.round((completed.length / dayTasks.length) * 100) : 0;
    elements.progressBar.style.width = `${percent}%`;
    elements.percentageText.textContent = `${percent}%`;
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
        if (d.getDay() === 0 || d.getDay() === 6) continue;

        const dStr = d.toISOString().split('T')[0];
        const dayTasks = state.tasks.filter(t => t.date === dStr);
        const completed = dayTasks.filter(t => t.completed).length;
        const item = document.createElement('div');
        item.className = 'goal-item';
        const dayName = ['일','월','화','수','목','금','토'][d.getDay()];
        item.innerHTML = `
            <div class="goal-info">
                <h4>${d.getMonth()+1}/${d.getDate()} (${dayName})</h4>
                <p>${dayTasks.length > 0 ? dayTasks.map(t => `<span class="tiny-tag type-${t.type}">${t.subject}</span> ${t.title}`).join('<br>') : '자율학습'}</p>
            </div>
            <div class="goal-progress">${completed}/${dayTasks.length}</div>
        `;
        container.appendChild(item);
    }
}

function saveState() {
    localStorage.setItem('cta_tasks', JSON.stringify(state.tasks));
}

function updateGlobalProgress() {
    const total = state.tasks.filter(t => t.type === 'curriculum').length;
    if (total === 0) return;
    const completed = state.tasks.filter(t => t.type === 'curriculum' && t.completed).length;
    const overallPercent = Math.round((completed / total) * 100);
    document.getElementById('exam-countdown').textContent = `전체 진도율: ${overallPercent}%`;
}

// --- Global Access --- //
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.toggleChat = () => {
    const widget = elements.chatWidget;
    widget.classList.toggle('open');
    if(widget.classList.contains('open')) {
        elements.chatInput.focus();
    }
}
window.sendMessage = sendMessage;

init();
