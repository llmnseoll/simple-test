const CURRICULUM_DATA = {
    "재무회계": [
        "2장 수익: 갱신선택권 ~", "3장 건설계약", "4장 현금흐름표", "5장 재고자산과 농림어업",
        "6장 유형자산", "7장 차입원가", "8장 무형자산", "9장 금융부채", "10장 충당부채와 보고기간후사건",
        "11장 자본", "12장 금융자산(1): 지분상품과 채무상품", "13장 금융자산(2): 현금 및 수취채권",
        "14장 복합금융상품", "15장 주식기준보상", "16장 리스", "17장 법인세회계", "18장 주당이익", "19장 회계변경과 오류수정"
    ],
    "세법": [
        "법인세 Chapter 5: 손금(1) - 5.4 과다경비 및 업무무관비용 ~", "법인세 Chapter 6: 손금(2) - 접대비/기부금",
        "법인세 Chapter 7: 손금(3) - 감가상각비", "법인세 Chapter 8: 손금(4) - 지급이자",
        "법인세 Chapter 9: 손익의 귀속시기", "법인세 Chapter 10: 자산의 취득과 평가",
        "법인세 Chapter 11-13: 충당금과 준비금", "법인세 Chapter 14: 부당행위계산의 부인",
        "법인세 Chapter 15-16: 과세표준과 세액/신고납부", "국세기본법: 총칙/국세부과의 원칙",
        "국세기본법: 납세의무/확장/과세", "국세기본법: 국세환급금/불복제도",
        "소득세: 총설/이자·배당소득", "소득세: 사업소득", "소득세: 근로·연금·기타소득/소득금액특례",
        "소득세: 과세표준/세액계산/퇴직/양도소득/신고납부", "부가가치세: 총설/과세거래",
        "부가가치세: 영세율과 면세/세금계산서", "부가가치세: 과세표준과 세액계산",
        "부가가치세: 신고와 납부/간이과세"
    ],
    "원가회계": [
        "Chapter 7: 공손품회계 ~", "Chapter 8: 연산품과 부산물", "Chapter 9: 전부/변동/초변동원가계산",
        "Chapter 10: 활동기준원가계산(ABC)", "Chapter 11-12: 원가추정/CVP분석",
        "Chapter 13-14: 관련원가분석/자본예산", "Chapter 16: 종합예산",
        "Chapter 17-18: 표준원가계산", "Chapter 19-21: 성과평가/대체가격결정",
        "Chapter 22-24: 전략적 원가관리/BSC"
    ],
    "재정학": [
        "제2편 외부성/공공재/공공선택: 핵심문제 18번 ~", "제3편 공공지출이론/비용편익분석",
        "제4편 조세의 기초/전가와 귀착", "제5편 조세의 초과부담/최적과세론",
        "제6편 개별조세이론/조세의 경제적 효과", "제7편 소득분배/사회보장/공공요금",
        "제7편 공채론/지방재정"
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
    aiFeedback: document.getElementById('ai-feedback'),
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
    generateAIFeedback(); 
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
        let mainSub, minorSub;
        if (dayCounter % 2 === 0) {
            [mainSub, minorSub] = ["세법", "재정학"];
        } else {
            [mainSub, minorSub] = ["재무회계", "원가회계"];
        }

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
    if (completedTask.type !== 'curriculum') return; // 기본 커리큘럼 항목만 복습

    const completionDate = new Date(state.selectedDate);

    REVIEW_INTERVALS.forEach(interval => {
        const reviewDate = new Date(completionDate);
        reviewDate.setDate(reviewDate.getDate() + interval);
        
        // 주말이면 다음 월요일로 조정
        if (reviewDate.getDay() === 0) reviewDate.setDate(reviewDate.getDate() + 1);
        if (reviewDate.getDay() === 6) reviewDate.setDate(reviewDate.getDate() + 2);

        const reviewDateStr = reviewDate.toISOString().split('T')[0];
        const reviewTitle = `[${interval}일차 복습] ${completedTask.title}`;
        
        // 기존 복습이 있는지 확인 (ID 기반)
        const existingReview = state.tasks.find(t => 
            t.type === 'review' && 
            t.originalTaskId === completedTask.id && 
            t.title.includes(`[${interval}일차 복습]`)
        );

        if (!existingReview) {
             state.tasks.push(createTask(reviewDateStr, completedTask.subject, reviewTitle, 30, 'review', 9000, completedTask.id));
        }
    });
}

function adjustForLateStart() {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = state.tasks.filter(t => t.date === todayStr && t.type === 'curriculum' && !t.completed);

    if (todayTasks.length >= 2) {
        todayTasks.sort((a, b) => a.time - b.time);
        const taskToRemove = todayTasks[0];
        state.tasks = state.tasks.filter(t => t.id !== taskToRemove.id);
        saveState();
        renderDailyView();
        return `현실적인 학습을 위해 오늘은 1과목에 집중하도록 계획을 조정했어요. (${taskToRemove.subject} 제외)`;
    }
    return "이미 계획이 1과목이거나 조정할 일정이 없네요. 바로 시작하세요!";
}

function adjustFuturePlan(fromToday = true) {
    const startDate = fromToday ? new Date() : new Date(state.selectedDate);
    const uncompleted = state.tasks.filter(t => t.type === 'curriculum' && !t.completed).sort((a, b) => a.order - b.order);
    if (uncompleted.length === 0) return;

    const uniqueDayGroups = [...new Set(uncompleted.map(t => Math.floor(t.order / 10)))].sort((a,b)=>a-b);
    let currentProcessingDate = startDate;

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
        alert("설정이 저장되었습니다. 진도를 초기화하여 새 학습 시간을 반영해주세요.");
        renderDailyView();
    });

    elements.resetCurriculumBtn.addEventListener('click', () => {
        if (confirm("모든 진도 데이터를 삭제하고 현재 설정에 맞춰 새로 생성하시겠습니까?")) {
            generateInitialPlan();
            renderDailyView();
            updateGlobalProgress();
        }
    });

    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
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
            adjustFuturePlan(true);
             addChatMessage("네, 알겠습니다! 📅 오늘부터 밀린 일정을 재배치했습니다. 주간 계획을 확인해보세요.", 'bot');
        } else if (lowerText.includes("안녕")) {
            addChatMessage("안녕하세요! 오늘도 합격을 위해 달려봅시다. 🔥", 'bot');
        } else {
            addChatMessage("제가 이해할 수 있는 말은 '진도 수정해줘' 또는 '오후 2시에 시작할게' 같은 거예요.", 'bot');
        }
    }, 500);
}

function renderDailyView() {
    elements.taskList.innerHTML = '';
    const dayTasks = state.tasks.filter(t => t.date === state.selectedDate).sort((a,b) => a.order - b.order);
    
    if (dayTasks.length === 0) {
        elements.taskList.innerHTML = '<li class="task-item" style="justify-content:center; color:#999;">계획된 일정이 없습니다.</li>';
    }

    dayTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''} type-${task.type}`;
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
        generateAIFeedback();
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
    const totalTime = getStudyTimePerDay();
    elements.remainingTime.textContent = `${(totalTime / 60).toFixed(1)}시간`;
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
                    <p>${dayTasks.length > 0 ? dayTasks.map(t => `<span class="tiny-tag type-${t.type}">${t.subject}</span> ${t.title}`).join('<br>') : '자율학습'}</p>
                </div>
                <div class="goal-progress">${completed}/${dayTasks.length}</div>
            `;
            container.appendChild(item);
        }
    }
}

function generateAIFeedback() {
    const today = new Date().toISOString().split('T')[0];
    const uncompleted = state.tasks.filter(t => t.date < today && t.type === 'curriculum' && !t.completed);
    let feedback = "";
    if (uncompleted.length > 5) {
        feedback = `진도가 ${uncompleted.length}개나 밀렸어요! AI 코치에게 '진도 수정해줘'라고 말해서 계획을 재설정하세요.`;
    } else if (uncompleted.length > 0) {
        feedback = `진도가 ${uncompleted.length}개 밀렸네요. 조금만 더 힘내세요! '진도 수정'을 요청할 수 있습니다.`
    } else {
        feedback = "훌륭합니다! 계획대로 잘 진행하고 계십니다. 이 속도를 유지하세요!";
    }
    elements.aiFeedback.textContent = feedback;
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
window.toggleChat = () => elements.chatWidget.classList.toggle('open');
window.sendMessage = sendMessage;

init();
